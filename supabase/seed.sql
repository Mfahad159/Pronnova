-- Pronnova demo data (team-made only, ADR-002). Safe to re-run: it WIPES all app data first.
-- Run after migrations/0001_init.sql: Supabase dashboard → SQL Editor → paste → Run.
-- Fixed ids for the demo people are also in server/db/demo-user.ts. Keep them in sync.

begin;

truncate public.profiles, public.chapters, public.settings restart identity cascade;

-- ── People ──────────────────────────────────────────────────────────────────
insert into public.profiles (id, name, email, role) values
  ('00000000-0000-4000-8000-000000000001', 'Ms. Sana',  'teacher.demo@pronnova.test', 'teacher'),
  ('00000000-0000-4000-8000-000000000002', 'Ayesha',    'ayesha.demo@pronnova.test',  'student'),
  ('00000000-0000-4000-8000-000000000003', 'Bilal',     'bilal.demo@pronnova.test',   'student'),
  ('00000000-0000-4000-8000-000000000004', 'Hira',      'hira.demo@pronnova.test',    'student');

insert into public.classes (id, teacher_id, name, join_code) values
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Class 1 – Blue', 'BLUE1A');

insert into public.enrollments (class_id, student_id)
select '00000000-0000-4000-8000-000000000010', id from public.profiles where role = 'student';

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

-- Homework: "TH sounds" assigned to the class, due in 5 days.
insert into public.assignments (lesson_id, class_id, deadline)
select l.id, '00000000-0000-4000-8000-000000000010', now() + interval '5 days'
from public.lessons l where l.title = 'TH sounds';

-- ── Sample attempts (so dashboards aren't empty) ────────────────────────────
create temporary table _att (student uuid, item text, score numeric, status text, mins_ago int, words jsonb) on commit drop;
insert into _att values
  ('00000000-0000-4000-8000-000000000002', 'The moon is up at night.', 68, 'scored', 30,
   '[["The",90,false],["moon",58,true],["is",92,false],["up",85,false],["at",88,false],["night",61,true]]'),
  ('00000000-0000-4000-8000-000000000002', 'a red ball', 91, 'scored', 1500,
   '[["a",96,false],["red",88,false],["ball",90,false]]'),
  ('00000000-0000-4000-8000-000000000002', 'This is my thumb.', 74, 'scored', 1520,
   '[["This",66,true],["is",90,false],["my",92,false],["thumb",64,true]]'),
  ('00000000-0000-4000-8000-000000000002', 'cat', null, 'failed', 3000, '[]'),
  ('00000000-0000-4000-8000-000000000003', 'van', 55, 'scored', 200, '[["van",55,true]]'),
  ('00000000-0000-4000-8000-000000000004', 'good morning', 88, 'scored', 400, '[["good",90,false],["morning",86,false]]');

with ins as (
  insert into public.attempts (student_id, item_id, status, recognized_text, score, classification,
                               model_version, scoring_version, duration_ms, error_message, created_at, scored_at)
  select a.student, i.id, a.status,
         case when a.status = 'scored' then lower(i.text) end,
         a.score,
         case when a.score >= 85 then 'excellent' when a.score >= 70 then 'good' when a.score is not null then 'average' end,
         'seed', 'v1', 1000 + length(i.text) * 60,
         case when a.status = 'failed' then 'Speech engine unreachable (seed example)' end,
         now() - make_interval(mins => a.mins_ago),
         case when a.status = 'scored' then now() - make_interval(mins => a.mins_ago) end
  from _att a join public.lesson_items i on i.text = a.item
  returning id, student_id, item_id
)
insert into public.word_results (attempt_id, position, word, score, is_error)
select ins.id, (w.ord - 1)::int, w.val->>0, (w.val->>1)::numeric, (w.val->>2)::boolean
from ins
join public.lesson_items i on i.id = ins.item_id
join _att a on a.student = ins.student_id and a.item = i.text
cross join lateral jsonb_array_elements(a.words) with ordinality as w(val, ord);

-- Error counts derived from the seeded word results (Phase 3 keeps these up to date).
insert into public.error_stats (student_id, unit_type, unit, attempts, errors)
select at.student_id, 'word', lower(wr.word), count(*), count(*) filter (where wr.is_error)
from public.word_results wr join public.attempts at on at.id = wr.attempt_id
group by at.student_id, lower(wr.word);

-- ── Settings (SRS 3.2.5 cut-offs, recording limits) ─────────────────────────
insert into public.settings (key, value) values
  ('classification', '{"excellent_min": 85, "good_min": 70}'),
  ('recording',      '{"max_seconds": 15, "min_seconds": 0.5, "max_bytes": 1048576}');

commit;
