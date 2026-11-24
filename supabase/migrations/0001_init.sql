-- Pronnova initial schema (Phase 1). Source: SRS ER diagram (docs/srs/fig21-er-diagram.png),
-- described in docs/architecture.md → Data model.
-- Access model (ADR-002, no login in FYP-1): only server code with the SECRET key (service_role)
-- touches these tables. RLS is ON everywhere with NO policies, and anon/authenticated get no grants.
-- Run once on an empty project: Supabase dashboard → SQL Editor → paste → Run. Then run supabase/seed.sql.

create extension if not exists pgcrypto;

-- New tables must not be auto-granted to the browser roles.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

-- ── People ──────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(name) between 1 and 120),
  email       text unique,
  role        text not null check (role in ('student', 'teacher')),
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now()
);

create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (length(name) between 1 and 120),
  join_code   text not null unique check (join_code ~ '^[A-Z0-9]{4,12}$'),
  created_at  timestamptz not null default now()
);
create index classes_teacher_id_idx on public.classes (teacher_id);

create table public.enrollments (
  class_id    uuid not null references public.classes (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index enrollments_student_id_idx on public.enrollments (student_id);

-- ── Content ─────────────────────────────────────────────────────────────────
create table public.chapters (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (length(title) between 1 and 120),
  order_no     int  not null unique check (order_no > 0),
  grade_tag    text not null,
  -- UI extras (not in the ER diagram): card art in public/objects and its tint token.
  cover_image  text,
  tint         text not null default 'peach' check (tint in ('peach', 'sky', 'mint', 'cream')),
  created_at   timestamptz not null default now()
);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  chapter_id    uuid not null references public.chapters (id) on delete cascade,
  level         text not null check (level in ('basic', 'medium', 'advanced')),
  order_no      int  not null check (order_no > 0),
  -- title + instructions are needed by UC-10 (not drawn in the ER diagram).
  title         text not null check (length(title) between 1 and 160),
  instructions  text,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (chapter_id, level, order_no)
);
create index lessons_created_by_idx on public.lessons (created_by);

create table public.lesson_items (
  id                  uuid primary key default gen_random_uuid(),
  lesson_id           uuid not null references public.lessons (id) on delete cascade,
  order_no            int  not null check (order_no > 0),
  item_type           text not null check (item_type in ('word', 'phrase', 'sentence', 'paragraph')),
  text                text not null check (length(text) between 1 and 600),
  reference_phonemes  text,
  variants            jsonb,          -- e.g. {"uk": "...", "us": "..."}
  created_at          timestamptz not null default now(),
  unique (lesson_id, order_no)
);

create table public.assignments (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons (id) on delete cascade,
  class_id    uuid references public.classes (id) on delete cascade,
  student_id  uuid references public.profiles (id) on delete cascade,
  deadline    timestamptz,
  created_at  timestamptz not null default now(),
  check (num_nonnulls(class_id, student_id) = 1)
);
create index assignments_lesson_id_idx on public.assignments (lesson_id);
create index assignments_class_id_idx on public.assignments (class_id);
create index assignments_student_id_idx on public.assignments (student_id);

-- ── Attempts and results ────────────────────────────────────────────────────
create table public.attempts (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles (id) on delete cascade,
  item_id          uuid not null references public.lesson_items (id) on delete cascade,
  audio_path       text,
  status           text not null default 'pending' check (status in ('pending', 'scored', 'failed')),
  recognized_text  text,
  score            numeric(5, 2) check (score between 0 and 100),
  classification   text check (classification in ('excellent', 'good', 'average')),
  model_version    text,
  scoring_version  text,
  raw_result       jsonb,
  duration_ms      int check (duration_ms >= 0),
  error_message    text,
  created_at       timestamptz not null default now(),
  scored_at        timestamptz,
  check (status <> 'scored' or (score is not null and classification is not null))
);
create index attempts_student_created_idx on public.attempts (student_id, created_at desc);
create index attempts_item_id_idx on public.attempts (item_id);

create table public.word_results (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.attempts (id) on delete cascade,
  position    int  not null check (position >= 0),
  word        text not null,
  score       numeric(5, 2) not null check (score between 0 and 100),
  is_error    boolean not null
);
create index word_results_attempt_id_idx on public.word_results (attempt_id);

create table public.phoneme_results (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.attempts (id) on delete cascade,
  word        text not null,
  phoneme     text not null,
  expected    text,
  detected    text,
  gop_score   numeric(6, 2),
  is_error    boolean not null
);
create index phoneme_results_attempt_id_idx on public.phoneme_results (attempt_id);

-- SRS 3.2.6: per student, per word or sound. error_rate = errors / attempts × 100.
create table public.error_stats (
  student_id  uuid not null references public.profiles (id) on delete cascade,
  unit_type   text not null check (unit_type in ('word', 'phoneme')),
  unit        text not null,
  attempts    int  not null default 0 check (attempts >= 0),
  errors      int  not null default 0 check (errors >= 0 and errors <= attempts),
  error_rate  numeric(5, 1) generated always as
                (case when attempts = 0 then 0 else round(errors * 100.0 / attempts, 1) end) stored,
  updated_at  timestamptz not null default now(),
  primary key (student_id, unit_type, unit)
);

create table public.teacher_evaluations (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.attempts (id) on delete cascade,
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  score       numeric(5, 2) check (score between 0 and 100),
  comment     text,
  created_at  timestamptz not null default now()
);
create index teacher_evaluations_attempt_id_idx on public.teacher_evaluations (attempt_id);
create index teacher_evaluations_teacher_id_idx on public.teacher_evaluations (teacher_id);

create table public.suggestions (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  content     text not null,
  source      text not null check (source in ('gemini', 'template')),
  created_at  timestamptz not null default now()
);
create index suggestions_student_id_idx on public.suggestions (student_id);

create table public.settings (
  key    text primary key,
  value  jsonb not null
);

-- ── Access: server only ─────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','classes','enrollments','chapters','lessons','lesson_items','assignments',
    'attempts','word_results','phoneme_results','error_stats','teacher_evaluations','suggestions','settings'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end $$;

-- ── Storage: private bucket for recordings (≤ 1 MB, audio only) ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 1048576,
        array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/mpeg'])
on conflict (id) do nothing;
