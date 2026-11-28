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

## Phase 4 — One consistent design + Class 1 content (Azure moved to the end)
**Goal:** every student and teacher screen looks exactly like the landing page, and the content is Class 1 level.
**Depends on:** Phase 3. Follows ADR-006 (Class 1) and ADR-007 (landing page is the design base).
**Team changes (2026-11-26):** A = copy the landing design exactly; B = go with the suggested defaults; C = only what the landing doesn't already cover; D (Azure) moved to the end of FYP-1 work.

**A. Design — copy the landing page exactly**
1. Move the landing building blocks into `components/brand/` (KiddyButton, 2D illustrations, Piko, label chips, tinted card styles) and import them from there in both the landing page and the app.
2. App shell (sidebar, top bar) restyled to the landing navbar's look.
3. Student pages (home, chapters, chapter, practice) rebuilt with the same components, spacing, radii, tints and copy tone as the landing sections.
4. Teacher pages (dashboard, materials, upload form) restyled the same way, still data-dense (like the landing's teacher preview).

**B. Class 1 content — suggested defaults accepted**
5. Re-seed with Class 1 content: Basic = picture words, Medium = 2–3 word phrases, Advanced = 3–6 word sentences; every word has a picture (illustration set) and a listen button (`speakReference`).
6. Teacher upload limits: Advanced sentences up to 8 words, warning above 6 (`MATERIAL_LIMITS`).

**C. Feedback screen — only what's missing**
The landing's interactive demo already shows the practice + feedback design. Reuse it for the real practice page and add only the missing real-data parts:
7. Practice page uses the demo's layout with the real recorder and real saved results.
8. Play your own recording (`GET /api/recordings/[attemptId]`, short-lived signed URL) and turn on the play buttons in History / teacher tables.
9. Try again / Next word + `aria-live` result (if not already covered by the reused component).

**D. Azure scorer — moved to the end** (see "Deferred: Azure" below)

**E. Tests and docs**
10. Browser tests for the restyled pages (mock scorer) and a check that app pages use `components/brand/`.
11. Update codebase index, team guide, design.md.

Exit checks
- [x] Student and teacher pages visibly match the landing page (buttons, cards, Piko, illustrations, colours, tone)
- [x] Seeded content is Class 1 level; every word has a picture and a listen button
- [x] Practice → result → play recording → try again / next word works with the mock scorer
- [x] All tests pass

**Phase 4 result (2026-11-26):** A–C and E done; D (Azure) still deferred. Shared pieces in `components/brand/`; app shell, student and teacher pages, error and not-found pages restyled; practice page uses the landing demo layout. Class 1 seed (Basic words all have pictures; vest, web and wet pictures added). Upload limit: sentences max 8 words, warning above 6. `GET /api/recordings/[attemptId]` + working play buttons. Checks: lint, types, 66 unit tests (incl. design-consistency and seed-picture checks), 42/42 browser tests with `E2E_MUTATE=1` (desktop + phone). Note: Windows Application Control now blocks `supabase.exe`, so the dev DB was reloaded through supabase-js with the same content as `seed.sql`.

### Deferred: Azure scorer (do last, before Phase 5)
- Implement `server/speech/azure.ts` (Pronunciation Assessment → frozen contract, ADR-005); record WAV in the browser; retry on 429; measure ≤ 10 s.
- Needs `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` in `.env.local`.

Engine track: `python` engine answers `/score`; run the comparison script on the test clips (agreement with Azure + latency).

---

## Phase A — Roster, material library, assignments (backend) ✅ 2026-11-28
**Goal:** the data and APIs for classes/students, a teacher material library, Paste/Word import and UC-08 assign-only.
1. Migration 0004: students on `profiles` (class, roll no, archive), unique class names, materials = teacher `lessons`, `assignment_targets`; 5 atomic DB functions.
2. APIs: classes, students (+archive), materials (+duplicate, split, .docx import), assignments, student session/home.
3. One shared splitter (`lib/split-items.ts`) for Paste and Word.

Exit checks
- [x] Migration runs on the existing data (3 students, 1 assignment, 9 attempts kept); UC-03/04/06 flows still pass
- [ ] Migration on a fresh, empty project — not run (needs a second Supabase project)
- [x] Tests: 25-word block, non-blocking warnings, atomic rollback, 409 lock, duplicate, splitter, .docx, CHECK, duplicate targets, past date, archived targeting, visibility union/dedupe, late-added student (unit + `npm run test:db`)

## Phase B — Screens for the roster, library, assigning and the student dashboard ✅ 2026-11-28
**Goal:** every Phase A feature usable from the UI, in the existing design.
1. Teacher: Classes & Students (add/rename class; add/edit/move/archive students, show archived + unarchive).
2. Teacher: Materials library (search, level filter, Open / Assign / Duplicate, lock icon) and one editor for new/edit (Write / Paste / Upload Word tabs, inline edit, drag reorder, limits, unsaved-changes guard, locked banner + Duplicate & edit, read-only assignment list).
3. Teacher: Assign dialog (classes + searchable students, due date, live summary).
4. Student: "Who are you?" (first visit; id in localStorage, mirrored to a cookie), "Not you? Switch student" in the profile menu, dashboard (greeting, Continue, Your lessons with due-date highlight + progress).

Exit checks (walked in `tests/e2e/phase-b.spec.ts`, `E2E_MUTATE=1`)
- [x] 1. Class + 3 students; an archived student leaves the picker and the Assign dialog
- [x] 2. Materials by Write, Paste (sentence mode) and .docx upload
- [x] 3. 26 words disables Save; 8 words in Basic warns but saves
- [x] 4. Class + 1 student from another class → both see it; a student added later sees it too
- [x] 5. First visit → picker; reload → dashboard; Switch works
- [x] 6. After an attempt the material is locked; Duplicate & edit works
- [x] 7. Record → feedback → retry from the new dashboard
- [x] 8. Every new screen at 390 px and 1280 px, no sideways scrolling (screenshots reviewed)

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

Exit checks
- [x] No open critical/high bugs; remaining ones listed with reasons (2026-11-28: 9 bugs fixed; open items are team decisions, keys or devices)
- [x] `docs/qa-report.md` complete (+ `docs/demo-script.md`)

**Phase 5 result (2026-11-28):** run on the mock scorer (Azure keys not set). Checks 1–6 and 8–11 pass. Check 7: Chrome + Edge automated, Firefox/Safari/phones on a manual checklist. Repeatable: `tests/e2e/qa-*.spec.ts`, `scripts/qa/*.mjs`. Details: [docs/qa-report.md](../docs/qa-report.md).

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
