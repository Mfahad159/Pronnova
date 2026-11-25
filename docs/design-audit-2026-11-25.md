# Design, UX and UX-writing audit — 2026-11-25

**What was checked:** every Pronnova page (13 routes) at desktop 1280 px and phone 390 px, compared with novakidenglish.com (home, speaking practice, a programme page, teachers page). Screenshots were taken locally for review only and are **not** stored in the repo (Novakid's pages and artwork are theirs).

**Rule for borrowing:** take *patterns* (layout, playful tone, icon style), never their files. Novakid's icons, mascots and illustrations are their brand assets — we draw our own in the same spirit.

## 1. What makes the reference feel "kiddy" (patterns to adopt)
| Pattern | In Novakid | Pronnova version |
|---|---|---|
| Doodle line icons | Hand-drawn outline icons, one brand colour, slightly uneven strokes | Our own doodle icon set in coral, rounded caps, small sparkle accents |
| Marker underline | Key word in headings underlined with a hand-drawn stroke | Coral marker stroke under one word per section title |
| Decorative doodles | Sparkles, stars, dashed curvy paths, crowns | Sparkles + dashed "sound path" + our sound-bars mark; sparing |
| Curved colour bands | Big wavy green stripe between sections | One soft coral/peach wave under the hero → first section |
| Sticker labels | Tilted badge ("2X FASTER PROGRESS") | Tilted sticker for one highlight per page (e.g. "Word-by-word feedback") |
| Tag chips | Small rounded tags under cards | Already used (benefit pills) — extend to level/item types |
| Big pill CTAs, action-first | "Try for free", "Get started for FREE" | "Get started", "Start reading", "Check my reading" |

## 2. Findings in Pronnova
Severity: 🔴 fix now · 🟠 should fix · 🟢 nice to have

### Design
| # | Where | Finding | Sev |
|---|---|---|---|
| D1 | App pages (student/teacher) | Look like a plain admin tool next to the illustrated landing page: white lists, small text, tiny generic icons. Students are 11–16 — needs warmth, not "corporate". | 🔴 |
| D2 | All | Icons are generic outline (Lucide) at 16 px in pale boxes — no personality. | 🔴 |
| D3 | Section titles | No accent; every section looks the same. | 🟠 |
| D4 | Practice page | The most important screen is a small card in a big empty area; no guide/character. | 🟠 |
| D5 | Chapter page (phone) | Long items squeeze into a narrow column next to two badges (paragraph item wraps word-per-line). | 🔴 |
| D6 | Placeholder pages | "On the way" cards with a small face crop — feel unfinished. | 🟠 |
| D7 | Teacher tip card | Large empty tinted panel around a small image. | 🟢 |
| D8 | Landing | No visual break between hero and first section. | 🟢 |

### UX
| # | Where | Finding | Sev |
|---|---|---|---|
| U1 | Student home, chapter page, teacher materials | Test data ("E2E 1795…", repeated "vowel / valley") floods Homework and lists. Our write-tests leave data behind. | 🔴 |
| U2 | Student home | Homework list pushes chapters and "Continue" below the fold; "Next up" is a small grey line. | 🟠 |
| U3 | Student home | "Saved" tab leads to a placeholder — a dead end. | 🟠 |
| U4 | Practice | After a score there's no clear "what next" for low scores (only Try again / Next). | 🟢 (Phase 4 adds tips) |
| U5 | Sidebar | "Switch role" is small at the bottom; fine for demo, label unclear. | 🟢 |

### UX writing
| # | Where | Now | Better |
|---|---|---|---|
| W1 | Placeholder pages | "Planned for FYP-2 (see specs/fyp1-implementation-plan.md)." — shows internal file names to users | "Coming soon! You'll see your scores over time and the words to practise." |
| W2 | Practice | "Send" | "Check my reading" |
| W3 | Practice | "Tap the microphone, read the text aloud, then tap stop." | "Tap the mic and read it out loud. Tap again when you're done." |
| W4 | Score | "64% · Average" alone can feel harsh for a child | Keep the SRS label, add a kind line: "Good try! Practise the red words and try again." |
| W5 | Student home | "Pick up where you stopped, or try a new chapter." | "Ready for today's practice?" + big "Continue: ‘bottle’" |
| W6 | Locked level | "This level is locked. Score 70% or more on every Basic exercise to unlock it." | "🔒 Get 70% or more on every Basic word to open Medium." |
| W7 | Mixed | "Practise/practice", "Upload material/Upload practice material" | One spelling (UK: *practise* = verb, *practice* = noun) and one label per action |
| W8 | Sidebar | "Student · demo" / "Switch role" | "Demo student" / "Switch to teacher" |

## 3. Fixes (all done 2026-11-25)
1. **Clean data (U1):** reset demo data; make write-tests delete what they create.
2. **Own doodle icon set (D2):** ~16 SVG icons drawn for Pronnova (mic, book, star, chart, teacher, upload, calendar, ear, globe, lock, trophy, sparkle, home, chapters, progress, students) in coral line style; used in sidebar, landing pills, empty states. No new dependency.
3. **Playful details (D3, D8):** marker underline component, sparkle/dashed-path doodles, one wave divider, one sticker label.
4. **Student app warmth (D1, D4, D5, U2):** bigger "Continue" card with illustration, homework collapsed to the 3 soonest, chapter rows that stack on phones, practice page with the guide character and larger text.
5. **Rewrite copy (W1–W8, D6):** friendly placeholders with illustrations, action-first button labels, encouraging score line.
6. Re-screenshot every page (desktop + phone), run all tests, update `design.md`.

## 4. Result
All six steps done. Kept on purpose: SRS rating words (Excellent/Good/Average) — softened with an encouraging line instead of renamed. Left for later: homework badges on phones still sit beside the title (works, but tight); score playback and per-sound tips arrive with Phase 4.
