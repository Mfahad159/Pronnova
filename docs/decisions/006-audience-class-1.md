# ADR-006: FYP-1 audience is Class 1

## Status
Accepted (2026-11-26, team decision). Replaces the "Class 6–10" audience used in earlier docs.

## Context
- The SRS scope (2.4) names Class 6–10, but its objectives (2.3) and 3.2.2 say lessons follow "the Pakistani curriculum starting from Class 1". The first doc draft (`Pronnova_mds`) also said Grade 1.
- The team's landing page (3b4bd89) is built for young learners: Piko the buddy, picture flashcards (Apple, Cat, Sun), playful buttons.
- The team chose to build and evaluate FYP-1 for **Class 1** learners first.

## Decision
- Pronnova FYP-1 targets **Class 1** students in Pakistan (about ages 5–7, first language Urdu or Punjabi) and their teachers.
- Content stays in Chapters → Basic / Medium / Advanced (SRS names), but at Class 1 difficulty:
  - Basic = single picture words (cat, sun, apple)
  - Medium = 2–3 word phrases (a red ball)
  - Advanced = short sentences (about 3–6 words)
- Every word should have a picture and a "listen first" option, because many Class 1 children are still learning to read.
- Copy is short and friendly, with large tap targets and encouraging feedback (Piko).
- The SRS document itself is not edited (it's the approved proposal). This ADR records the deviation; mention it at evaluation.

## Consequences
- The seed demo data now says Class 1 (grade tags, "Class 1 – Blue", join code `BLUE1A`). The seed's sentences are still Class 6-level; replacing them with Class 1 content is a Phase 4 task.
- Upload limits (`MATERIAL_LIMITS` in `lib/materials.ts`) still allow 15-word sentences; Phase 4 decides on Class 1 limits.
- Scoring rules (85/70 cut-offs, level unlock at 70%) are unchanged.
