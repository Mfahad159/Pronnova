-- Pronnova demo data (team-made only, ADR-002). Safe to re-run: it WIPES all app data first.
-- Run after ALL migrations (0001 → 0004): Supabase dashboard → SQL Editor → paste → Run.
-- Fixed ids for the demo people are also in server/db/demo-user.ts. Keep them in sync.

begin;

truncate public.profiles, public.chapters, public.settings restart identity cascade;

-- ── People ──────────────────────────────────────────────────────────────────
insert into public.profiles (id, name, email, role) values
  ('00000000-0000-4000-8000-000000000001', 'Ms. Sana', 'teacher.demo@pronnova.test', 'teacher');

-- Roster (0004): 2 classes, 6 students each; one class per student, roll numbers unique per class.
insert into public.classes (id, teacher_id, name, join_code) values
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Class 1 – Blue',  'BLUE1A'),
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'Class 1 – Green', 'GREEN1A');

insert into public.profiles (id, name, email, role, class_id, roll_no) values
  ('00000000-0000-4000-8000-000000000002', 'Ayesha', 'ayesha.demo@pronnova.test', 'student', '00000000-0000-4000-8000-000000000010', '1'),
  ('00000000-0000-4000-8000-000000000003', 'Bilal',  'bilal.demo@pronnova.test',  'student', '00000000-0000-4000-8000-000000000010', '2'),
  ('00000000-0000-4000-8000-000000000004', 'Hira',   'hira.demo@pronnova.test',   'student', '00000000-0000-4000-8000-000000000010', '3'),
  ('00000000-0000-4000-8000-000000000005', 'Usman',  null, 'student', '00000000-0000-4000-8000-000000000010', '4'),
  ('00000000-0000-4000-8000-000000000006', 'Zainab', null, 'student', '00000000-0000-4000-8000-000000000010', '5'),
  ('00000000-0000-4000-8000-000000000007', 'Hamza',  null, 'student', '00000000-0000-4000-8000-000000000010', '6'),
  ('00000000-0000-4000-8000-000000000020', 'Ali',    null, 'student', '00000000-0000-4000-8000-000000000011', '1'),
  ('00000000-0000-4000-8000-000000000021', 'Fatima', null, 'student', '00000000-0000-4000-8000-000000000011', '2'),
  ('00000000-0000-4000-8000-000000000022', 'Omar',   null, 'student', '00000000-0000-4000-8000-000000000011', '3'),
  ('00000000-0000-4000-8000-000000000023', 'Maryam', null, 'student', '00000000-0000-4000-8000-000000000011', '4'),
  ('00000000-0000-4000-8000-000000000024', 'Saad',   null, 'student', '00000000-0000-4000-8000-000000000011', '5'),
  ('00000000-0000-4000-8000-000000000025', 'Noor',   null, 'student', '00000000-0000-4000-8000-000000000011', '6');

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

-- ── Teacher library (0004): 3 materials, one per level, saved through the same DB functions the app uses ──
-- "Animal words" → all of Class 1 – Blue. "Little phrases" → Class 1 – Green + Ayesha and Bilal (Blue).
-- "Story sentences" stays unassigned. Due dates are relative to today (Pakistan time).
do $$
declare
  t constant uuid := '00000000-0000-4000-8000-000000000001';
  today date := (now() at time zone 'Asia/Karachi')::date;
  m_easy uuid; m_medium uuid;
begin
  m_easy := public.create_material(t, 'Animal words', 'basic', 'Listen first, then say each animal.',
    '[{"text":"cat","item_type":"word"},{"text":"dog","item_type":"word"},{"text":"cow","item_type":"word"},{"text":"duck","item_type":"word"},{"text":"fish","item_type":"word"}]');
  m_medium := public.create_material(t, 'Little phrases', 'medium', 'Say each phrase slowly and clearly.',
    '[{"text":"a red ball in the box","item_type":"sentence"},{"text":"I can see the sun","item_type":"phrase"},{"text":"my hat is very big","item_type":"phrase"},{"text":"the duck can swim fast","item_type":"sentence"}]');
  perform public.create_material(t, 'Story sentences', 'advanced', 'Read the whole sentence in one go.',
    '[{"text":"The little duck went to the pond with her mother to swim in the cool water.","item_type":"sentence"},{"text":"My friend and I like to read a big book about animals after school.","item_type":"sentence"},{"text":"In the morning the sun is bright and the birds sing in the tall green tree.","item_type":"sentence"}]');

  perform public.create_assignment(m_easy, today + 5, array['00000000-0000-4000-8000-000000000010']::uuid[], '{}');
  perform public.create_assignment(m_medium, today + 7, array['00000000-0000-4000-8000-000000000011']::uuid[],
    array['00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003']::uuid[]);
end $$;

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
  from _att a
  join public.lesson_items i on i.text = a.item
  join public.lessons pl on pl.id = i.lesson_id and pl.visibility = 'public'
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
