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
- [x] Record → submit → attempt row + audio file + word results exist in Supabase
- [x] `SPEECH_ENGINE` pointed at a dead URL → attempt saved as failed → Retry works
- [x] Mic denied / no mic / cancel / re-record / leave page all behave correctly
- [~] Works in Chrome/Edge (automated, desktop + phone). Firefox test is ready but Windows blocked the downloaded Firefox here; Safari/iOS mp4 path is in code — both checked by hand in Phase 5
- [x] Unit tests: `classify` boundaries (69/70/84/85), `errorRate`, error_stats update

**Phase 3 result (2026-11-24):** all tasks done. Migration `0003` applied. Contract frozen (ADR-005). Verified: 42 unit tests; e2e 32/32 incl. real recording with Chrome's fake mic (record → listen → send → score, try again, cancel, too-short) on desktop + phone; curl: idempotent resend, bad input 400; failure path on a second server with the engine unreachable → 202 + attempt `failed` with audio kept → retry (engine down) stays failed → retry (engine up) scored → retry again changes nothing; `db:verify` (browser can't call `complete_attempt`). Mic denied/no-mic/busy messages are in code but need a real browser to check (Phase 5).

Engine track: forced alignment on the test clips; start the `/score` server against the frozen contract.

---

## Phase 4 — Feedback, real scoring and one consistent design: UC-06 + Azure
**Goal:** a Class 1 student sees friendly, real word- and sound-level feedback within 10 s, in screens that look and feel like the landing page.
**Depends on:** Phase 3 (stored attempts and results). Follows ADR-006 (Class 1) and ADR-007 (landing page is the design base).

**Before we start (team):** create a free Azure Speech resource (F0, or Azure for Students credit) and put `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` in `.env.local`. Tasks A–C and E work without it (mock scorer); task D needs it.

**A. Design base — shared building blocks (ADR-007)**
1. Move `KiddyButton`, the 2D illustrations and Piko into `components/brand/` (landing keeps working, app pages can use them).
2. Restyle the app shell to match the landing page: sidebar + top bar in the landing navbar's style, kiddy buttons for main actions, Piko on empty/error/locked screens.
3. Student pages in the landing look: home (Continue + homework as big tinted cards), chapters (picture cards), chapter page (level chips, word cards with pictures and a "listen" button).
4. Teacher pages get the same buttons, cards, chips and colours (lighter touch, still data-dense).

**B. Class 1 content (ADR-006)**
5. Replace the seed's Class 6 content with Class 1 content: picture words (Basic), 2–3 word phrases (Medium), 3–6 word sentences (Advanced), and a picture for each word (from the illustration set or new ones in the same style).
6. ❓ Class 1 limits for teacher uploads — suggested default: Advanced sentences up to 8 words; warn above 6.

**C. UC-06 View Feedback & Score — the practice + result screen**
7. Practice screen in the landing's interactive-demo layout: flashcard (picture + word + "listen" via `speakReference`) on the left, microphone card on the right, steps Listen → Speak → Assess → Improve.
8. Result view: score + Excellent/Good/Average shown in friendly words (e.g. "Super!", "Good try!", "Let's practise"), each word coloured, wrong sounds with a one-line kid-friendly tip, and Piko's reaction.
9. Play the correct word (`speakReference`, UK/US voice) and play your own recording (new `GET /api/recordings/[attemptId]` → short-lived signed URL).
10. **Try again** and **Next word** (UC-06 alt 4A/4B); `aria-live` announcement of the result.
11. History tab and teacher "Latest attempts" play real recordings (the play buttons stop being disabled).

**D. Azure scorer (app track)**
12. Implement `server/speech/azure.ts` with Azure Pronunciation Assessment: audio + reference text in, word + phoneme accuracy mapped to our frozen contract (ADR-005), `model_version` recorded.
13. ❓ Audio format: Azure's short-audio API wants WAV/PCM 16 kHz mono. Suggested default: record WAV in the browser (no server conversion, no new dependency); decide after a quick test.
14. Free tier allows 1 request at a time: retry with backoff on HTTP 429, otherwise save as failed (Retry works, Phase 3).
15. Measure submit → result time for 20 attempts; target ≤ 10 s (SRS 3.3.3); write the numbers in `docs/`.

**E. Tests and docs**
16. Unit: Azure response mapping (from a saved sample response), Class 1 limits, friendly-label mapping.
17. Browser (mock scorer): record → result view → play correct word → try again → next word; design smoke check that student pages use the shared building blocks.
18. Update codebase index, team guide (Azure setup), design.md.

Exit checks
- [ ] Student and teacher pages visibly match the landing page (buttons, cards, Piko, illustrations, colours)
- [ ] Seeded content is Class 1 level, every word has a picture and a listen button
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
| 3 Record + Attempt | ✅ Done 2026-11-24 |
| 4 Feedback + Azure | ⏳ Waiting for "continue" |
| 5 QA + Release | — |
