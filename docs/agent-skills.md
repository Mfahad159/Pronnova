# Agent skills and UI sources

## Rules
- Install only skills for the current phase. Read each `SKILL.md` and any script before using it.
- Skills install into `.agents/skills/` (Antigravity) or `.claude/skills/` (Claude Code). Note the location in the Status table.
- Don't install overlapping skills without a reason. Update the Status table after each install.

## Agent skills
| Skill | Use for | Install | When |
|---|---|---|---|
| vercel-react-best-practices | React performance, data fetching, re-renders, bundle size | `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices` | At scaffold |
| vercel-composition-patterns | Reusable component APIs (compound components, no boolean-prop soup) | `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns` | At scaffold |
| next-best-practices | App Router, server/client boundaries, route handlers | `npx skills add vercel-labs/openreview --skill next-best-practices` | At scaffold (if Next.js confirmed) |
| shadcn | Adding/customizing shadcn/ui components | `npx skills add https://github.com/shadcn-ui/ui --skill shadcn` | At scaffold |
| supabase | DB, storage, RLS, migrations (skip its auth parts in FYP-1) | `npx skills add https://github.com/supabase/agent-skills --skill supabase` | DB phase |
| supabase-postgres-best-practices | Schema, indexes, RLS policies | `npx skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices` | Before writing migrations |
| unslop | Audit + polish screens that look generic or AI-made | `npx skills add https://github.com/heydamir/unslop --skill unslop` | Once real screens exist |

**unslop notes:** built for Claude Code/Codex; for Antigravity copy `skills/unslop` into the skills folder manually. Review its proposed changes before applying. Don't connect paid image-generation or snapshot services. Run only when layout is stable. License CC BY 4.0.

Not now: `deploy-to-vercel` (until hosting confirmed), `ai-sdk` (only if we adopt Vercel AI SDK), `turborepo` (not a monorepo).

## UI component sources
Copy-paste sources. Code we copy becomes ours — check it fits our tokens and doesn't pull in big new packages (ask first if it does).

| Need | Source | Notes |
|---|---|---|
| Ready UI blocks (sidebar, tables, dialogs, forms) | [shadcn/ui](https://ui.shadcn.com) | Default choice. Sidebar + data-table blocks match the reference layout |
| More React components / blocks | [21st.dev](https://21st.dev) | Community shadcn-style components. Check quality and deps before copying |
| Animations (record button glow, score reveal) | [Aceternity UI](https://ui.aceternity.com) / [Magic UI](https://magicui.design) | Use sparingly; most need `motion` (framer-motion) — approve first. Respect `prefers-reduced-motion` |
| Charts / analytics (teacher dashboard, progress) | [Tremor](https://tremor.so) | Dashboard charts and KPI cards. Built on Recharts — approve that dependency first |

## Status
| Skill | Installed | Date | Where | Notes |
|---|---|---|---|---|
| vercel-react-best-practices | Yes | 2026-11-24 | `.agents/skills/` | Copied from old prototype (already reviewed); pinned in `skills-lock.json` |
| vercel-composition-patterns | Yes | 2026-11-24 | `.agents/skills/` | Same |
| next-best-practices | Yes | 2026-11-24 | `.agents/skills/` | Same |
| shadcn | Yes | 2026-11-24 | `.agents/skills/` | Same. shadcn/ui adopted (radix-nova style) |
| unslop | Yes | 2026-11-24 | `.agents/skills/` | Same. Run once real screens exist |
| supabase | Yes | 2026-11-24 | `.agents/skills/` | Official (supabase/agent-skills). Reviewed: docs only, no scripts. Skip its Auth guidance in FYP-1 |
| supabase-postgres-best-practices | Yes | 2026-11-24 | `.agents/skills/` | Official. Reviewed: reference docs only |
