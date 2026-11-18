<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pronnova — AI Agent Guidelines

Pronnova is an AI-assisted pronunciation assessment system for Pakistani Grade 1 students.

## Documentation Entry Point
All architectural details, project context, and specifications live in `docs/`:
- **Start here:** [`docs/index.md`](docs/index.md) (documentation hub & navigation)
- Context & Goals: [`docs/project-context.md`](docs/project-context.md)
- System Architecture: [`docs/architecture.md`](docs/architecture.md)
- Approved Skills: [`docs/agent-skills.md`](docs/agent-skills.md)
- Feature Specs: [`docs/specs/README.md`](docs/specs/README.md)
- Architecture Decisions: [`docs/decisions/`](docs/decisions/)

## Core Rules
1. **Spec-first:** Always read relevant specs in `docs/specs/` before implementing.
2. **Framework conventions:** Follow Next.js App Router conventions and React 19 rules.
3. **Scope control:** Propose changes before editing; implement only approved scope.
4. **No unauthorized dependencies:** Do not install libraries without prior approval.
5. **Security:** Never commit credentials or expose secrets.
