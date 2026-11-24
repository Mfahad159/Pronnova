# ADR-002: No authentication in FYP-1

## Status
**Accepted** (2026-11-24, confirmed by the team). Carried over from the old prototype's ADR-003. Revisit at the start of FYP-2.

## Context
The old prototype recorded that university policy does not allow login/sign-up in FYP-1. The SRS has UC-01 Sign-Up, UC-02 Sign-In and role-based access (3.2.1).

## Decision
- FYP-1 builds UC-03, 04, 05, 06, 10. No login, passwords, sessions or auth libraries.
- `/student/*` and `/teacher/*` use seeded demo identities, chosen on the landing page.
- All DB access goes through server code. RLS on, no anonymous policies.
- Use only fake or team-made data and recordings until auth exists.

## Consequences
SRS 3.2.1, password hashing (3.3.2) and per-user privacy (3.3.4) are not met until FYP-2 adds Supabase Auth.
