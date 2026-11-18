# Project Context

## 1. Overview

Pronnova is an AI-powered English pronunciation assessment and learning web app for school students in Pakistan, with a teacher dashboard. Students read words, phrases, and sentences into a microphone and get a score and word-level feedback. Teachers upload material and monitor progress.

It is a practice and progress-tracking tool. It is not used for exams or certification.

## 2. Problem

Students can read and understand English but pronounce it incorrectly. Teachers lack time for individual feedback, students don't know which words or sounds they get wrong, and nobody keeps a record of repeated errors.

## 3. Users

- **Students:** Class 6 to Class 10, Urdu or Punjabi first language. Practice lessons, read feedback, track progress.
- **Teachers:** Upload and organize lessons, assign them, monitor individual and class progress.
- **Speech Engine / AI Engine:** system actors for assessment and suggestions.

## 4. Scope

- Read-aloud practice: words, short phrases, sentences up to about 15 words.
- Content in Chapters, each with Basic, Medium, and Advanced Levels, aligned with the English curriculum.
- Word-level feedback for every attempt. Sound-level feedback for a defined set of commonly confused sounds.
- British or American pronunciation both accepted.
- Repeated error analysis, personalized suggestions, teacher dashboard and reports.

Out of scope: open conversation, accent identification, intonation and stress, children below Class 6, languages other than English, offline use, native mobile apps, grading beyond pronunciation.

## 5. Current phase: FYP-1

5 of 13 use cases (UC-03, 04, 05, 06, 10), no authentication. See `specs/fyp1-implementation-plan.md` and `decisions/003-fyp1-scope-no-auth.md`.

## 6. Technology

- **Frontend and server logic:** Next.js (App Router, React 19, TypeScript, Tailwind CSS)
- **Database and storage:** Supabase (PostgreSQL, Storage). Auth is planned for FYP-2.
- **Speech Engine:** separate Python service
- **Suggestions:** external AI service (FYP-2)

Details: `architecture.md`.

## 7. Development approach

- Specification-first: build against `docs/specs/`.
- AI-assisted development with Antigravity, following `AGENTS.md`.
- Small, verifiable changes with human review.