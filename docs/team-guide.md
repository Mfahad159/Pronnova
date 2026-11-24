# Team guide

Plain-English guide for the Pronnova team. Keep it updated as the code changes.

> Status (2026-11-24): Phase 1 — pages read from Supabase. Recording and saving attempts come in Phase 3. Sections marked 🕓 describe the plan.

## 1. What lives where
- `docs/` — all explanations. Start at `docs/index.md`.
- `docs/codebase-index.md` — the map: every folder, page, API and table, one line each.
- `specs/` — what each feature must do, and how we check it's done.
- `public/` — images the app shows (logo, teacher avatar, kids illustrations).
- App code: pages in `app/`, shared UI in `components/`, feature code in `features/`, server logic in `server/`, small helpers in `lib/`, shared types in `types/`.
- `supabase/` holds the database: `migrations/` (tables) and `seed.sql` (demo data). `server/db/` is the only code that talks to it.

Simple rule: **pages are thin**. A page loads data and puts feature components on screen. Real logic lives in `server/services/` (server) or `features/<name>/` (UI).

## 2. Main flows

### A student practises a sentence (UC-03 → 04 → 05 → 06)
1. Student opens **Chapters**, picks a chapter, a level (Basic/Medium/Advanced), then an item.
2. The **practice page** shows the text. Student taps **Record**. Browser asks for the mic once.
3. Student reads aloud, taps **Stop** (auto-stops at 15 s). They can listen back or cancel.
4. Tap **Submit** → the browser sends the audio to `POST /api/attempts`.
5. The server:
   - saves the audio in the private `recordings` bucket,
   - creates an `attempts` row with status **pending** (so nothing is lost),
   - sends audio + reference text to the **Speech Engine**,
   - saves word and sound results, the score, and the class (Excellent ≥85 / Good 70–84 / Average <70),
   - updates the student's error counts (`error_stats`).
6. The page shows score, class, wrong words and sounds. Student can hear the correct word and **try again**.
7. If scoring fails, the attempt stays **failed** with its audio. A **Retry** button calls `/api/attempts/[id]/retry`.

### A teacher uploads material (UC-10)
1. Teacher opens **Upload material**, enters title, instructions, due date.
2. Adds words/phrases/sentences, picks chapter + level, optionally a class.
3. `POST /api/materials` saves a lesson and its items. Students see it under that chapter.

### Who is logged in? (FYP-1)
No login in FYP-1 (see `decisions/002-fyp1-no-auth.md`). The landing page lets you enter as a **demo student** or **demo teacher**. Real sign-up/sign-in comes in FYP-2.

## 3. Run it locally
Needs: Node.js 22+ (Supabase dropped Node 20), npm, and a free Supabase project.

### One-time database setup
1. Create a project at supabase.com (free plan).
2. Create a file named `.env.local` in the project root (it is git-ignored) with the variables from the table below. Get the values from the Supabase dashboard, or privately from a teammate. At minimum:
   - `SUPABASE_URL` — Project Settings → Data API (looks like `https://abcd.supabase.co`)
   - `SUPABASE_SECRET_KEY` — Project Settings → API Keys → **Secret** key (`sb_secret_…`). Never put it in any committed file, chat or screenshots.
3. Supabase dashboard → **SQL Editor** → paste all of `supabase/migrations/0001_init.sql` → Run.
4. Same place → paste `supabase/seed.sql` → Run. (Run the seed again any time to reset demo data — it **wipes** all app data first.)
5. Check it:

```powershell
npm run db:check
```
   Every table should show ✓ and the `recordings` bucket should exist.

### Run the app
```powershell
npm install
```
```powershell
npm run dev
```
Open http://localhost:3000. With `SPEECH_ENGINE=mock` you don't need any AI keys.

Before pushing, run these checks (they must pass):
```powershell
npm run lint
```
```powershell
npm test
```
```powershell
npm run build
```

### Good to know: this Next.js version
- **Cache Components is on.** A page that reads URL params (like `[chapterId]`) or loads live data must do it inside a `<Suspense>` block, or the build fails. Copy the pattern in `app/student/chapters/[chapterId]/page.tsx`.
- Next.js ships its own docs in `node_modules/next/dist/docs/`. They match our installed version, so check there before relying on older tutorials.

### Environment variables (`.env.local`, never commit it)
All `.env*` files and `*.docx` files are git-ignored on purpose. Don't force-add them.
| Name | Needed for | Where to get it |
|---|---|---|
| `SUPABASE_URL` | DB + storage (server only) | Supabase → Project Settings → Data API |
| `SUPABASE_SECRET_KEY` | Server-side DB access (secret!) | Supabase → Project Settings → API Keys → Secret |
| `SUPABASE_DB_URL` | Optional: create/alter tables from the terminal (`npm run db:push`) | Supabase → Connect → Session pooler URI + DB password |
| `SPEECH_ENGINE` | Which scorer: `mock`, `azure`, `python` | Your choice. Start with `mock` |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | `azure` engine | Azure portal → Speech resource |
| `SPEECH_ENGINE_URL` | `python` engine | URL of the Python service |
| `GEMINI_API_KEY` | Suggestions (FYP-2) | Google AI Studio |

Only variables starting with `NEXT_PUBLIC_` reach the browser. Everything else stays on the server.

### Two ways to score (we build both at once)
- **Azure** (`SPEECH_ENGINE=azure`): what the app uses first. Needs the Azure key.
- **Our own Python engine** (`SPEECH_ENGINE=python`): built in `engine/` by one teammate. It's a small web service; the app sends it audio + text and gets back the same result shape as Azure. Setup steps will live in `engine/README.md` 🕓.
- Both must return the same result shape (see `architecture.md` → Speech Engine contract). That's what lets us switch with one setting.

## 4. Where to add or change things
| I want to… | Go to |
|---|---|
| Add a page | `app/<area>/<name>/page.tsx` using `TopBar` + `PageBody`, then add it to `codebase-index.md` |
| Change sidebar links | `lib/navigation.ts` |
| Change colors | Tokens at the top of `app/globals.css` — not inside components |
| Change fonts | `app/layout.tsx` |
| Add a shadcn component | `npx shadcn@4.23.0 add <name>` → lands in `components/ui/` |
| Change demo data | `supabase/seed.sql`, then re-run it in the SQL Editor |
| Read something new from the DB | Add a function in `server/db/queries/`, call it from a page inside `<Suspense>` |
| Change score cut-offs (85/70) | `lib/scoring.ts` (later also the `settings` table) |
| Swap or fix the speech scorer | `server/speech/<engine>.ts`. Keep the contract in `architecture.md` |
| Work on our own scoring model | `engine/` (Python). Test it with `engine/eval/` clips |
| Change what Gemini is asked | `server/services/suggestions` 🕓 |
| Add a table or column | Follow `docs/database.md` → "How to change the database" (new numbered migration, apply, update queries + docs, log it) |
| Add demo data | `supabase/seed.sql` |
| Add a UI block from shadcn/21st.dev | `components/ui/` — see `agent-skills.md` |

## 5. Habits
- Small pull requests, one feature each.
- Update `docs/codebase-index.md` in the same PR when you add/move files.
- Never paste keys into code, chats or screenshots.
- Test on Chrome **and** a phone (SRS needs mobile).
