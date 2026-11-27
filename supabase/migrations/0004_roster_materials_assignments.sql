-- 0004_roster_materials_assignments.sql — roster, teacher material library, assignments (UC-08 assign only).
-- Team decisions (2026-11-28): extend existing tables instead of adding parallel ones:
--   * students = profiles(role='student') + roll_no, class_id, archived_at   (enrollments is folded in, then dropped)
--   * materials = lessons(visibility='assigned'), items = lesson_items         (chapter becomes optional)
--   * levels stay basic | medium | advanced (SRS); the brief's easy|medium|hard map 1:1
--   * assignments = material + due_date; who gets it lives in assignment_targets
-- Safe on a fresh DB (after 0001–0003) and on a DB with data. It STOPS (raises) instead of guessing
-- when existing data can't be mapped cleanly. Runs as one transaction: all or nothing.

begin;

-- ── 1. Roster: students live on profiles ─────────────────────────────────────
alter table public.profiles
  add column roll_no     text,
  add column class_id    uuid references public.classes (id) on delete restrict, -- a class with students can't be deleted
  add column archived_at timestamptz;

do $$
begin
  if exists (select student_id from public.enrollments group by student_id having count(*) > 1) then
    raise exception 'Migration 0004 stopped: a student is enrolled in more than one class. One class per student is required; fix enrollments by hand first.';
  end if;
end $$;

update public.profiles p set class_id = e.class_id
from public.enrollments e where e.student_id = p.id and p.role = 'student';

do $$
begin
  if exists (select 1 from public.profiles where role = 'student' and class_id is null) then
    raise exception 'Migration 0004 stopped: a student has no class. Enrol every student in exactly one class first.';
  end if;
end $$;

-- Existing students had no roll numbers: give them 1, 2, 3… per class, in name order.
update public.profiles p set roll_no = r.rn::text
from (
  select id, row_number() over (partition by class_id order by name, created_at, id) as rn
  from public.profiles where role = 'student'
) r
where r.id = p.id;

alter table public.profiles
  add constraint profiles_student_has_class check (role <> 'student' or (class_id is not null and roll_no is not null)),
  add constraint profiles_class_only_students check (role = 'student' or (class_id is null and roll_no is null)),
  add constraint profiles_roll_no_format check (roll_no is null or (roll_no = btrim(roll_no) and length(roll_no) between 1 and 20)),
  add constraint profiles_name_trimmed check (name = btrim(name)),
  add constraint profiles_class_roll_unique unique (class_id, roll_no);
create index profiles_class_id_idx on public.profiles (class_id);

drop table public.enrollments;

-- ── 2. Classes: name required, trimmed, unique (case-insensitive) ────────────
update public.classes set name = btrim(name);
alter table public.classes
  add constraint classes_name_trimmed check (name = btrim(name) and length(name) >= 1),
  alter column join_code drop not null; -- no login in FYP-1 (ADR-002), so join codes are unused
create unique index classes_name_unique on public.classes (lower(name));

-- ── 3. Materials = teacher lessons ───────────────────────────────────────────
alter table public.lessons
  alter column chapter_id drop not null,
  add column updated_at timestamptz not null default now(),
  add constraint lessons_public_needs_chapter check (visibility = 'assigned' or chapter_id is not null);

-- Last line of defence for the 15 s recording limit (UC-05): no item over 25 words.
alter table public.lesson_items
  add constraint lesson_items_max_25_words
    check (coalesce(array_length(regexp_split_to_array(btrim(text), '\s+'), 1), 0) between 1 and 25);

-- ── 4. Assignments: material + due date; targets say who ────────────────────
create table public.assignment_targets (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments (id) on delete cascade,
  class_id       uuid references public.classes (id) on delete cascade,
  student_id     uuid references public.profiles (id) on delete cascade,
  check (num_nonnulls(class_id, student_id) = 1),
  unique (assignment_id, class_id),
  unique (assignment_id, student_id)
);
create index assignment_targets_class_id_idx on public.assignment_targets (class_id);
create index assignment_targets_student_id_idx on public.assignment_targets (student_id);

-- Each old row (one class OR one student) becomes one assignment with one target.
insert into public.assignment_targets (assignment_id, class_id, student_id)
select id, class_id, student_id from public.assignments;

alter table public.assignments add column due_date date;
update public.assignments set due_date = (deadline at time zone 'Asia/Karachi')::date where deadline is not null;
do $$
begin
  if exists (select 1 from public.assignments where due_date is null) then
    raise exception 'Migration 0004 stopped: an assignment has no deadline, but due_date is required. Set one first.';
  end if;
end $$;
alter table public.assignments
  alter column due_date set not null,
  drop column deadline,
  drop column class_id,   -- its index and the old one-of check go with it
  drop column student_id;

alter table public.assignment_targets enable row level security;
revoke all on table public.assignment_targets from anon, authenticated;
grant select, insert, update, delete on table public.assignment_targets to service_role;

-- ── 5. Atomic writes (a plpgsql function body is one transaction) ───────────
-- Errors use custom SQLSTATEs the server maps to HTTP: PN404 not found, PN409 locked, PN422 invalid.
drop function if exists public.create_material(uuid, uuid, text, text, text, jsonb, uuid, timestamptz);

-- p_items: [{"text": "...", "item_type": "word|phrase|sentence|paragraph"}] — validated by lib/materials.ts first.
create or replace function public.create_material(
  p_teacher_id uuid, p_title text, p_level text, p_instructions text, p_items jsonb
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare v_id uuid;
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) not between 1 and 20 then
    raise exception 'A material needs 1 to 20 items.' using errcode = 'PN422';
  end if;
  insert into public.lessons (chapter_id, level, order_no, title, instructions, created_by, visibility)
  values (null, p_level, 1, p_title, nullif(p_instructions, ''), p_teacher_id, 'assigned')
  returning id into v_id;
  insert into public.lesson_items (lesson_id, order_no, item_type, text)
  select v_id, x.ord, x.item->>'item_type', x.item->>'text'
  from jsonb_array_elements(p_items) with ordinality as x(item, ord);
  return v_id;
end;
$$;

-- p_items null = leave items alone (only title/level/instructions change).
create or replace function public.update_material(
  p_material_id uuid, p_title text, p_level text, p_instructions text, p_items jsonb
) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  perform 1 from public.lessons where id = p_material_id and visibility = 'assigned' for update;
  if not found then
    raise exception 'Material not found.' using errcode = 'PN404';
  end if;
  if p_items is not null then
    if exists (
      select 1 from public.attempts a join public.lesson_items i on i.id = a.item_id where i.lesson_id = p_material_id
    ) then
      raise exception 'This material has student attempts. Use Duplicate & edit.' using errcode = 'PN409';
    end if;
    if jsonb_array_length(p_items) not between 1 and 20 then
      raise exception 'A material needs 1 to 20 items.' using errcode = 'PN422';
    end if;
    delete from public.lesson_items where lesson_id = p_material_id;
    insert into public.lesson_items (lesson_id, order_no, item_type, text)
    select p_material_id, x.ord, x.item->>'item_type', x.item->>'text'
    from jsonb_array_elements(p_items) with ordinality as x(item, ord);
  end if;
  update public.lessons
  set title = p_title, level = p_level, instructions = nullif(p_instructions, ''), updated_at = now()
  where id = p_material_id;
end;
$$;

-- "<title> (copy)" with the same items; no assignments, so it starts unlocked.
create or replace function public.duplicate_material(p_material_id uuid, p_teacher_id uuid)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare v_id uuid;
begin
  insert into public.lessons (chapter_id, level, order_no, title, instructions, created_by, visibility)
  select chapter_id, level, order_no, left(title, 153) || ' (copy)', instructions, p_teacher_id, 'assigned'
  from public.lessons where id = p_material_id and visibility = 'assigned'
  returning id into v_id;
  if v_id is null then
    raise exception 'Material not found.' using errcode = 'PN404';
  end if;
  insert into public.lesson_items (lesson_id, order_no, item_type, text, reference_phonemes, variants)
  select v_id, order_no, item_type, text, reference_phonemes, variants
  from public.lesson_items where lesson_id = p_material_id;
  return v_id;
end;
$$;

-- Assignment + all its targets, or nothing. Same material may be assigned many times.
create or replace function public.create_assignment(
  p_material_id uuid, p_due_date date, p_class_ids uuid[], p_student_ids uuid[]
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  v_id uuid;
  v_classes uuid[] := coalesce(p_class_ids, '{}');
  v_students uuid[] := coalesce(p_student_ids, '{}');
begin
  if not exists (select 1 from public.lessons where id = p_material_id and visibility = 'assigned') then
    raise exception 'Material not found.' using errcode = 'PN404';
  end if;
  if cardinality(v_classes) + cardinality(v_students) = 0 then
    raise exception 'Choose at least one class or student.' using errcode = 'PN422';
  end if;
  if p_due_date is null or p_due_date < (now() at time zone 'Asia/Karachi')::date then
    raise exception 'The due date can''t be in the past.' using errcode = 'PN422';
  end if;
  if exists (select 1 from unnest(v_classes) c(id) where not exists (select 1 from public.classes k where k.id = c.id)) then
    raise exception 'A chosen class doesn''t exist.' using errcode = 'PN422';
  end if;
  if exists (
    select 1 from unnest(v_students) s(id)
    where not exists (select 1 from public.profiles p where p.id = s.id and p.role = 'student')
  ) then
    raise exception 'A chosen student doesn''t exist.' using errcode = 'PN422';
  end if;
  if exists (
    select 1 from unnest(v_students) s(id) join public.profiles p on p.id = s.id where p.archived_at is not null
  ) then
    raise exception 'Archived students can''t be given work.' using errcode = 'PN422';
  end if;

  insert into public.assignments (lesson_id, due_date) values (p_material_id, p_due_date) returning id into v_id;
  -- A repeated id hits the UNIQUE (assignment_id, …) constraints and rolls everything back.
  insert into public.assignment_targets (assignment_id, class_id) select v_id, unnest(v_classes);
  insert into public.assignment_targets (assignment_id, student_id) select v_id, unnest(v_students);
  return v_id;
end;
$$;

-- UC-10 upload with "assign now": material + items + assignment in ONE transaction.
create or replace function public.create_material_and_assign(
  p_teacher_id uuid, p_title text, p_level text, p_instructions text, p_items jsonb,
  p_due_date date, p_class_ids uuid[], p_student_ids uuid[]
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare v_id uuid;
begin
  v_id := public.create_material(p_teacher_id, p_title, p_level, p_instructions, p_items);
  perform public.create_assignment(v_id, p_due_date, p_class_ids, p_student_ids);
  return v_id;
end;
$$;

-- Server only.
revoke all on function public.create_material(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.update_material(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.duplicate_material(uuid, uuid) from public, anon, authenticated;
revoke all on function public.create_assignment(uuid, date, uuid[], uuid[]) from public, anon, authenticated;
revoke all on function public.create_material_and_assign(uuid, text, text, text, jsonb, date, uuid[], uuid[]) from public, anon, authenticated;
grant execute on function public.create_material(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.update_material(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.duplicate_material(uuid, uuid) to service_role;
grant execute on function public.create_assignment(uuid, date, uuid[], uuid[]) to service_role;
grant execute on function public.create_material_and_assign(uuid, text, text, text, jsonb, date, uuid[], uuid[]) to service_role;

commit;
