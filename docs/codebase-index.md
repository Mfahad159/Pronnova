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
| `vitest.config.ts`, `tests/unit/` | Unit tests (`npm test`) | ✅ |
| `playwright.config.ts`, `tests/e2e/` | Browser tests (`npm run test:e2e`): routes + Phase 2 flows. `E2E_MUTATE=1` also runs tests that write data | ✅ |
| `scripts/db-check.mjs` | `npm run db:check`: checks tables, seed, bucket and that the browser key is blocked | ✅ |
| `scripts/db.mjs` | `npm run db:push / db:seed / db:status / db:verify` via the Supabase CLI (needs `SUPABASE_DB_URL`) | ✅ |
| `supabase/config.toml` | Supabase CLI config (from `supabase init`); `[db.seed]` points at `seed.sql` | ✅ |
| `supabase/checks/access.sql` | Read-only security check used by `db:verify` | ✅ |
| `next.config.ts` | `cacheComponents`, `partialPrefetching`, Tailwind loader | ✅ |
| `components.json` | shadcn/ui config | ✅ |
| `eslint.config.mjs` | Lint rules; ignores `.agents/`, `archive/`, `Pronnova_mds/` | ✅ |
| `.agents/skills/` + `skills-lock.json` | Agent skills (see `docs/agent-skills.md`); `.claude/skills/` links to them | ✅ |
| `.claude/launch.json` | Dev server config for the Claude preview pane | ✅ |
| `archive/` | Old files moved out of `public/` (git-ignored) | ✅ |
| `Pronnova_SRS_Updated_28_oct.docx` | Original SRS (git-ignored: `*.docx` never committed; Markdown copy is `docs/srs.md`) | local only |
| `Pronnova_mds/` | First doc draft (read-only) | ✅ |

## App code
| Folder / file | Holds | |
|---|---|---|
| `app/layout.tsx` | Root layout: fonts (Plus Jakarta Sans), tooltip provider, toaster, metadata | ✅ |
| `app/globals.css` | **Design tokens** (colors, score colors, tints, radius) + Tailwind theme | ✅ |
| `components/ui/` | shadcn components (button, card, sidebar, table, tabs, dialog, select, …). Generated — edit with care | ✅ |
| `components/layout/app-shell.tsx` | Sidebar + main area for `/student/*` and `/teacher/*` | ✅ |
| `components/layout/sidebar-nav.tsx` | Sidebar links with active state (client; wrapped in Suspense) | ✅ |
| `components/layout/top-bar.tsx` | `TopBar` (title, subtitle, search, action) + `PageBody` | ✅ |
| `components/layout/brand-logo.tsx`, `coming-soon.tsx` | Logo link; placeholder card for unbuilt screens | ✅ |
| `components/layout/page-skeleton.tsx` | Loading placeholder used as every DB page's Suspense fallback | ✅ |
| `components/layout/load-error.tsx` | Error screen body (DB not configured / load failed + Try again) | ✅ |
| `features/curriculum/` | `chapter-card.tsx` (art + stage/progress bar), `homework-list.tsx`, `level.ts` (level names) | ✅ |
| `features/materials/` | `material-form.tsx` (UC-10 form, live item preview), `actions.ts` (`saveMaterial` Server Action) | ✅ |
| `features/assessment/` | `score-pill.tsx` (score + class), `attempts-table.tsx` (history table; `showStudent` for teacher view) | ✅ |
| `features/practice/`, `features/voice/` | Recorder, waveform, result view | 🕓 Phase 3 |
| `hooks/use-mobile.ts` | Phone-width check used by the sidebar | ✅ |
| `lib/scoring.ts` | `classify()` (85/70 cut-offs), `errorRate()` | ✅ |
| `lib/progress.ts` | UC-03 rules (ADR-004): level unlock, item access, chapter stage, `continueItem` | ✅ |
| `lib/materials.ts` | UC-10 rules: item-type detection, line parsing, validation, Pakistan-time dates | ✅ |
| `lib/navigation.ts` | Sidebar menu per role | ✅ |
| `lib/utils.ts` | `cn()` class helper | ✅ |
| `types/index.ts` | Shared types (Profile, Chapter, Lesson, LessonItem, results, AttemptSummary) | ✅ |
| `server/speech/` | Speech Engine: `types.ts` (contract), `index.ts` (`getSpeechEngine()`), `mock.ts`, `azure.ts` (stub), `python.ts` | ✅ |
| `server/db/client.ts` | `getDb()` — server-only Supabase client (secret key), `check()` error helper | ✅ |
| `server/db/demo-user.ts` | Fixed demo student/teacher ids + `getCurrentStudent/Teacher()` (FYP-2: swap for login) | ✅ |
| `server/db/queries/curriculum.ts` | `listChapters`, `getChapterContent`, `getItem`, `isUuid` | ✅ |
| `server/db/queries/attempts.ts` | `listStudentAttempts`, `listClassAttempts`, `getTeacherStats` | ✅ |
| `server/db/queries/learning.ts` | `getStudentLearning` (view + homework + last item), `getItemAccess` | ✅ |
| `server/db/queries/materials.ts` | `listTeacherClasses`, `listTeacherMaterials`, `createMaterial` (RPC) | ✅ |
| `server/services/` | Attempt saving, curriculum, suggestions | 🕓 |
| `stores/` | Zustand recording-session store | 🕓 Phase 3 |
| `supabase/migrations/0001_init.sql` | All 14 tables, checks, indexes, RLS on + server-only grants, `recordings` bucket | ✅ |
| `supabase/migrations/0002_materials.sql` | `lessons.visibility`, `create_material()` atomic save | ✅ |
| `supabase/seed.sql` | Demo people, class, 4 chapters, lessons, items, homework, sample attempts. Re-runnable (wipes data) | ✅ |
| `engine/` | Python Speech Engine (research track). Only `README.md` so far | ✅ / 🕓 |
| `engine/eval/` | Test clips + comparison notes | ✅ README only |

## Routes
| Route | File | UC | |
|---|---|---|---|
| `/` | `app/page.tsx` | Landing, pick demo role | ✅ |
| `/student` | `app/student/page.tsx` | Home: Continue, homework, chapter cards with stage, recent attempts (UC-03) | ✅ |
| `/student/chapters` | `app/student/chapters/page.tsx` | UC-03 chapters + stage | ✅ |
| `/student/chapters/[chapterId]` | `app/student/chapters/[chapterId]/page.tsx` | UC-03 levels (locked in order) → items, homework badges | ✅ |
| `/student/practice/[itemId]` | `app/student/practice/[itemId]/page.tsx` | UC-04/05/06 | ✅ text + locked/hidden guard; recording 🕓 Phase 3 |
| `/student/progress` | `app/student/progress/page.tsx` | UC-07 | placeholder (FYP-2) |
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
| `POST /api/attempts` | Form data `audio` + `itemId` → validates → scores with the selected engine → returns result + classification. 404 hidden / 403 locked items (ADR-004). Doesn't save yet (Phase 3) | ✅ |
| `POST /api/attempts/[id]/retry` | Re-score a failed attempt | 🕓 |
| `GET /api/attempts/[id]` | Attempt + word/phoneme results | 🕓 |
| `GET /api/recordings/[attemptId]` | Short-lived signed URL for playback | 🕓 |
| Server Action `saveMaterial` | UC-10: validate + `create_material()` (lesson + items + assignment in one transaction) | ✅ |

## Data tables
Full explanation + how to change it: `database.md`. Columns list: `architecture.md` → Data model. Schema: `supabase/migrations/0001_init.sql`. New changes = a new numbered file, never edit an applied one.

## Assets in `public/`
| Path | Used in |
|---|---|
| `icons/logo.svg` | `brand-logo.tsx`, favicon |
| `avatar/avatar_sitting_with_studentrs.jpg` | Landing hero |
| `avatar/avatar_standing_beside_dice.png` | Teacher dashboard tip card |
| `avatar/avatar_speaking.png` | `coming-soon.tsx` |
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
