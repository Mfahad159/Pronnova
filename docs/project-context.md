# Project context

Source: `Pronnova_SRS_Updated_28_oct.docx` (Markdown copy: [srs.md](srs.md)). If this file and the SRS disagree, the SRS wins.

## What it is
A web app where students read English words, phrases and sentences into a microphone and get a score plus word- and sound-level feedback. Teachers upload lessons, assign them, and watch progress. It is a practice tool, not an exam.

## Users
- **Students** — **Class 1** (about ages 5–7), first language Urdu or Punjabi. Listen, practise, see feedback, track progress. (Team decision ADR-006; the SRS scope text says Class 6–10.)
- **Teachers** — upload/organize lessons, assign with deadlines, evaluate attempts, see class progress.
- **Speech Engine** and **AI Engine** — system actors (scoring; suggestions via Gemini API).

## Key rules from the SRS
- Content: Chapters → Levels (Basic, Medium, Advanced) → Lessons → items (word, phrase, sentence, paragraph). Sentences up to ~15 words.
- Score is a percentage. Classification: **Excellent ≥ 85**, **Good 70–84**, **Average < 70**.
- Error rate per word/sound = errors ÷ attempts × 100.
- British or American pronunciation both count as correct.
- Feedback within **10 s** of submit. Pages load in **< 3 s**. **50** concurrent users.
- If scoring fails, **keep the attempt** and let it be retried (3.3.7).
- A student's recordings and results are visible only to that student and their teacher (3.3.4).

Out of scope: free conversation, accent identification, intonation/stress, other languages, offline, native mobile apps.

Class 1 content: Basic = picture words, Medium = 2–3 word phrases, Advanced = short sentences (≈3–6 words). Every word gets a picture and a "listen first" option.

## Use cases
| ID | Name | Actor | FYP-1? |
|---|---|---|---|
| UC-01 | Sign-Up | Student, Teacher | No (see ADR-002) |
| UC-02 | Sign-In | Student, Teacher | No (see ADR-002) |
| UC-03 | View Lesson | Student | **Yes** |
| UC-04 | Attempt Pronunciation Exercise | Student, Speech Engine | **Yes** |
| UC-05 | Record Speech | Student | **Yes** |
| UC-06 | View Feedback & Score | Student | **Yes** |
| UC-07 | View Progress (+ Gemini suggestions) | Student, AI Engine | FYP-2 |
| UC-08 | Assign / Reassign Lesson | Teacher | FYP-2 |
| UC-09 | Select Difficulty Level | Teacher | FYP-2 |
| UC-10 | Upload Practice Material | Teacher | **Yes** |
| UC-11 | Organize Lessons / Chapters | Teacher | FYP-2 |
| UC-12 | Monitor Student Progress | Teacher | FYP-2 |
| UC-13 | View Reports | Teacher | FYP-2 |

FYP-1 set (UC-03/04/05/06/10) is carried over from the old prototype's plan. Confirm with your supervisor.

## Diagrams
Full SRS in Markdown: [srs.md](srs.md). ER diagram: `srs/fig21-er-diagram.png`. Component diagram: `srs/fig19-component-diagram.png`.
