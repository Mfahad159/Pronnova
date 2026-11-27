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
2. The **practice page** shows the text. Student taps the **microphone**. The browser asks for the mic the first time.
3. Student reads aloud and taps **Stop** (auto-stops at 15 s), or **Cancel** to throw it away. Too short or silent recordings are caught right away with a clear message.
4. Student listens back, then taps **Send** (or **Record again**). The browser sends the audio plus its own attempt id to `POST /api/attempts` — sending twice is safe.
5. The server (`server/services/attempts.ts`):
   - saves the audio in the private `recordings` bucket,
   - creates an `attempts` row with status **pending** (so nothing is lost),
   - sends audio + reference text to the **Speech Engine**,
   - saves word and sound results, the score, and the class (Excellent ≥85 / Good 70–84 / Average <70),
   - updates the student's error counts (`error_stats`) — results and counts are saved together by the DB function `complete_attempt()`.
6. The page shows score, class, wrong words and sounds. Student can hear the correct word and **try again**.
7. If scoring fails, the attempt stays **failed** with its audio. **Try checking again** calls `/api/attempts/[attemptId]/retry`.
   (Phase 3 shows the score and coloured words; tips, playback of the correct word and the full feedback view come in Phase 4.)

### A teacher uploads material (UC-10)
1. Teacher opens **Materials → Upload material**, enters title, instructions, chapter, level, class (or "Don't assign yet") and due date.
2. Types items one per line. The form removes duplicates, guesses each type (word/phrase/sentence/paragraph) and lets the teacher change it.
3. The Server Action `saveMaterial` (`features/materials/actions.ts`) checks everything again, then calls the DB function `create_material()` — lesson, items and assignment are saved together or not at all.
4. Assigned students see it in **Homework** on their home page and inside that chapter/level, even if the level is locked for them. Unassigned material is invisible to students.

### How a student moves through chapters (UC-03)
- Every chapter starts at **Basic**. **Medium** opens when every Basic item has a best score of 70% or more; **Advanced** the same after Medium (ADR-004).
- **Continue** on the home page opens the last item they tried, or the next one they haven't mastered.
- The rules are in `lib/progress.ts`; the server enforces them on the practice page and the attempts API.

### Who is logged in? (FYP-1)
No login in FYP-1 (see `decisions/002-fyp1-no-auth.md`). The landing page's **Get started** opens `/onboarding`, where you choose **demo student** or **demo teacher** (also reachable from "Switch role" in the sidebar). Real sign-up/sign-in comes in FYP-2.

## 3. Run it locally
Needs: Node.js 22+ (Supabase dropped Node 20), npm, and a free Supabase project.

### One-time database setup
1. Create a project at supabase.com (free plan).
2. Create a file named `.env.local` in the project root (it is git-ignored) with the variables from the table below. Get the values from the Supabase dashboard, or privately from a teammate. At minimum:
   - `SUPABASE_URL` — Project Settings → Data API (looks like `https://abcd.supabase.co`)
   - `SUPABASE_SECRET_KEY` — Project Settings → API Keys → **Secret** key (`sb_secret_…`). Never put it in any committed file, chat or screenshots.
3. Supabase dashboard → **SQL Editor** → paste each file in `supabase/migrations/` **in order** (0001, 0002, 0003, 0004) → Run each.
4. Same place → paste `supabase/seed.sql` → Run. (Run the seed again any time to reset demo data — it **wipes** all app data first.)
5. Check it:

```powershell
npm run db:check
```
   Every table should show ✓ and the `recordings` bucket should exist.
   Prefer the terminal? Put `SUPABASE_DB_URL` in `.env.local` and run `npm run db:push`, then `npm run db:seed` instead of steps 3–4 (details: `database.md`).

### Run the app
Use npm only (the repo's lock file is `package-lock.json`). Don't run `bun install`, `yarn` or `pnpm` — they create a second lock file that drifts from npm's. Never add the project to its own dependencies (e.g. `"pronnova": "."`).

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
- New Tailwind classes not showing in `npm run dev`? Stop the dev server, delete the `.next/dev` folder, start again (stale dev cache).
- Database commands (`npm run db:push / db:seed / db:status / db:verify`) use a direct Postgres connection (`pg` + `SUPABASE_DB_URL`), not `supabase.exe` (Windows Application Control blocks it on our PCs). The SQL Editor still works as a fallback.
- Building a new screen? Use the pieces in `components/brand/` (`KiddyButton`, `Panel`, `PikoSays`, `WordPicture`, …), not plain shadcn buttons/cards — the landing page is the design base (ADR-007). A unit test checks this.
- The logo loader shows on every full page load (opening the site, refresh), not when moving between pages inside the app. It waits for the page to load, finishes the current bite, then fades; it never stays longer than 8 s.
- Motion comes from Animate UI (ADR-008). Added a new shadcn component? Run `npx @animate-ui/cli@latest animate <name>` to animate it. Gotchas: a `Highlight` needs `inset-0` in its `className` (else it is 0×0); don't use `HighlightItem asChild` around a link (it nests the link twice) — use `as="li"`; anything that calls `usePathname()` in a layout must sit in `<Suspense>` (Cache Components).
- CSS modules (`*.module.css`) don't work here: `next.config.ts` sends every `.css` file through Tailwind as plain CSS. Use Tailwind classes, or a plain `.css` file with prefixed class names (like `components/brand/page-loader.css`).
- **Students pick their name** (no login): `/student/who` → class → name. It's remembered in a cookie on that device; "Not Ayesha?" on the student home switches. An archived student is sent back to the picker.
- **Teacher library:** paste text or import one Word `.docx` (≤ 5 MB) → the items are split into a preview you can edit → Save. Nothing is stored until Save. After any student attempts a material, its items are locked: use **Duplicate**, then edit the copy.
- **Database tests:** `npm run test:db` runs the real DB rules (rollback, lock, CHECKs, visibility) against the project in `.env.local`. It creates rows named `zz-test-…` and deletes them at the end. Needs migration 0004.
- Item limits: up to 25 words per item (hard: the 15 s recording). The form warns (never blocks) when an item doesn't fit its level (Basic 1–3, Medium 4–10, Advanced 11–20 words) or a material has fewer than 3 items.
- Browser tests use Chrome's fake microphone. `E2E_MUTATE=1 npm run test:e2e` also runs the tests that save data; `E2E_FIREFOX=1` adds Firefox.
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
| Change fonts | `app/layout.tsx` (load) + `--font-sans` / `--font-heading` in `app/globals.css` |
| Add a shadcn component | `npx shadcn@4.23.0 add <name>` → lands in `components/ui/` |
| Change demo data | `supabase/seed.sql`, then re-run it in the SQL Editor |
| Read something new from the DB | Add a function in `server/db/queries/`, call it from a page inside `<Suspense>` |
| Change score cut-offs (85/70) | `lib/scoring.ts` (later also the `settings` table) |
| Change when levels unlock | `PASS_SCORE` / `chapterView` in `lib/progress.ts` (+ update ADR-004) |
| Change upload limits (items, sentence length) | `MATERIAL_LIMITS` in `lib/materials.ts` |
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
