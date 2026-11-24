# ADR-003: Test tools

## Status
Accepted (2026-11-24, approved by the team in Phase 1).

## Decision
- **Vitest** for unit tests (`tests/unit/`, `npm test`): scoring rules, validation, queries' pure parts, speech engine adapters.
- **Playwright** for browser tests (`tests/e2e/`, `npm run test:e2e`) from Phase 2: route smoke tests, then user flows. Desktop Chrome + a phone profile. First run needs `npx playwright install chromium`.
- Both are dev-only dependencies.

## Consequences
`npm test` joins lint + build as a required check at the end of each phase.
`@types/node` moved to v24 to match Node 24 (Vitest 5 needs ≥ 22).
