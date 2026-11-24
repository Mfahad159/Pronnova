# Database guide

How Pronnova stores data, **why** it is built this way, and **how to change it** safely. Use it to answer "why this table/column?" questions in reviews and the viva.

- Schema file: [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)
- Demo data: [`supabase/seed.sql`](../supabase/seed.sql)
- Source diagram: SRS ER diagram, [`srs/fig21-er-diagram.png`](srs/fig21-er-diagram.png)
- Code that talks to it: `server/db/` only

## 1. Big picture

| Question | Answer |
|---|---|
| What database? | PostgreSQL, hosted by Supabase (free plan). Recordings go in Supabase Storage (bucket `recordings`). |
| Who can read/write? | Only our server code, using the **secret key** (`SUPABASE_SECRET_KEY`, Postgres role `service_role`). The browser never connects. |
| Why server-only? | FYP-1 has no login (ADR-002). Without login there is no safe way to give the browser its own access, so we give it none. |
| How is that enforced? | Row Level Security (RLS) is **on** for every table with **no policies**, and the browser roles (`anon`, `authenticated`) have **no grants**. Even if someone finds the public URL, they get "permission denied". |
| Where are changes recorded? | Every change is a numbered SQL file in `supabase/migrations/`. Files are never edited after they've been applied; a change is always a new file. |

### Tables at a glance

```
profiles ──< classes ──< enrollments >── profiles (students)
    │
chapters ──< lessons ──< lesson_items ──< attempts >── profiles (student)
                │                            ├──< word_results
                └──< assignments             ├──< phoneme_results
                     (to a class OR student) └──< teacher_evaluations
profiles ──< error_stats     profiles ──< suggestions     settings (key/value)
```
`A ──< B` means one A has many B.

## 2. Tables and why each exists

| Table | Stores | SRS link | Key rules (and why) |
|---|---|---|---|
| `profiles` | Every person: name, email, **role** (student/teacher), status | 3.2.1, UC-01/02 | `role` limited to two values so code can trust it. Email unique for future login. |
| `classes` | A teacher's class + `join_code` | UC-01 alt 1A, UC-08 | Join code is 4–12 capital letters/digits so it's easy to read out in class. |
| `enrollments` | Which student is in which class | UC-08, UC-12 | Primary key is (class, student): a student can't be added to the same class twice. |
| `chapters` | Ordered chapters with grade tag | 3.2.2, UC-03, UC-11 | `order_no` is unique → chapters always have one clear sequence. |
| `lessons` | A lesson inside a chapter at a level | 3.2.2, UC-09, UC-10 | `level` is basic/medium/advanced (SRS names). (chapter, level, order_no) unique → no two lessons fight for the same spot. `visibility` = public (built-in) or assigned (teacher material, only for assignees — ADR-004). |
| `lesson_items` | The words/phrases/sentences/paragraphs to read | 3.2.2, UC-03 | `item_type` limited to the four SRS types. Text 1–600 chars (SRS: sentences ≈15 words, paragraphs later). `variants` holds UK/US forms (both accepted, SRS 2.4). |
| `assignments` | Lesson given to a class **or** one student, with deadline | 3.2.9, UC-08 | Check: exactly one of class/student is set — an assignment can't target both or nobody. |
| `attempts` | One recording attempt and its result | 3.2.3–3.2.5, UC-04 | `status` pending → scored/failed. Row is saved **before** scoring, so a failed score never loses the attempt (SRS 3.3.7). A `scored` row must have a score and classification (check). Stores `model_version`/`scoring_version` so results stay comparable when the speech engine changes. |
| `word_results` | Score per word of an attempt | 3.2.4, UC-06 | `position` keeps word order for coloring the sentence. |
| `phoneme_results` | Score per sound (GOP) | 3.2.4, UC-06 | `expected` vs `detected` sound, `gop_score`. |
| `error_stats` | Per student, per word/sound: attempts, errors, **error rate** | 3.2.6, UC-07 | `error_rate` is a **generated column** = errors ÷ attempts × 100, so it can never be out of sync. `errors ≤ attempts` enforced. |
| `teacher_evaluations` | Teacher's rating + comment on an attempt | 3.2.10, UC-12 | Separate table so the machine score is never overwritten. |
| `suggestions` | AI or template tips for a student | 3.2.7, UC-07 | `source` = gemini/template, so we can show which tips came from the AI. |
| `settings` | Tunable values (85/70 cut-offs, max recording length) | 3.2.5 | Change thresholds without a code deploy. |

### Columns we added beyond the ER diagram
| Column | Why |
|---|---|
| `lessons.title`, `lessons.instructions` | UC-10 asks the teacher for a title and instructions. |
| `chapters.cover_image`, `chapters.tint` | Chapter cards in the UI (design.md). |
| `lesson_items.order_no` | Keep items in the order the teacher typed them. |
| `attempts.duration_ms`, `error_message`, `scored_at` | Show recording length, explain failures, measure the 10 s feedback target (SRS 3.3.3). |
| `word_results.position` | Word order for feedback display. |
| `lessons.visibility` (0002) | Teacher material must be hidden from students it isn't assigned to (ADR-004). |
| `error_stats.unit_type` | The ER diagram's "unit (word / phoneme)" split into type + value, so the word "the" and a sound "θ" never clash. |

## 3. Design decisions you may be asked about

| Question | Our answer |
|---|---|
| Why a relational DB (Postgres) and not NoSQL (Firebase/Mongo)? | Our data is full of relations (chapter → lesson → item → attempt → results). Postgres enforces them with foreign keys and checks; NoSQL would push that work into our code. Comparison: `stack-options.md`. |
| Why UUIDs for ids? | Safe to show in URLs (not guessable like 1, 2, 3), and records can be created anywhere without clashes. |
| Why `check (...)` instead of Postgres enums? | Easier to change later in a migration (enums are awkward to alter) and still rejects bad values. |
| Why `on delete cascade`? | Deleting a chapter/attempt should remove its children (lessons, results) instead of leaving orphans. Profiles that created lessons use `set null` so content survives if a teacher leaves. |
| Why indexes on foreign keys and `(student_id, created_at)`? | Postgres doesn't index foreign keys automatically; these are the columns every page filters/sorts by ("my latest attempts"). |
| Why store `error_stats` instead of counting every time? | Progress pages (UC-07) would otherwise scan every word result of every attempt. Updating a small counter per attempt is cheaper and simpler. |
| Why `numeric(5,2)` for scores? | Exact decimals (no floating-point surprises like 84.99999 being "Good"), range 0–100. |
| Why is the recordings bucket private, 1 MB max, audio only? | Recordings are personal data (SRS 3.3.4). Private + short-lived signed links; size/type limits block misuse. 15 s of compressed audio is far below 1 MB. |
| Why no login yet? | University rule for FYP-1 (ADR-002). `profiles` already has `role` and `email`, so FYP-2 adds Supabase Auth without redesigning tables. |
| Why save materials through a database function (`create_material`)? | A material is a lesson + its items + maybe an assignment. Three separate inserts could half-fail and leave a lesson with no items. A Postgres function runs as **one transaction**: all saved or nothing (UC-10). Only `service_role` may call it. |
| How is an attempt saved so nothing is lost? | Order: (1) upload audio to `recordings/{student}/{attempt}.webm`, (2) insert `attempts` row as `pending`, (3) score, (4) `complete_attempt()` saves results. If (3) fails the row becomes `failed` with its audio kept, and Retry re-scores it (SRS 3.3.7). |
| Can a double click or a retry count errors twice? | No. The browser makes the attempt id, so sending twice hits the same row; `complete_attempt()` locks the row and does nothing if it's already `scored`. |
| How are error counts updated? | Inside `complete_attempt()`: for each word (and sound) of the attempt, `error_stats.attempts += 1` and `errors += 1` if wrong, with an upsert. `error_rate` recalculates itself (generated column). |
| How do level locks work? Is there a progress table? | No extra table: the stage is computed from the student's best scores (`attempts`). Rule and reasons: ADR-004; code: `lib/progress.ts`. |
| Why a separate `settings` table? | SRS thresholds may be tuned during testing; changing a row is safer than changing code. |

## 4. How to change the database

**Golden rule:** never edit a migration file that has already been run. Always add a new one.

1. **Create a new file** in `supabase/migrations/` with the next number and a short name, e.g. `0002_add_lesson_audio.sql`.
2. **Write the change**, for example:
   ```sql
   -- 0002_add_lesson_audio.sql — teachers can attach a model recording to an item (why: UC-06 "play correct pronunciation")
   alter table public.lesson_items add column model_audio_path text;
   ```
   - New table? Also add `enable row level security`, `revoke all ... from anon, authenticated`, and `grant select, insert, update, delete ... to service_role` (copy the pattern at the end of `0001_init.sql`). Without the grant even the server gets "permission denied".
   - Renaming/dropping a column? Search the code (`server/db/`) first and update it in the same change.
3. **Apply it** — one of:
   - Supabase dashboard → SQL Editor → paste the file → Run, **or**
   - `npm run db:push` (needs `SUPABASE_DB_URL` in `.env.local`, see below). This also records the file in Supabase's migration history.
4. **Update** `server/db/queries/*`, `types/index.ts`, `supabase/seed.sql` if needed, the tables in this file, and `codebase-index.md`.
5. **Check:** `npm run db:check`, then the pages that use the table.
6. **Log it** in the table below.

### Connection options
| You want to | Use |
|---|---|
| Run the app | `SUPABASE_URL` + `SUPABASE_SECRET_KEY` in `.env.local` (API only; cannot create tables) |
| Create/alter tables from the terminal | Also `SUPABASE_DB_URL` in `.env.local`: dashboard → **Connect** → Session pooler URI with your DB password (special characters in the password must be URL-encoded, e.g. `@` → `%40`). Then `npm run db:push`, `npm run db:seed`, `npm run db:status`, `npm run db:verify` |
| No terminal access | Paste SQL files in the dashboard SQL Editor |

If a migration was run in the SQL Editor and you later switch to `npm run db:push`, first mark it as already applied so it isn't run twice:
`npx supabase migration repair --status applied 0001 --remote="<your SUPABASE_DB_URL>"`.

### Check security
`npm run db:verify` runs `supabase/checks/access.sql` (read-only). Expected: RLS on every table, 0 browser grants, 0 policies, server can write, bucket not public, browser cannot call `create_material` or `complete_attempt`.

New database function? Add `revoke all on function ... from public, anon, authenticated;` and `grant execute ... to service_role;` (see `0002_materials.sql`), and add it to the check.

### Reset demo data
Run `supabase/seed.sql` again in the SQL Editor. (`npm run db:seed` only re-runs the seed when the file has changed, because the CLI remembers seeds it already ran.) It **deletes all app data** and reloads the demo set — never run it on real student data.

## 5. Migration log
| File | Date | What | Why |
|---|---|---|---|
| `0001_init.sql` | 2026-11-24 | All 14 tables, checks, indexes, server-only access, `recordings` bucket | Phase 1: implement the SRS ER diagram. Applied with `npm run db:push`; seeded with `npm run db:seed` |
| `0002_materials.sql` | 2026-11-24 | `lessons.visibility`; `create_material()` function (server-only) | Phase 2: save UC-10 material atomically; ADR-004 visibility. Applied with `npm run db:push` |
| `0003_attempt_results.sql` | 2026-11-24 | `complete_attempt()` function (server-only) | Phase 3: save word/sound results, update error stats and mark the attempt scored in one transaction; refuses to run twice. Applied with `npm run db:push` |
