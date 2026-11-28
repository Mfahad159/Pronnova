# Codebase index

Short map of the repo. Open only the files listed for your task. **Update this file in the same change whenever you add, move or rename a folder, route, API, component group or table.**

Legend: ✅ exists · 🕓 planned (not built yet)

Stack: Next.js 16.4 (App Router, **Cache Components on**), React 19.3, TypeScript, Tailwind v4, shadcn/ui (radix-nova). See `decisions/001-stack.md`.

## Root
| Path | What | |
|---|---|---|
| `AGENTS.md` | Rules for AI agents (top block is written by Next.js) | ✅ |
| `docs/`, `specs/` | Docs (start at `docs/index.md`) and feature specs | ✅ |
| `docs/srs.md`, `docs/srs/` | SRS as Markdown + its 21 diagrams | ✅ |
| `.env.local` | Your keys (git-ignored, never committed). Variable list: `team-guide.md` → Environment variables | local only |
| `vitest.config.ts`, `tests/unit/` | Unit tests (`npm test`), incl. splitter, material/assignment rules, docx import, API validation | ✅ |
| `vitest.db.config.ts`, `tests/db/` | Opt-in DB tests (`npm run test:db`) against the project in `.env.local`: 0004 rules (rollback, 409 lock, duplicate, CHECK, targets, visibility). Creates and removes `zz-test-…` rows | ✅ |
| `tests/fixtures/docx.ts` | Builds tiny .docx files in memory (`*.docx` is git-ignored) | ✅ |
| `scripts/qa/` | Phase 5 QA scripts: `ui-audit` (4 widths, labels, reduced motion), `contrast` (WCAG from tokens), `integrity` (stats recount), `security`, `perf` (pages, feedback, 50 users), `failure-servers` (real engine-down / Supabase-down) — see `docs/qa-report.md` | ✅ |
| `tests/e2e/fixtures.ts`, `qa-*.spec.ts` | Shared `test` (goto waits for the page to finish arriving); QA browser tests for use cases, routing, keyboard | ✅ |
| `app/global-error.tsx` | Last-resort branded error screen (root layout errors) | ✅ |
| `playwright.config.ts`, `tests/e2e/` | Browser tests (`npm run test:e2e`) with Chrome's fake mic: routes, Phase 2, Phase 3 recording. `E2E_MUTATE=1` runs tests that write data; `E2E_FIREFOX=1` adds Firefox | ✅ |
| `scripts/db-check.mjs` | `npm run db:check`: checks tables, seed, bucket and that the browser key is blocked | ✅ |
| `scripts/db-pg.mjs` | `npm run db:push / db:seed / db:status / db:verify` over a direct Postgres connection (`pg`, needs `SUPABASE_DB_URL`). Records migrations in `supabase_migrations.schema_migrations` like the Supabase CLI did | ✅ |
| `supabase/config.toml` | Supabase CLI config (from `supabase init`); `[db.seed]` points at `seed.sql` | ✅ |
| `supabase/checks/access.sql` | Read-only security check used by `db:verify` | ✅ |
| `next.config.ts` | `cacheComponents`, `partialPrefetching`, Tailwind loader | ✅ |
| `components.json` | shadcn/ui config | ✅ |
| `eslint.config.mjs` | Lint rules; ignores `.agents/`, `archive/`, `Pronnova_mds/` | ✅ |
| `.agents/skills/` + `skills-lock.json` | Agent skills (see `docs/agent-skills.md`); `.claude/skills/` links to them | ✅ |
| `tools/` | Icon generator: `build-icons.py` (colours + shapes), `render-icons.mjs` (PNG via Playwright). How-to: `tools/README.md` | ✅ |
| `.claude/launch.json` | Dev server config for the Claude preview pane | ✅ |
| `archive/` | Old files moved out of `public/` (git-ignored) | ✅ |
| `Pronnova_SRS_Updated_28_oct.docx` | Original SRS (git-ignored: `*.docx` never committed; Markdown copy is `docs/srs.md`) | local only |
| `Pronnova_mds/` | First doc draft (read-only) | ✅ |

## App code
| Folder / file | Holds | |
|---|---|---|
| `app/layout.tsx` | Root layout: font (Quicksand), icons + manifest metadata, tooltip provider, toaster, app cursor | ✅ |
| `app/globals.css` | **Design tokens** (colors, score colors, tints, radius) + Tailwind theme | ✅ |
| `components/ui/` | shadcn components (button, card, sidebar, table, tabs, dialog, select, accordion, progress, …). Generated — edit with care. accordion, dialog, dropdown-menu, progress, select, sheet, tabs, tooltip import their primitives from `@animate-ui/react` (ADR-008) | ✅ |
| `components/animate-ui/components/page-transition.tsx` | Animate UI page transition (view transitions). `PageTransition effect="content"` in `AppShell` (in-area page change: gentle centre zoom, top bar stays via `.app-top-bar` name); `RoleTransition` wraps each area (landing, onboarding, student, teacher) and zooms a new area in from the centre (`morph`: 60% → 100% + blur) | ✅ |
| `components/layout/app-shell.tsx` | Sidebar + main area for `/student/*` and `/teacher/*`. Sidebar hides fully (offcanvas); below `lg` (1024px) it is a slide-in drawer | ✅ |
| `components/layout/role-switcher.tsx` | Sidebar header (Animate UI "team switcher" style): Pronnova + current role, menu to switch Student / Teacher / home | ✅ |
| `components/layout/nav-user.tsx`, `current-user-menu.tsx` | Sidebar footer user card + menu (student: My progress, Switch student; teacher: Classes, Materials; both: Switch role). Server part loads the name and never throws | ✅ |
| `components/layout/sidebar-nav.tsx` | Sidebar links with active state (client; wrapped in Suspense); closes the phone/tablet drawer after a page change | ✅ |
| `components/layout/top-bar.tsx` | `TopBar` (title, subtitle, search, action) + `PageBody` | ✅ |
| `components/layout/brand-logo.tsx`, `coming-soon.tsx` | Logo link; Piko placeholder for unbuilt screens | ✅ |
| `components/layout/landing-nav.tsx` | Landing navbar (client): floating white rounded bar (`Home`, `How It Works`, `Student Experience`, `Pronunciation`, `For Teachers`, `About`, `Get started` `KiddyButton` → `/onboarding`, hidden on that page); slide-in menu below lg | ✅ |
| `components/landing/` | Guided 11-section interactive landing tour: `hero-card` (#top, `Get started` → `/onboarding` + `Try the demo`; headline in `hero-tagline`, slowed SwappingText in a fixed-width slot), `interactive-demo` (#demo, real `useRecorder` + mic-state orb + Web Speech playback + clearly labelled demo assessment), `how-it-works` (#how-it-works, 4-step interactive cycle), `learning-buddy` (#buddy, Piko prompt switcher), `learning-journey` (#journey, Basic/Medium/Advanced sample words), `assessment-showcase` (#assessment, speech recognition vs assessment panel), `teacher-preview` (#teachers, Class Overview / Student Progress switcher), `classroom-workflow` (#classroom, 5-step teacher-student loop), `young-learners` (#learners, 6 principles + interactive flashcards), `faq` (#faq, exclusive native accordion), `final-cta`, `site-footer` (+ `footer-wave` morphing seam) | ✅ |
| `components/brand/` | Shared landing design pieces used by app pages too (ADR-007): `kiddy-button` (coral CTA, link or button), `illustrations` (landing SVGs), `word-pictures` (`WordPicture`, picture per Class 1 word, letter-tile fallback), `piko` (`PikoSays` buddy + speech bubble), `ui` (`Eyebrow`, `Panel`, `PanelHeader`, `PanelTitle`, `OutlineButton/Link`, `InkButton/Link`, `StatTile`, `CheckDot`, level badge/tone + tab classes), `section-heading`, `app-cursor` (app-wide coral arrow cursor, Animate UI `Cursor` global, mounted in `app/layout.tsx`; mouse/pen only), `setup-steps` (pill steps Choose role → Pick class → Find your name → Start, on `/onboarding` and `/student/who`), `page-loader` (+ `page-loader.css`: loader on every full page load, logo "bite" animation, mounted in `app/layout.tsx`) | ✅ |
| `components/layout/page-skeleton.tsx` | Loading placeholder used as every DB page's Suspense fallback | ✅ |
| `components/layout/load-error.tsx` | Error screen body (DB not configured / load failed + Try again) | ✅ |
| `features/curriculum/` | `chapter-card.tsx` (art + stage/progress bar), `homework-list.tsx`, `level.ts` (level names) | ✅ |
| `features/materials/` | `material-editor.tsx` (one editor for new/edit: Write / Paste / Upload Word tabs → one list, inline edit, drag reorder, limits, unsaved-changes guard, locked banner), `material-library.tsx` (search, level filter, Open/Assign/Duplicate), `assign-dialog.tsx` (UC-08 assign only), `duplicate-button.tsx` | ✅ |
| `features/roster/roster-manager.tsx` | Classes & Students screen (add/rename class; add/edit/move/archive/unarchive students) | ✅ |
| `features/student/` | `identity.ts` (picked student: localStorage `pronnova.studentId` + cookie), `student-picker.tsx` ("Who are you?" + setup steps). Profile menu moved to `components/layout/nav-user.tsx` | ✅ |
| `components/brand/form.tsx` | `Field`, `BrandSelect`, `fieldClass`/`inputClass`, `levelDot` — shared brand form pieces | ✅ |
| `lib/api-client.ts` | `api()` browser fetch helper → `{ ok, status, data, error, fieldErrors }` | ✅ |
| `features/teacher/class-avatars.tsx` | Animate UI avatar group of the class's students (dashboard) | ✅ |
| `features/assessment/` | `score-pill.tsx` (score + class), `attempts-table.tsx` (history table; `showStudent` for teacher view), `play-recording-button.tsx` (fetches a signed link, plays/stops) | ✅ |
| `features/voice/` | `use-recorder.ts` (mic permission, MediaRecorder, 15 s auto-stop, silence/too-short checks, releases mic), `mic-status.tsx` (`MicStage`: the mic IS a large thinking-orbs dotted orb — tap it to record; its animation shows the state (ready / asking / listening / checking / recorded), with the state text, time and a hint below. `MicInline`: 20px orb + "Checking your voice…"), `sharp-orb.tsx` (`SharpOrb`: draws a thinking-orb crisply at any size from the library's engine — the component itself only renders 64/32/20px), `mic-cursor.tsx` (`MicCursor`: action hint that follows the pointer inside the mic section, e.g. "Click to record", "● Recording" — not the state text under the orb). Used in the practice recorder and the landing demo; the coral mic button, status pills and live waveform were removed 2026-11-28 | ✅ |
| `features/practice/` | `practice-recorder.tsx` — record → listen back → send → score + feedback / retry (UC-05, UC-04, UC-06) in the landing demo style; `practice-steps.tsx` header step chips; `listen-button.tsx` browser-voice "Listen" | ✅ |
| `hooks/use-mobile.ts` | Below-`lg` (1024px) check used by the sidebar (drawer mode) | ✅ |
| `lib/scoring.ts` | `classify()` (85/70 cut-offs), `errorRate()` | ✅ |
| `lib/progress.ts` | UC-03 rules (ADR-004): level unlock, item access, chapter stage, `continueItem` | ✅ |
| `lib/audio.ts` | Recording rules shared by browser + server: limits, allowed formats, `recordingProblem`, `wordUnit` | ✅ |
| `lib/materials.ts` | Material rules: 1–20 items, ≤ 25 words per item (hard), level fit + < 3 items (warnings), item-type detection, Pakistan-time dates | ✅ |
| `lib/split-items.ts` | `splitTextToItems(text, mode, level?)`: the ONE splitter for Paste and Word import (bullets, numbering, abbreviations) → preview | ✅ |
| `lib/assignments.ts`, `lib/roster.ts` | Assignment rules + visibility merge (`mergeVisible`, `pickDueDate`); class/student validation | ✅ |
| `lib/navigation.ts` | Sidebar menu per role | ✅ |
| `lib/speech-tts.ts` | Client Web Speech synthesis helper (`speakReference`) for landing pronunciation previews | ✅ |
| `lib/utils.ts` | `cn()` class helper | ✅ |
| `types/index.ts` | Shared types (Profile, Chapter, Lesson, LessonItem, results, AttemptSummary) | ✅ |
| `server/speech/` | Speech Engine: `types.ts` (contract), `index.ts` (`getSpeechEngine()`), `mock.ts`, `azure.ts` (stub), `python.ts` | ✅ |
| `server/db/client.ts` | `getDb()` — server-only Supabase client (secret key), `check()` error helper | ✅ |
| `server/db/demo-user.ts` | Demo teacher; picked student from the `pronnova_student` cookie (fallback: demo student). `getCurrentStudent()` (throws if archived), `findCurrentStudent()` (null), `getCurrentStudentOrPick()` (redirects to `/student/who`) | ✅ |
| `server/http.ts` | JSON helpers + `errorResponse` (maps PN404/PN409/PN422 and 23505/23503/23514 to HTTP) | ✅ |
| `server/services/docx-import.ts` | `.docx` → text (mammoth) → splitter; rejects non-docx, empty, > 5 MB | ✅ |
| `server/db/queries/roster.ts` | Classes + students (list/create/rename, create/edit/archive) | ✅ |
| `server/db/queries/assignments.ts` | `createAssignment` (RPC), `listVisibleAssignmentRows` (class OR student targets) | ✅ |
| `server/db/queries/curriculum.ts` | `listChapters`, `getChapterContent`, `getItem`, `isUuid` | ✅ |
| `server/db/queries/attempts.ts` | `listStudentAttempts`, `listClassAttempts`, `getTeacherStats`, `listClassStudents`, `teacherHasStudent` | ✅ |
| `server/db/queries/learning.ts` | `getStudentLearning` (view + homework + last item), `getItemAccess` | ✅ |
| `server/db/queries/attempt-store.ts` | Attempt writes/reads: upload/download recording, insert pending, mark failed, `completeAttempt` (RPC), `getAttemptResult` | ✅ |
| `server/db/queries/materials.ts` | Library: `listMaterials` (counts + locked), `getMaterial`, `createMaterial`, `createMaterialAndAssign`, `updateMaterial`, `duplicateMaterial` (all RPC) | ✅ |
| `server/services/attempts.ts` | UC-04 pipeline: `submitAttempt` (upload → pending → score → save), `retryAttempt`, `SCORING_VERSION` | ✅ |
| `stores/practice-store.ts` | Zustand: practice session phase (idle → recording → recorded → submitting → scored/failed/error), recording, result | ✅ |
| `supabase/migrations/0001_init.sql` | All 14 tables, checks, indexes, RLS on + server-only grants, `recordings` bucket | ✅ |
| `supabase/migrations/0002_materials.sql` | `lessons.visibility`, `create_material()` atomic save | ✅ |
| `supabase/migrations/0003_attempt_results.sql` | `complete_attempt()`: results + error stats + mark scored in one transaction, runs once per attempt | ✅ |
| `supabase/migrations/0004_roster_materials_assignments.sql` | Roster on profiles, materials = teacher lessons, assignments + targets, 5 atomic functions (see `database.md`) | ✅ |
| `supabase/seed.sql` | Demo people, class, 4 chapters, Class 1 lessons/items (every Basic word has a picture in `word-pictures.tsx`), homework, sample attempts. Re-runnable (wipes data) | ✅ |
| `engine/` | Python Speech Engine (research track). Only `README.md` so far | ✅ / 🕓 |
| `engine/eval/` | Test clips + comparison notes | ✅ README only |

## Routes
| Route | File | UC | |
|---|---|---|---|
| `/` | `app/page.tsx` | Guided 11-section interactive tour: Hero → Interactive Demo (`Apple` mic/TTS) → How Pronnova Works → Learning Buddy (`Piko`) → Learning Journey (`Basic`/`Medium`/`Advanced`) → Pronunciation Assessment → Teacher Dashboard preview → Classroom Workflow → Young Learners flashcards → FAQ → Final CTA & Footer | ✅ |
| `/onboarding` | `app/onboarding/page.tsx` | Choose **Student** or **Teacher** (picture cards). FYP-1 opens the demo user; FYP-2 → sign up / sign in | ✅ |
| `/student` | `app/student/page.tsx` | Dashboard: greeting + class, Continue, Your lessons (due-date highlight, progress), chapters, recent attempts. No pick → redirects to `/student/who` | ✅ |
| `/student/chapters` | `app/student/chapters/page.tsx` | UC-03 chapters + stage | ✅ |
| `/student/chapters/[chapterId]` | `app/student/chapters/[chapterId]/page.tsx` | UC-03 levels (locked in order) → items, homework badges | ✅ |
| `/student/practice/[itemId]` | `app/student/practice/[itemId]/page.tsx` | UC-04/05 record → send → score/retry; UC-06 basic result (full view 🕓 Phase 4) | ✅ |
| `/student/progress` | `app/student/progress/page.tsx` | UC-07 | placeholder (FYP-2) |
| `/student/who` | `app/student/who/page.tsx` | "Who are you?" picker: class → name → Continue (first visit; replaces login until FYP-2, ADR-002) | ✅ |
| `/teacher/classes` | `app/teacher/classes/page.tsx` | Classes & Students (roster). `/teacher/students` redirects here | ✅ |
| `/teacher/materials` | `app/teacher/materials/page.tsx` | Library + Assign dialog | ✅ |
| `/teacher/materials/new`, `/teacher/materials/[materialId]` | `app/teacher/materials/new/page.tsx`, `…/[materialId]/page.tsx` | One editor for new/edit (the only upload path); edit page lists the material's assignments (read-only) | ✅ |
| `/teacher` | `app/teacher/page.tsx` | UC-12 overview | ✅ DB stats + latest attempts |
| `/teacher/materials` | `app/teacher/materials/page.tsx` | UC-10 list of uploaded material + assignment | ✅ |
| `/teacher/materials/new` | `app/teacher/materials/new/page.tsx` | UC-10 upload form (saves via `saveMaterial`) | ✅ |
| `/teacher/chapters` | `app/teacher/chapters/page.tsx` | UC-11 | placeholder (FYP-2) |
| `/teacher/students` | `app/teacher/students/page.tsx` | UC-12 | placeholder (FYP-2) |
Both role areas share `components/layout/app-shell.tsx` via `app/student/layout.tsx` and `app/teacher/layout.tsx`, plus `error.tsx` in each area. `app/not-found.tsx` is the global 404.
**Pattern for DB pages:** the page component wraps an async inner component in `<Suspense fallback={<PageSkeleton/>}>` (Cache Components). Copy any `app/student/*/page.tsx`.

## API endpoints
| Method + path | Does | |
|---|---|---|
| `POST /api/attempts` | Form: `attemptId` (browser uuid = idempotency key), `itemId`, `durationMs`, `audio`. Saves audio + pending attempt, scores, saves results. 200 scored · 202 saved-but-failed · 400/403/404/413 · 503 nothing saved | ✅ |
| `POST /api/attempts/[attemptId]/retry` | Re-score a failed (or stuck pending) attempt from its stored audio; safe to repeat | ✅ |
| `GET /api/recordings/[attemptId]?as=student\|teacher` | 5-minute signed link to play a saved recording. Only the student who made it or a teacher of their class; otherwise 404 (also 404 when no audio was saved) | ✅ |
| `GET /api/attempts/[id]` | Attempt + word/phoneme results | 🕓 |
| `GET/POST /api/classes`, `PATCH /api/classes/[classId]` | List (with active student count) / create / rename classes | ✅ |
| `GET/POST /api/students`, `GET/PATCH /api/students/[studentId]`, `POST …/archive`, `POST …/unarchive` | Roster: list (filter by class, archived only if asked), create, get (404 if archived unless `includeArchived=true`), edit, archive/unarchive | ✅ |
| `GET/POST /api/materials`, `GET/PATCH /api/materials/[materialId]`, `POST …/duplicate` | Library: list, create (+ optional `assign`, one transaction), get, update (409 when items change after attempts), duplicate | ✅ |
| `POST /api/materials/split`, `POST /api/materials/import` | Preview only: pasted text / one `.docx` → items with word counts + warnings | ✅ |
| `POST /api/assignments` | UC-08 assign only: material + due date + class/student targets, one transaction | ✅ |
| `POST/DELETE /api/student/session` | Remember / forget the picked student (cookie) | ✅ |
| `GET /api/student/home` | Picked student's assigned materials (deduped, due date, progress) + Continue target; 404 if archived | ✅ |

## Data tables
Full explanation + how to change it: `database.md`. Columns list: `architecture.md` → Data model. Schema: `supabase/migrations/0001_init.sql`. New changes = a new numbered file, never edit an applied one.

## Assets in `public/`
| Path | Used in |
|---|---|
| `icons/pronnova-mark.svg` (+ `-on-dark`) | Brand mark (coral→orange sound columns) in `brand-logo.tsx` |
| `favicon.ico`, `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` | Browser/tab and iPhone icons, linked in `app/layout.tsx` metadata |
| `site.webmanifest`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `maskable-icon-512x512.png` | Install / home-screen icons (theme colour `#FF594B`) |
| `photos/*.jpg` | 8 free-licence classroom photos (sources in `design.md`). Unused since the 3b4bd89 landing redesign; keep the credits if reused |
| `hero/pronnova-swing-crew.png`, `hero/piko-portrait.png` | Landing hero swing crew + consistent Piko learning buddy portrait (Gemini-generated in Pronnova coral/orange palette) |
| `hero/hero-hillside-reading.jpg` | Previous landing hero background (unused now) |
| `avatar/avatar_sitting_with_studentrs.jpg` | Unused now (was the landing hero) |
| `avatar/avatar_standing_beside_dice.png` | Teacher dashboard tip card |
| `avatar/avatar_speaking.png` | Unused now (`coming-soon.tsx` uses Piko) |
| `avatar/avatar_sitting_and_speaking.jpg`, `avatar_staanding.jpg` | Unused yet |
| `objects/img1–4.jpg` | Chapter cards (`chapters.cover_image` in the seed) |
| `Microphone-flow.png` | Docs only |

## Old prototype — ideas to borrow (`D:\FYP_1\pronnova`, read-only)
| Old file | Idea |
|---|---|
| `features/voice/hooks/useAudioRecorder.ts` | MediaRecorder, webm→mp4 fallback, 15 s auto-stop, permission errors |
| `features/voice/hooks/useAudioAnalyser.ts`, `WaveformVisualizer.tsx` | Live waveform |
| `stores/voiceStore.ts` | Recording state machine (Zustand) |
| `features/assessment/*` | Word feedback list, retry banner |
Its schema does **not** match the SRS ER diagram.
