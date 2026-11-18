# ADR-003: FYP-1 Scope and No Authentication

## Status
Accepted for FYP-1. Revisit at the start of FYP-2.

## Context
University policy does not allow login/sign-up in FYP-1. The SRS has Sign-Up (UC-01), Sign-In (UC-02), and role-based access (SRS 3.2.1). FYP-1 also covers only about 30-40% of the use cases.

## Decision
- Implement UC-03, UC-04, UC-05, UC-06, UC-10 (5 of 13). Details: `specs/fyp1-implementation-plan.md`.
- Do not implement UC-01, UC-02, or any authentication: no passwords, sessions, Supabase Auth, or auth libraries.
- Student and Teacher areas are separate routes (`/student/*`, `/teacher/*`). Both use seeded demo identities.
- All database access goes through server code with the service key. RLS stays on with no anon policies.
- Agents must not add auth code or apply Supabase Auth guidance from skills in FYP-1.

## Consequences
- SRS requirements that depend on auth (3.2.1, password hashing in 3.3.2, per-user privacy in 3.3.4) are not met in FYP-1.
- Use only fake or team-made data and recordings until auth is added.
- FYP-2 adds auth and role-based access. Demo identities are then replaced by real accounts.
