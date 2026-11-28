# Pronnova docs — index

Read this first. Then open only what your task needs.

| Doc | What it's for | Read when |
|---|---|---|
| [codebase-index.md](codebase-index.md) | Map of folders, routes, APIs, tables, assets | Before touching any code |
| [team-guide.md](team-guide.md) | Plain-English guide: structure, main flows, run locally, where to change things | New to the project, or onboarding a teammate |
| [qa-report.md](qa-report.md) | Phase 5 QA: every check, bugs fixed, what is still open, how to re-run | Before a release or the evaluation |
| [demo-script.md](demo-script.md) | 12-minute demo for the FYP-1 evaluation + likely questions | Preparing the demo |
| [srs.md](srs.md) | Full SRS in Markdown (use cases, requirements, 21 diagrams in `srs/`) | You need exact requirement wording or a use case flow — search it, don't read it all |
| [project-context.md](project-context.md) | What Pronnova is, users, scope, use cases | You need the "why" |
| [database.md](database.md) | Every table and why it exists, design decisions (viva Q&A), how to change the schema, migration log | Touching the database or defending its design |
| [architecture.md](architecture.md) | Parts of the system and how they talk | Changing data flow or adding a service |
| [stack-options.md](stack-options.md) | Free-tier comparison + recommendation | Choosing or changing a service |
| [design.md](design.md) | Layout, style, reference image, asset use | Building UI |
| [design/image-prompts.md](design/image-prompts.md) | Prompts to generate new illustrations in the Pronnova art style | Making new images/avatars |
| [agent-skills.md](agent-skills.md) | Approved AI skills + UI component sources | Before installing a skill or copying UI blocks |
| [decisions/](decisions/) | Decision records: 001 stack, 002 no login in FYP-1, 003 test tools, 004 lesson access (unlock + visibility), 005 speech contract frozen, 006 audience Class 1, 007 landing page is the design base, 008 Animate UI motion + lucide arrows | You want to know why something was chosen |
| [../specs/README.md](../specs/README.md) | Feature specs | Before building a feature |
| [../AGENTS.md](../AGENTS.md) | Rules for AI agents | Always (agents) |

Original inputs (read-only, don't edit): `../Pronnova_SRS_Updated_28_oct.docx` (local only, git-ignored), `../Pronnova_mds/` (first doc draft, now replaced by this folder). Old prototype for ideas only: `D:\FYP_1\pronnova` (do not edit).

## Status (2026-11-24)
- Docs set up. Stack **confirmed** (`decisions/001-stack.md`): Next.js on Vercel, Supabase, Azure + own Python engine in parallel, Gemini, browser voice. No login in FYP-1 (`decisions/002`).
- **App scaffolded** (Phase 0): app shell, design tokens, all routes (some placeholders), `POST /api/attempts` with the mock scorer, Speech Engine adapters (azure = stub). Sample data only, no database yet. Lint + build pass.
- **Phase 1 done:** schema + seed applied; pages read from Supabase; security check passes.
- **Phase 2 done:** teachers upload material (UC-10); students see chapters with their stage, locked levels, homework and Continue (UC-03). 
- **Phase 3 done:** students record, listen back and send; attempts are saved safely (failed ones keep their audio and can be retried), results and error counts saved together. Next: Phase 4 on the team's "continue".
- Plan: `../specs/fyp1-implementation-plan.md`. One phase at a time, on the team's "continue".

## Open conflicts (decided here, please confirm)
| # | Conflict | Call made |
|---|---|---|
| 1 | `Pronnova_mds` says **Grade 1** students; SRS scope says **Class 6–10** (curriculum levels "from Class 1") | Resolved 2026-11-26: team chose **Class 1** for FYP-1 (ADR-006) |
| 2 | `Pronnova_mds` says **React**; old prototype used **Next.js** (its ADR-002) | Resolved: team confirmed Next.js (ADR-001) |
| 3 | Levels: `Pronnova_mds` says Easy/Medium/Advanced; SRS says **Basic/Medium/Advanced** | Follow SRS |
| 4 | Old prototype skipped auth in FYP-1 (university policy, its ADR-003); SRS has UC-01/02 | Resolved: team confirmed no auth in FYP-1 (ADR-002) |
| 5 | Old docs point to `specs/fyp1-implementation-plan.md`, which never existed | Recreated as a draft in `specs/fyp1-scope.md` |
| 6 | SRS needs 50 concurrent users; Azure Speech free tier allows **1 concurrent** request | Fine for demo; queue requests or use student credit for the final eval |
| 7 | `public/audit-screenshots/` (9.5 MB) is test output from the old project; anything in `public/` is served to users | Resolved: moved to `archive/old-public/` (git-ignored), with the create-next-app SVGs |
| 9 | ER diagram lacks fields UC-10 and the UI need (lesson title/instructions, chapter art) | Added as columns; listed in `architecture.md` |
| 10 | Supabase renamed keys (secret `sb_secret_…`) and no longer auto-exposes new tables | Env is `SUPABASE_URL` + `SUPABASE_SECRET_KEY`; migration grants tables to `service_role` only |
| 11 | SRS 3.2.2 "show a lesson only when assigned" vs UC-03 self-selected practice; SRS never says when a level unlocks | ADR-004: built-in lessons open to all (levels unlock at ≥70% on every item of the previous level); teacher material only for assignees |
| 12 | Not-found inside a streamed (Suspense) page returns HTTP 200 with the 404 screen | Resolved (Phase 5): by design in Next — status is sent before streaming; Next adds `noindex` instead (checked by `qa-routing.spec.ts`) |
| 17 | Brief (2026-11-28) names levels easy/medium/hard; SRS + app use Basic/Medium/Advanced | Team: keep Basic/Medium/Advanced; easy=basic, hard=advanced in the brief's rules |
| 18 | Brief's 25-word cap vs ADR-006's 8-word Class 1 cap | Team: brief wins (25 hard, level fit as warnings); ADR-006 updated |
| 19 | Brief wants `students`, `materials`, `material_items` tables, but `profiles`, `lessons`, `lesson_items` already do the job | Team: extend the existing tables (no parallel system); `enrollments` folded into `profiles.class_id` and dropped |
| 20 | Brief: one shared splitter for "Paste" and "Word import"; it also says Urdu text passes through unchanged | Splitter only splits on . ! ? — Urdu "۔" is NOT treated as a sentence end, so Urdu text stays whole |
| 24 | Font: teammate's commit 4361d45 switched the app to **Quicksand**; earlier request + older docs say **Google Sans Flex** | Kept Quicksand (latest, consistent everywhere); **team to confirm** |
| 25 | WCAG AA vs brand: white on the bright KiddyButton coral is 3.1:1; soft field borders 1.3:1 | **KiddyButton: team kept the brand coral (2026-11-28), accepted exception.** Field borders: still open, options in `docs/qa-report.md` §6 |
| 26 | Unslop audit flags emoji / "!" / uppercase chips; they're the deliberate Class 1 tone (ADR-006/007) | Kept; list in `docs/qa-report.md` §4 |
| 21 | Phase B brief labels levels Easy/Medium/Hard ("Long for Easy…") | Kept Basic/Medium/Advanced (team decision #17); warnings read "Long for Basic: 1–3 words suggested" |
| 22 | Phase B brief: keep the picked student in `localStorage` | Server-rendered pages can't read localStorage, so the id is in localStorage AND mirrored to a cookie (`pronnova_student`) |
| 23 | Brief: "no progress analytics" on the dashboard; the old home had chapters + attempt history | Dashboard = greeting, Continue, Your lessons; chapter cards and the recent-attempts list (UC-03/UC-06 playback) stay below — no charts |
| 16 | Icons: the project standard is Phosphor (`components.json`); the team asked for lucide arrows, and Animate UI components ship with lucide | Both installed (ADR-008): Phosphor for icons in general, lucide for arrows and inside Animate UI components |
| 14 | SRS 2.4 allows sentences of about 15 words; Class 1 (ADR-006) needs much shorter ones | Upload limit is 8 words per sentence with a warning above 6 (`MATERIAL_LIMITS`); raise it if the audience changes |
| 13 | Plan asks for Firefox + Safari checks; Windows blocked the downloaded Firefox and Safari can't run here | Firefox e2e is opt-in (`E2E_FIREFOX=1`); both checked by hand in Phase 5 |
| 14 | New logo/favicon came indigo→cyan; the app UI is coral/orange | Resolved: logo + favicons recoloured to coral→orange (same shapes), UI stays coral |
| 8 | Reference design is a green, adult audio-tool dashboard | Keep its layout; use Pronnova's coral/orange brand and friendlier tone (design.md) |
| 15 | Landing page (3b4bd89) is built for young learners; earlier docs said Class 6–10 | Resolved 2026-11-26: audience is Class 1 (ADR-006); landing page is the design base for all screens (ADR-007) |
