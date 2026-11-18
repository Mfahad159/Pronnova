# Pronnova

AI-assisted pronunciation assessment and adaptive learning system for Pakistani Grade 1 students.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI / Audio:** Speech assessment pipeline (specification in progress)

## Documentation

Comprehensive project documentation is organized in [`docs/`](docs/):

- [Documentation Hub](docs/index.md) — Index of all documentation
- [Project Context](docs/project-context.md) — Problem statement, target users, and scope
- [Architecture](docs/architecture.md) — System components, technical structure, and rules
- [Agent Skills Registry](docs/agent-skills.md) — Approved and scheduled agent skills
- [Feature Specifications](docs/specs/README.md) — Functional specifications and acceptance criteria
- [Architecture Decisions](docs/decisions/) — ADRs and technical decision logs

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development Workflow

- Before making changes, consult [`AGENTS.md`](AGENTS.md) and [`docs/index.md`](docs/index.md).
- Follow a specification-first workflow: review relevant specs in `docs/specs/` before writing code.
- Keep components focused and adhere to Next.js App Router conventions.
