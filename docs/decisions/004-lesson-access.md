# ADR-004: Who can open which lesson (unlock rule + visibility)

## Status
Accepted as the plan's default (2026-11-24, Phase 2). The team can change the numbers below.

## Context
- SRS 3.2.2: lessons are sequential Chapters with Basic, Medium, Advanced Levels; UC-03 says the student "selects an unlocked Level" and gets "Level is locked" as an exception — but the SRS never says *when* a level unlocks.
- SRS 3.2.2 also says a Lesson is shown "only when it is assigned", while UC-03 lets students self-select practice. These conflict.

## Decision
1. **Unlock rule:** in each chapter, Basic is always open. Medium opens when **every** Basic item has a best score of **≥ 70%** ("Good" or better, SRS 3.2.5). Advanced opens the same way after Medium. An empty level counts as done. Chapters themselves are all open.
2. **Visibility:**
   - Built-in curriculum (`lessons.visibility = 'public'`) is open to every student, subject to the unlock rule.
   - Teacher-uploaded material (`visibility = 'assigned'`) is visible **only** to students it is assigned to (directly or through their class). Others get "not found".
   - Assigned work is **always open**, even inside a locked level — the teacher chose to give it.
3. The rule lives in one place, `lib/progress.ts` (unit-tested), and is enforced on the server in both the practice page and `POST /api/attempts`.

## Consequences
- A student's "stage" is derived from their attempts — no extra progress table.
- Changing the pass mark = change `PASS_SCORE` in `lib/progress.ts` (currently = `GOOD_MIN`, 70).
- Seeded sample attempts on items in now-locked levels stay in history; they just don't unlock anything.
