# FYP-1 scope (draft)

What FYP-1 must deliver and how we know each use case is done. Confirm with the supervisor.

## In scope
| UC | Done when |
|---|---|
| UC-03 View Lesson | Student sees chapters in order → levels → items; locked levels and empty levels show a message; last position is remembered |
| UC-05 Record Speech | Record / stop / cancel / listen back; auto-stop at 15 s; clear messages for no mic and denied permission |
| UC-04 Attempt Exercise | Audio saved and attempt stored **before** scoring; failed scoring keeps the attempt and offers retry; word + phoneme results and error stats saved |
| UC-06 Feedback & Score | Score %, class (Excellent ≥85 / Good 70–84 / Average <70), wrong words and sounds, play correct word, retry and next buttons; shown within 10 s |
| UC-10 Upload Material | **Teacher library**: create / edit / duplicate materials (title, level Basic/Medium/Advanced, optional instructions). Items come from **three input methods** feeding one list: Write, Paste (split by sentence or line), Upload Word (.docx ≤ 5 MB). **Item limits**: 1–20 items; > 25 words blocks Save; level fit (1–3 / 4–10 / 11–20 words) and < 3 items are warnings only. **Lock rule**: once any student has attempted a material its items can't change (409); title/instructions stay editable; "Duplicate & edit" makes an unlocked copy |
| UC-08 Assign (assign only; reassign deferred) | Assign a material to classes and/or individual students with a due date (no past dates); class targets include students added later; the same material can be assigned many times; students see it on their dashboard. Reassign / unassign: FYP-2 |

## All SRS use cases — status (2026-11-28)
| UC | Name | Actor | Backend work it needs | Status now |
|---|---|---|---|---|
| UC-01 | Sign-Up | Student, Teacher | Accounts, hashed passwords, roles | ⛔ Not in FYP-1 (university policy, ADR-002) |
| UC-02 | Sign-In | Student, Teacher | Sessions, role-based access | ⛔ Not in FYP-1 (ADR-002) |
| UC-03 | View Lesson | Student | Chapters/levels/items queries, unlock rule, homework, Continue | ✅ Done (Phase 2) |
| UC-04 | Attempt Pronunciation Exercise | Student, Speech Engine | Upload audio, save attempt, score, save results + error stats atomically, retry | ✅ Done with mock scorer (Phase 3); real scorer deferred |
| UC-05 | Record Speech | Student | Audio validation + private storage | ✅ Done (Phase 3) |
| UC-06 | View Feedback & Score | Student | Results API, signed playback URLs | ✅ Done with mock scorer (Phase 4): score + class, coloured words, tricky sounds, hear the word, play own recording, try again / next word |
| UC-07 | View Progress (+ AI suggestions) | Student, AI Engine | Progress over time, repeated errors from `error_stats`, Gemini or template suggestions | ⬜ Not started (tables + error counts already exist) |
| UC-08 | Assign / Reassign Lesson | Teacher | Create/move assignments | ✅ **Assign only** (2026-11-28): `POST /api/assignments` to classes and/or students, one transaction. Reassign/unassign/move: out of scope |
| UC-09 | Select Difficulty Level | Teacher | Update a lesson's level | 🟡 Level set on upload; changing later not |
| UC-10 | Upload Practice Material | Teacher | Validated atomic save, library, lock rule, duplicate, paste/Word import | ✅ Done (Phase 2, extended in Phases A/B) |
| UC-11 | Organize Lessons / Chapters | Teacher | Reorder / move lessons, create chapters | ⬜ Not started |
| UC-12 | Monitor Student Progress | Teacher | Class + per-student progress, save teacher evaluations | 🟡 Dashboard numbers + latest attempts; per-student view + evaluation not |
| UC-13 | View Reports | Teacher | Student/class report compilation | ⬜ Not started |

13 use cases; 30% ≈ 4. **FYP-1 set (team, updated 2026-11-28): UC-03, 04, 05, 06, 08 (assign only), 10 — 6 of 13 (46%).**

**Minimal support, not a use case:** the roster (Classes & Students, archive instead of delete) and the "Who are you?" student picker exist only because FYP-1 has no login (ADR-002). They are replaced by UC-01/02 in FYP-2.

## Out of scope for FYP-1
UC-01/02 (auth), UC-07 (progress + Gemini), UC-08 reassign/unassign, UC-09, UC-11/12/13, PDF/CSV import, multi-class students, teacher accounts, reports. Build the tables they need, not the screens.

**Added 2026-11-28 (team brief):** roster (classes + students, archive), teacher material library (Write / Paste / Word import, lock after attempts, duplicate), UC-08 assign only, "Who are you?" student picker, minimal student dashboard. Not built: reassign/unassign UI, PDF/CSV import, progress analytics, reports, teacher accounts.

## Plan
Phases 1–5 with tasks and exit checks: [fyp1-implementation-plan.md](fyp1-implementation-plan.md).
