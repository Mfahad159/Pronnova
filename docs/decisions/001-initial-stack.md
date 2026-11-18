# ADR-001: Initial Technology Stack

## Status
Partly superseded by ADR-002 (Next.js) and ADR-003 (no auth in FYP-1).

## Context
Pronnova needs a web application, persistent storage, speech assessment, and an external AI service for personalized suggestions (SRS 3.1). A three-person university team builds it incrementally over two semesters. SRS 3.3.8 requires separate frontend, backend, and Speech Engine modules.

## Decision
- Frontend: React (framework chosen in ADR-002: Next.js).
- Database and file storage: Supabase (PostgreSQL, Storage).
- Authentication: Supabase Auth is the planned choice, but it is not used in FYP-1 (see ADR-003).
- Speech Engine: separate Python service for speech recognition, alignment, and pronunciation scoring.
- Personalized suggestions: external AI service called through its API from server code (FYP-2).

## Consequences
- The Speech Engine is its own module with a fixed contract. The web app talks to it only from server code.
- Web app backend logic lives in Next.js Route Handlers (ADR-002).
- Specific speech models and libraries are chosen in later ADRs.
