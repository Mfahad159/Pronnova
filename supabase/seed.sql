-- Pronnova starting data (ADR-002): one teacher, one student, the built-in chapters, settings.
-- Safe to re-run: it WIPES all app data first.
-- Run after ALL migrations (0001 → 0004): Supabase dashboard → SQL Editor → paste → Run.
-- Fixed ids for the demo people are also in server/db/demo-user.ts. Keep them in sync.

begin;

truncate public.profiles, public.chapters, public.settings restart identity cascade;

-- ── People: ONE teacher and ONE student (FYP-1 has no login, ADR-002; team decision 2026-11-28) ──
insert into public.profiles (id, name, email, role) values
  ('00000000-0000-4000-8000-000000000001', 'Umar', 'teacher.demo@pronnova.test', 'teacher');

-- The roster tables stay (0004) with one class holding the one student; the teacher assigns to him.
insert into public.classes (id, teacher_id, name, join_code) values
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Class 1', 'CLASS1');

insert into public.profiles (id, name, email, role, class_id, roll_no) values
  ('00000000-0000-4000-8000-000000000002', 'Ahmad', 'student.demo@pronnova.test', 'student', '00000000-0000-4000-8000-000000000010', '1');

-- ── Chapters → lessons → items ──────────────────────────────────────────────
insert into public.chapters (id, title, order_no, grade_tag, cover_image, tint) values
  ('10000000-0000-4000-8000-000000000001', 'Everyday Words', 1, 'Class 1', '/objects/img2.jpg', 'peach'),
  ('10000000-0000-4000-8000-000000000002', 'Tricky Sounds',  2, 'Class 1', '/objects/img3.jpg', 'sky'),
  ('10000000-0000-4000-8000-000000000003', 'Short Phrases',  3, 'Class 1', '/objects/img1.jpg', 'mint'),
  ('10000000-0000-4000-8000-000000000004', 'Full Sentences', 4, 'Class 1', '/objects/img4.jpg', 'cream');

-- Helper: insert a lesson and its items in one go.
create temporary table _seed (chapter int, level text, lesson_no int, title text, item_type text, items text[]) on commit drop;
-- Class 1 content (ADR-006): Basic = single picture words, Medium = 2–4 word phrases,
-- Advanced = short sentences (≤ 6 words). Most words have a picture in components/brand/word-pictures.tsx.
insert into _seed values
  (1, 'basic',    1, 'Animals',          'word',     array['cat', 'dog', 'cow', 'duck', 'fish']),
  (1, 'medium',   1, 'Colours and things', 'phrase', array['a red ball', 'a big hat', 'my blue pen']),
  (1, 'advanced', 1, 'About me',         'sentence', array['I have a cat.', 'I can see a cow.']),
  (2, 'basic',    1, 'V and W',          'word',     array['van', 'vest', 'web', 'wet']),
  (2, 'medium',   1, 'P and F',          'phrase',   array['a fat fish', 'a pink fan', 'pat the pet']),
  (2, 'advanced', 1, 'TH sounds',        'sentence', array['This is my thumb.', 'Three ducks swim.']),
  (3, 'basic',    1, 'Greetings',        'phrase',   array['good morning', 'thank you', 'see you']),
  (3, 'medium',   1, 'In the classroom', 'phrase',   array['open your book', 'sit down', 'stand up']),
  (3, 'advanced', 1, 'Polite words',     'sentence', array['May I come in?', 'Please give me a pen.']),
  (4, 'basic',    1, 'Simple sentences', 'sentence', array['The cat is on the mat.', 'I see the sun.']),
  (4, 'medium',   1, 'My day',           'sentence', array['I go to school.', 'The moon is up at night.']);
  -- Chapter 4 → Advanced is left empty on purpose (tests the "No exercises" message).

insert into public.lessons (chapter_id, level, order_no, title, created_by)
select c.id, s.level, s.lesson_no, s.title, '00000000-0000-4000-8000-000000000001'
from _seed s join public.chapters c on c.order_no = s.chapter;

insert into public.lesson_items (lesson_id, order_no, item_type, text)
select l.id, x.ord, s.item_type, x.txt
from _seed s
join public.chapters c on c.order_no = s.chapter
join public.lessons l on l.chapter_id = c.id and l.level = s.level and l.order_no = s.lesson_no
cross join lateral unnest(s.items) with ordinality as x(txt, ord);

-- No teacher materials, assignments or attempts: the app starts empty and fills up as the teacher
-- uploads and assigns work and the student practises (no dummy data, 2026-11-28).

-- ── Settings (SRS 3.2.5 cut-offs, recording limits) ─────────────────────────
insert into public.settings (key, value) values
  ('classification', '{"excellent_min": 85, "good_min": 70}'),
  ('recording',      '{"max_seconds": 15, "min_seconds": 0.5, "max_bytes": 1048576}');

commit;
