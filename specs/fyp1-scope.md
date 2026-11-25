# FYP-1 scope (draft)

What FYP-1 must deliver and how we know each use case is done. Confirm with the supervisor.

## In scope
| UC | Done when |
|---|---|
| UC-03 View Lesson | Student sees chapters in order → levels → items; locked levels and empty levels show a message; last position is remembered |
| UC-05 Record Speech | Record / stop / cancel / listen back; auto-stop at 15 s; clear messages for no mic and denied permission |
| UC-04 Attempt Exercise | Audio saved and attempt stored **before** scoring; failed scoring keeps the attempt and offers retry; word + phoneme results and error stats saved |
| UC-06 Feedback & Score | Score %, class (Excellent ≥85 / Good 70–84 / Average <70), wrong words and sounds, play correct word, retry and next buttons; shown within 10 s |
| UC-10 Upload Material | Teacher adds title, instructions, due date, items, level, optional class; required-field errors shown; students see it |

## All SRS use cases — status (2026-11-26)
| UC | Name | Actor | Backend work it needs | Status now |
|---|---|---|---|---|
| UC-01 | Sign-Up | Student, Teacher | Accounts, hashed passwords, roles | ⛔ Not in FYP-1 (university policy, ADR-002) |
| UC-02 | Sign-In | Student, Teacher | Sessions, role-based access | ⛔ Not in FYP-1 (ADR-002) |
| UC-03 | View Lesson | Student | Chapters/levels/items queries, unlock rule, homework, Continue | ✅ Done (Phase 2) |
| UC-04 | Attempt Pronunciation Exercise | Student, Speech Engine | Upload audio, save attempt, score, save results + error stats atomically, retry | ✅ Done with mock scorer (Phase 3); real scorer deferred |
| UC-05 | Record Speech | Student | Audio validation + private storage | ✅ Done (Phase 3) |
| UC-06 | View Feedback & Score | Student | Results API, signed playback URLs | 🟡 Partly (score + coloured words); playback + tips in Phase 4 C |
| UC-07 | View Progress (+ AI suggestions) | Student, AI Engine | Progress over time, repeated errors from `error_stats`, Gemini or template suggestions | ⬜ Not started (tables + error counts already exist) |
| UC-08 | Assign / Reassign Lesson | Teacher | Create/move assignments | 🟡 Assign-on-upload exists (UC-10); reassign not |
| UC-09 | Select Difficulty Level | Teacher | Update a lesson's level | 🟡 Level set on upload; changing later not |
| UC-10 | Upload Practice Material | Teacher | Validated atomic save (lesson + items + assignment) | ✅ Done (Phase 2) |
| UC-11 | Organize Lessons / Chapters | Teacher | Reorder / move lessons, create chapters | ⬜ Not started |
| UC-12 | Monitor Student Progress | Teacher | Class + per-student progress, save teacher evaluations | 🟡 Dashboard numbers + latest attempts; per-student view + evaluation not |
| UC-13 | View Reports | Teacher | Student/class report compilation | ⬜ Not started |

13 use cases; 30% ≈ 4. The FYP-1 set below is 5 of 13 (38%).

## Out of scope for FYP-1
UC-01/02 (auth), UC-07 (progress + Gemini), UC-08/09, UC-11/12/13. Build the tables they need, not the screens.

## Plan
Phases 1–5 with tasks and exit checks: [fyp1-implementation-plan.md](fyp1-implementation-plan.md).
