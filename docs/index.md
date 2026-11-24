# Pronnova docs — index

Read this first. Then open only what your task needs.

| Doc | What it's for | Read when |
|---|---|---|
| [codebase-index.md](codebase-index.md) | Map of folders, routes, APIs, tables, assets | Before touching any code |
| [team-guide.md](team-guide.md) | Plain-English guide: structure, main flows, run locally, where to change things | New to the project, or onboarding a teammate |
| [srs.md](srs.md) | Full SRS in Markdown (use cases, requirements, 21 diagrams in `srs/`) | You need exact requirement wording or a use case flow — search it, don't read it all |
| [project-context.md](project-context.md) | What Pronnova is, users, scope, use cases | You need the "why" |
| [database.md](database.md) | Every table and why it exists, design decisions (viva Q&A), how to change the schema, migration log | Touching the database or defending its design |
| [architecture.md](architecture.md) | Parts of the system and how they talk | Changing data flow or adding a service |
| [stack-options.md](stack-options.md) | Free-tier comparison + recommendation | Choosing or changing a service |
| [design.md](design.md) | Layout, style, reference image, asset use | Building UI |
| [agent-skills.md](agent-skills.md) | Approved AI skills + UI component sources | Before installing a skill or copying UI blocks |
| [decisions/](decisions/) | Decision records: 001 stack, 002 no login in FYP-1, 003 test tools | You want to know why something was chosen |
| [../specs/README.md](../specs/README.md) | Feature specs | Before building a feature |
| [../AGENTS.md](../AGENTS.md) | Rules for AI agents | Always (agents) |

Original inputs (read-only, don't edit): `../Pronnova_SRS_Updated_28_oct.docx` (local only, git-ignored), `../Pronnova_mds/` (first doc draft, now replaced by this folder). Old prototype for ideas only: `D:\FYP_1\pronnova` (do not edit).

## Status (2026-11-24)
- Docs set up. Stack **confirmed** (`decisions/001-stack.md`): Next.js on Vercel, Supabase, Azure + own Python engine in parallel, Gemini, browser voice. No login in FYP-1 (`decisions/002`).
- **App scaffolded** (Phase 0): app shell, design tokens, all routes (some placeholders), `POST /api/attempts` with the mock scorer, Speech Engine adapters (azure = stub). Sample data only, no database yet. Lint + build pass.
- **Phase 1 code done:** schema + seed + server queries; all pages read from Supabase. Waiting for the team's Supabase project to run the DB checks.
- Plan: `../specs/fyp1-implementation-plan.md`. One phase at a time, on the team's "continue".

## Open conflicts (decided here, please confirm)
| # | Conflict | Call made |
|---|---|---|
| 1 | `Pronnova_mds` says **Grade 1** students; SRS scope says **Class 6–10** (curriculum levels "from Class 1") | Follow SRS: Class 6–10 users |
| 2 | `Pronnova_mds` says **React**; old prototype used **Next.js** (its ADR-002) | Resolved: team confirmed Next.js (ADR-001) |
| 3 | Levels: `Pronnova_mds` says Easy/Medium/Advanced; SRS says **Basic/Medium/Advanced** | Follow SRS |
| 4 | Old prototype skipped auth in FYP-1 (university policy, its ADR-003); SRS has UC-01/02 | Resolved: team confirmed no auth in FYP-1 (ADR-002) |
| 5 | Old docs point to `specs/fyp1-implementation-plan.md`, which never existed | Recreated as a draft in `specs/fyp1-scope.md` |
| 6 | SRS needs 50 concurrent users; Azure Speech free tier allows **1 concurrent** request | Fine for demo; queue requests or use student credit for the final eval |
| 7 | `public/audit-screenshots/` (9.5 MB) is test output from the old project; anything in `public/` is served to users | Resolved: moved to `archive/old-public/` (git-ignored), with the create-next-app SVGs |
| 9 | ER diagram lacks fields UC-10 and the UI need (lesson title/instructions, chapter art) | Added as columns; listed in `architecture.md` |
| 10 | Supabase renamed keys (secret `sb_secret_…`) and no longer auto-exposes new tables | Env is `SUPABASE_URL` + `SUPABASE_SECRET_KEY`; migration grants tables to `service_role` only |
| 8 | Reference design is a green, adult audio-tool dashboard | Keep its layout; use Pronnova's coral/orange brand and friendlier tone (design.md) |
