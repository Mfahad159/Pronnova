-- 0002_materials.sql — Phase 2 (UC-10 Upload Practice Material, UC-03 View Lesson).
-- Why: teacher material must be visible only to assigned students (ADR-004), and saving a
-- material (lesson + items + optional assignment) must be all-or-nothing.

-- 1. Who can see a lesson.
--    'public'   = built-in curriculum, open to every student (levels still unlock in order).
--    'assigned' = teacher material, visible only to students it is assigned to.
alter table public.lessons
  add column visibility text not null default 'public' check (visibility in ('public', 'assigned'));

-- 2. Save a material in ONE transaction (a plpgsql function body is atomic).
--    p_items: [{"text": "...", "item_type": "word|phrase|sentence|paragraph"}, ...] — already validated
--    by the server (lib/materials.ts); the table checks are the last line of defence.
create or replace function public.create_material(
  p_teacher_id   uuid,
  p_chapter_id   uuid,
  p_level        text,
  p_title        text,
  p_instructions text,
  p_items        jsonb,
  p_class_id     uuid,
  p_deadline     timestamptz
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lesson_id uuid;
  v_order     int;
begin
  if p_class_id is not null and not exists (
    select 1 from public.classes c where c.id = p_class_id and c.teacher_id = p_teacher_id
  ) then
    raise exception 'class does not belong to this teacher' using errcode = '42501';
  end if;

  -- Next free position in this chapter + level. The row lock avoids two saves picking the same number.
  perform 1 from public.chapters where id = p_chapter_id for update;
  select coalesce(max(order_no), 0) + 1 into v_order
  from public.lessons where chapter_id = p_chapter_id and level = p_level;

  insert into public.lessons (chapter_id, level, order_no, title, instructions, created_by, visibility)
  values (p_chapter_id, p_level, v_order, p_title, nullif(p_instructions, ''), p_teacher_id, 'assigned')
  returning id into v_lesson_id;

  insert into public.lesson_items (lesson_id, order_no, item_type, text)
  select v_lesson_id, x.ord, x.item->>'item_type', x.item->>'text'
  from jsonb_array_elements(p_items) with ordinality as x(item, ord);

  if p_class_id is not null then
    insert into public.assignments (lesson_id, class_id, deadline)
    values (v_lesson_id, p_class_id, p_deadline);
  end if;

  return v_lesson_id;
end;
$$;

-- Server only: nobody but service_role may call it.
revoke all on function public.create_material(uuid, uuid, text, text, text, jsonb, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.create_material(uuid, uuid, text, text, text, jsonb, uuid, timestamptz) to service_role;
