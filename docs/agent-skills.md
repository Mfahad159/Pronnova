# Pronnova: Agent Skills Registry

## Stack (confirmed)
- Frontend: Next.js (App Router), React 19, Tailwind CSS
- DB + auth: Supabase
- Built with Antigravity

## Rules
- Install only skills for the current phase and approved stack.
- Read each SKILL.md before use. Review any shell commands or scripts first.
- Don't install overlapping skills without a clear reason.
- Update the Status table after every install.

## Install now
| Skill | Use for | Install |
|---|---|---|
| vercel-react-best-practices | React performance, data fetching, re-renders, bundle size | `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices` |
| supabase | Auth, DB, storage, RLS, migrations | `npx skills add https://github.com/supabase/agent-skills --skill supabase` |

## Install when the phase starts
| Skill | Trigger | Install |
|---|---|---|
| next-best-practices | Next.js App Router patterns, server/client boundaries, performance | `npx skills add vercel-labs/openreview --skill next-best-practices` |
| vercel-composition-patterns | Setting up shared components, forms, dashboards | `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns` |
| supabase-postgres-best-practices | Before writing schema, indexes, or RLS policies | `npx skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices` |
| react-state-management | Once Zustand conventions are final (store boundaries, no copying server data) | `npx skills add https://github.com/wshobson/agents --skill react-state-management` |
| webapp-testing | Only if the test stack is Python Playwright. Review first. | `npx skills add https://github.com/anthropics/skills --skill webapp-testing` |
| unslop | Once real screens exist and look generic or AI-made. Audit + polish passes. | `npx skills add https://github.com/heydamir/unslop --skill unslop` |

### unslop notes
- Built for Claude Code/Codex. If command fails, copy `skills/unslop` into Antigravity's skills folder.
- Review proposed changes before approving. Do NOT connect paid image-generation services or snapshot features.
- Wait until layout is stable before running audits. CC BY 4.0 license.

## Install only if adopted
- **shadcn**: only after shadcn/ui is confirmed. Review shell directives before use.
  `npx skills add https://github.com/shadcn-ui/ui --skill shadcn`

## Do NOT install
- `next-cache-components`: Next.js dynamic caching only if explicitly required later
- `deploy-to-vercel`: only if Vercel deployment is chosen
- `turborepo`: only if the project becomes a monorepo
- `ai-sdk`: only if we pick the Vercel AI SDK for a real feature

## Status
| Skill | Installed | Date | Notes |
|---|---|---|---|
| vercel-react-best-practices | Yes | 2026-11-18 | Installed in `.agents/skills/` (reviewed, no scripts) |
| supabase | No | — | Wait for Milestone 5 (DB/Storage phase; no Auth in FYP-1) |
| next-best-practices | Yes | 2026-11-18 | Installed in `.agents/skills/` from `vercel-labs/openreview` (reviewed) |
| vercel-composition-patterns | Yes | 2026-11-18 | Installed in `.agents/skills/` (reviewed, no scripts) |
| supabase-postgres-best-practices | No | — | Schema phase (Milestone 5) |
| react-state-management | No | — | Waiting on Zustand conventions |
| webapp-testing | No | — | Test stack undecided |
| unslop | No | — | Wait for stable UI screens |
| shadcn | Yes | 2026-11-18 | Installed in `.agents/skills/` after adopting shadcn/ui |

