# ADR-009: One teacher, one student in FYP-1 (no picker, no roster screens, no dummy data)

## Status
Accepted (2026-11-28, team request).

## Context
FYP-1 has no login (ADR-002). The app had a seeded roster (2 classes × 6 students), a "Who are you?" picker, a Classes & Students screen and sample materials, assignments and attempts. For the demo the team wants the real flow to be easy to follow: the teacher uploads and assigns, the student receives and practises, the teacher sees the result. They also don't want sample data.

## Decision
- **People:** exactly one teacher (**Umar**) and one student (**Ahmad**, in one class "Class 1"). Seed: `supabase/seed.sql`; ids in `server/db/demo-user.ts`. `getCurrentStudentId()` always returns Ahmad.
- **No dummy data:** the seed has only the two people, the built-in chapters (free practice) and settings. No materials, assignments or attempts: the app fills up as people use it.
- **No picker:** `/student/who`, `features/student/*` and `POST /api/student/session` are removed; `/student/who` redirects to `/student`.
- **No roster screens:** Classes & Students is off the menu; `/teacher/classes` and `/teacher/students` redirect to `/teacher`. The roster code (`features/roster`, `/api/classes`, `/api/students`, migration 0004) stays for FYP-2.
- **UC-08 assign:** the Assign dialog sends the material to Ahmad with a due date (still `POST /api/assignments` with `studentIds`, so FYP-2 can bring back classes without an API change).
- **Student Home** shows only assigned work; with none, "No work assigned yet! Happy weekend! 🎉". Chapters stay in the sidebar as free practice.
- **Portals:** a student can't jump straight into the teacher portal (or the other way round). Switching always goes through role selection (`/onboarding`).
- **No dead ends:** detail pages have a Back button in the top bar; practice of assigned work goes back to Home; the last word offers "All done".

## Consequences
- The flow UC-10 → UC-08 → UC-03/04/05/06 → UC-12 (overview) is checked end to end by `tests/e2e/phase-b.spec.ts` (`E2E_MUTATE=1`).
- Fixed on the way: attempts on teacher materials (which have no chapter) were dropped from every attempts list (`chapters!inner` join).
- FYP-2 (auth) replaces the demo-user functions with the signed-in user and brings the roster screens back.
