# FYP-1 implementation plan (Phases 1–5)

Scope: UC-03, UC-04, UC-05, UC-06, UC-10. No login (ADR-002). Stack: ADR-001.
Phase 0 (base project) is **done**: app shell, tokens, routes, mock scorer, `POST /api/attempts` (no saving).

## Rules
- **One phase at a time.** A phase starts only when the one before it passes its exit checks **and** the team says "continue".
- **Every phase ends with:** `npm run lint` + `npm run build` passing, a manual check in the browser, `docs/codebase-index.md` and `docs/team-guide.md` updated, and a short report: what changed, what was tested, what's left.
- **Decisions marked ❓** need a team answer before or during that phase. I'll ask when we get there, suggest a default, and log the answer in `docs/decisions/`.
- **Engine track** (own Python engine) runs alongside and never blocks a phase. Its checkpoints are listed per phase.

```
Phase 1 Data ──► Phase 2 Content ──► Phase 3 Record + Attempt ──► Phase 4 Feedback + Azure ──► Phase 5 QA + Release
(DB, seed)      (UC-03, UC-10)      (UC-05, UC-04)              (UC-06, real scoring)          (bugs, design, routing…)
```

---

## Phase 1 — Database and data layer
**Goal:** pages read real data from Supabase instead of `lib/mock-data.ts`.
**Depends on:** Phase 0.

**Team must do first:** create a free Supabase project and put `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. (I can't create accounts.)

Tasks
1. Install `@supabase/supabase-js` and the Supabase agent skills (`supabase`, `supabase-postgres-best-practices`).
2. `supabase/migrations/0001_init.sql`: all 14 tables from the ER diagram (`architecture.md`), with keys, foreign keys, check constraints (level, item_type, role, status, score 0–100), indexes on foreign keys and `(student_id, created_at)`.
3. RLS **on** for every table, **no** anon policies (ADR-002). Only the server key reads/writes.
4. Private Storage bucket `recordings` (max 1 MB per file, audio types only).
5. `supabase/seed.sql`: demo teacher, demo student, 1 class + enrollment, 4 chapters × 3 levels, lessons with words/phrases/sentences, `settings` rows (85/70 cut-offs, 15 s max). Team-made content only.
6. `server/db/client.ts` (server-only Supabase client) and `server/db/queries/*` (chapters, lessons, items, attempts).
7. Generate TypeScript types from the schema into `types/database.ts`.
8. Switch the student pages and teacher dashboard to the DB queries, inside `<Suspense>` with skeletons (Cache Components). Add `error.tsx` and `not-found.tsx` for the student and teacher areas.
9. Demo identity: read the demo student/teacher by a fixed seeded id from one helper (`server/db/demo-user.ts`), so FYP-2 login can replace it in one place.
10. ❓ Test tools: suggest **Vitest** (unit tests for `lib/` and API routes) + **Playwright** (browser tests). Install only after approval.

Exit checks
- [x] Fresh DB + `migrations` + `seed` gives a working app with no code edits
- [x] No page imports `lib/mock-data.ts` (file deleted or kept only for tests)
- [x] Service key not in the browser bundle (search `.next/static` for it)
- [x] Bad chapter id → 404 page; DB down → friendly error page
- [x] Team guide: Supabase setup + how to reset the seed

**Phase 1 result (2026-11-24):** tasks 1–6, 8–10 done. Task 7 (generated DB types) deferred: needs the Supabase CLI logged in; queries map rows to `types/index.ts` by hand for now. Env names changed to `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (Supabase's new key system). Verified without a DB: lint, types, 14 unit tests, build, browser (setup message + 404), no Supabase code or key in the browser bundle. **Verified on the team's project (2026-11-24):** migration + seed applied with `npm run db:push` / `db:seed`; `db:check` all ✓ (14 tables, seeded rows, private bucket); `db:verify` RLS on 14/14 tables, 0 browser grants, 0 policies; pages show seeded data; API scores a real item; Playwright 20/20 (desktop + phone).

Engine track: record the first 20–30 test clips into `engine/eval/` and pick the ASR + aligner (decision record).

---

## Phase 2 — Lesson content: UC-03 View Lesson + UC-10 Upload Material
**Goal:** a teacher adds material; a student finds it and opens an exercise.
**Depends on:** Phase 1 (tables, queries, seed).

UC-10 (teacher)
1. `POST /api/materials` (or a Server Action): title, instructions, due date, chapter, level, items (one per line), optional class → creates `lessons` + `lesson_items` (+ `assignments` if a class is chosen).
2. Server-side validation: required fields, max items, max ~15 words per sentence (SRS scope), trim + de-duplicate lines, detect item type (word/phrase/sentence/paragraph) automatically and let the teacher change it.
3. Form UX: inline field errors, pending state on save, success toast, "Save without class" path (UC-10 alt flow 3A), network error message.
4. Teacher materials list (on `/teacher` or `/teacher/materials`) to see what was saved.

UC-03 (student)
5. Chapters in order with the student's stage (UC-03 step 1).
6. Levels Basic → Medium → Advanced with lock state. ❓ Unlock rule — suggested default: a level unlocks when every item in the previous level has a best score ≥ 70.
7. Items list per level; "No exercises in this level" and "Level is locked" messages (UC-03 exceptions).
8. **Continue** button on student home → last item attempted (UC-03 alt 1A). Derived from the latest attempt, so no extra table.
9. **Assigned homework** section on student home with due dates (UC-03 alt 1B).
10. ❓ SRS 3.2.2 says a lesson shows "only when assigned", but UC-03 also allows self-selected practice. Suggested default: built-in chapters are open to all; teacher material shows only to the class it's assigned to.

Exit checks
- [x] Teacher saves material → it appears for the student in the right chapter/level (or in Homework)
- [x] Every validation error shows a clear message; nothing half-saved on failure
- [x] Locked/empty levels behave as UC-03 says; Continue opens the right item
- [x] Unit tests: item-type detection, unlock rule

**Phase 2 result (2026-11-24):** all tasks done. ❓ decisions taken as the defaults → ADR-004 (unlock at ≥70% on every item of the previous level; teacher material only for assignees). Migration `0002` applied. Verified: 36 unit tests, lint, types, build, 26 e2e (desktop + phone), `db:verify` (browser can't call `create_material`), and by hand: empty-submit errors; save + assign → student sees it in Homework and in the chapter; save without class → hidden from students; locked item → locked screen + API 403; hidden item → not-found + API 404; phone width OK. Known: not-found inside Suspense returns HTTP 200 (streaming) — review in Phase 5.

Engine track: ASR working on the test clips (transcript only).

---

## Phase 3 — Record speech + save attempts: UC-05 + UC-04 (mock scorer)
**Goal:** a student records, submits, and the attempt is stored safely, end to end, with the mock scorer.
**Depends on:** Phase 2 (items to practise), Phase 1 (tables, storage bucket).

UC-05 Record Speech
1. `features/voice/`: recorder hook (MediaRecorder, webm/opus → mp4 fallback for Safari/iOS), live waveform, timer, auto-stop at 15 s. Ideas from the old prototype's `useAudioRecorder`.
2. `stores/voice-store.ts` (Zustand): idle → asking permission → ready → recording → recorded → submitting → done / error.
3. States and messages: no mic, permission denied (how to allow it), cancel (audio discarded, UC-05 alt 3A), listen back before submit, re-record.
4. Release the mic when leaving the page or cancelling.
5. Reject too-short (< 0.5 s) or silent recordings in the browser and on the server (SRS 2.5 audio quality).

UC-04 Attempt pipeline
6. `POST /api/attempts`: validate → upload audio to `recordings/{student}/{attempt}.webm` → insert attempt `status=pending` → score → save `word_results`, `phoneme_results`, score, classification, `model_version`, `scoring_version` → `status=scored`.
7. On scoring failure: keep the audio + attempt, `status=failed`, return "retryable" (SRS 3.3.7).
8. `POST /api/attempts/[id]/retry` re-scores the stored audio.
9. Update `error_stats` (attempts, errors, error rate per word and per phoneme) in the same request (SRS 3.2.6).
10. Block double submits (button disabled + idempotency key).
11. ❓ Freeze the Speech Engine contract (`architecture.md`) at the end of this phase. After that it changes only by decision record.

Exit checks
- [ ] Record → submit → attempt row + audio file + word results exist in Supabase
- [ ] `SPEECH_ENGINE` pointed at a dead URL → attempt saved as failed → Retry works
- [ ] Mic denied / no mic / cancel / re-record / leave page all behave correctly
- [ ] Works in Chrome, Edge, Firefox; Safari/iOS recording format checked
- [ ] Unit tests: `classify` boundaries (69/70/84/85), `errorRate`, error_stats update

Engine track: forced alignment on the test clips; start the `/score` server against the frozen contract.

---

## Phase 4 — Feedback and real scoring: UC-06 + Azure
**Goal:** the student sees real word- and sound-level feedback within 10 s.
**Depends on:** Phase 3 (stored attempts and results).

UC-06 View Feedback & Score
1. Result view on the practice page: score %, classification badge, the sentence with each word colored by score, list of wrong words and sounds with short tips.
2. Play the correct pronunciation of a word (Web Speech API; UK and US voices both accepted). Fallback message if the browser has no voice.
3. Play the student's own recording (short-lived signed URL, `GET /api/recordings/[attemptId]`).
4. Buttons: **Try again** (new attempt, updated score) and **Next exercise** (UC-06 alt 4A/4B).
5. Announce the result to screen readers (`aria-live`).
6. Student History tab and teacher "Latest attempts" read real attempts (replace sample rows).

Azure scorer
7. Implement `server/speech/azure.ts` with Azure Pronunciation Assessment: send audio + reference text, map word and phoneme accuracy to our contract, record `model_version`.
8. Convert audio if Azure needs it (WAV/PCM). ❓ Convert in the browser (record WAV) or on the server — decide after a quick test.
9. Handle the free tier's 1-request-at-a-time limit: retry with backoff on 429, else save as failed for Retry.
10. Measure: time from submit to result for 20 attempts. Target ≤ 10 s (SRS 3.3.3). Log timings.

Exit checks
- [ ] Real recordings get sensible word/sound feedback from Azure
- [ ] 95% of attempts show feedback in ≤ 10 s (numbers written in `docs/`)
- [ ] Try again / Next / play buttons all work; failed scoring still recoverable
- [ ] Team can switch `SPEECH_ENGINE=mock|azure|python` with no code change

Engine track: `python` engine answers `/score`; run the comparison script on the test clips (agreement with Azure + latency).

---

## Phase 5 — QA, fixes and release
**Goal:** a stable, consistent demo build for the FYP-1 evaluation. Mostly fixing, no new features.
**Depends on:** Phases 1–4.

Checks (each gets a pass/fail list in `docs/qa-report.md`, bugs fixed or logged):
1. **Use case walkthroughs:** every normal, alternate and exception flow of UC-03/04/05/06/10 from the SRS tables.
2. **Routing:** every sidebar and in-page link; active menu item; back/forward; bad ids → 404; deep links and refresh on every page; no dead "coming soon" links that look clickable.
3. **Interaction errors:** double clicks, fast record/stop, leaving mid-recording, mic unplugged while recording, slow 3G, offline, engine down, Supabase down, very long text, empty form submits.
4. **Design consistency:** colors only from tokens, same spacing/radius/type scale, one button style per action type, every list has empty + loading + error states, matches `docs/design.md`; run the **unslop** audit.
5. **Responsive:** 360, 768, 1280, 1440 px; sidebar on mobile; tables on small screens; no sideways page scroll.
6. **Accessibility:** keyboard-only use (record with keyboard too), visible focus, labels on every input and icon button, contrast AA, `prefers-reduced-motion`, screen-reader check of the result.
7. **Browsers/devices:** Chrome, Edge, Firefox, Safari + one Android and one iPhone (SRS 3.3.5).
8. **Performance:** pages < 3 s, feedback ≤ 10 s, image sizes, bundle size; simple load test toward 50 users (SRS 3.3.3), keeping Azure limits in mind.
9. **Data integrity:** no attempt lost on any failure; error_stats math checked by hand on sample data; classification at 69/70/84/85; seed reset works.
10. **Security:** no secrets in the repo or browser bundle, RLS on all tables, signed URLs expire, server validates file type/size and all form input, no student names sent to external AI.
11. **Docs:** codebase index, team guide, decisions and env list match the code; demo script written.
12. **Release:** deploy to Vercel, set env vars there, smoke test the live URL, tag the FYP-1 version.

Exit checks
- [ ] No open critical/high bugs; remaining ones listed with reasons
- [ ] Live Vercel URL passes the demo script
- [ ] `docs/qa-report.md` complete

Engine track: write up the Azure vs own-engine comparison for the FYP-1 report.

---

## Status
| Phase | Status |
|---|---|
| 0 Base project | ✅ Done (2026-11-24) |
| 1 Data | ✅ Done 2026-11-24 — migration + seed applied, all checks pass |
| 2 Content | ✅ Done 2026-11-24 |
| 3 Record + Attempt | ⏳ Waiting for "continue" |
| 4 Feedback + Azure | — |
| 5 QA + Release | — |
