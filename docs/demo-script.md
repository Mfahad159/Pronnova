# FYP-1 demo script (≈12 minutes)

What to click, in order, and what to say. Start from a fresh seed (nothing assigned). Practise once the day before.

## Before the demo (10 min)
1. Reset the data: one teacher (Umar), one student (Ahmad), the built-in chapters, nothing assigned.
   ```powershell
   npm run db:seed
   ```
2. Use the production build: it's faster and steadier than `npm run dev`.
   ```powershell
   npm run build; npx next start -p 3000
   ```
3. Open `http://localhost:3000` in Chrome. One window is enough: you switch portals through role selection.
4. Plug in a headset mic and say a test word once on any practice page, so the browser's mic permission is already granted.
5. Have `docs/qa-report.md` ready for questions about testing.

The scorer is the **mock** until Azure keys are added. Say so if asked: "Scores come from a stand-in engine with the same contract as Azure (ADR-005); the real engine plugs in without changing the app."

## 1. Landing (1 min)
- Load the site: dotted orb → it forms the Pronnova logo → the page appears.
- Scroll quickly: hero (the word rolls), interactive demo (tap the dotted orb, say "Apple"), how it works, FAQ.
- Say: "Pronnova helps Class 1 children in Pakistan practise English pronunciation. Teachers give work; children speak, and get word-by-word feedback."

## 2. Student first: nothing assigned yet (1 min)
- **Get started** → **I'm a student** → Ahmad's Home: "No work assigned yet! Happy weekend! 🎉".
- Say: "Chapters are always there for free practice; Home only shows the teacher's work."
- Sidebar menu → **Switch role** → back on role selection (portals never open each other directly).

## 3. Teacher: upload and assign (4 min)
- **I'm a teacher** → Umar's dashboard: "Nothing assigned yet. Upload a lesson, then assign it to Ahmad."
- **Materials → New material:**
  - Title "Demo words", level Basic;
  - **Write** tab: type `cat`, Enter, `dog`, Enter;
  - **Paste** tab: paste `1. I see a big red ball. 2. The sun is hot.` → **Split into items** → choose **Add to list**;
  - point out word counts, and the amber "Long for Basic: 1–3 words suggested" warning (warnings never block);
  - type a 26-word sentence → it turns red and **Save** is disabled → delete it → **Save material**.
- **Library:** the new card → **Assign** → "For: Ahmad" → pick a due date → **Assign** → toast, the card shows "assigned 1 time".

## 4. Student: receive, practise, feedback (4 min)
- **Switch role** → **I'm a student** → Home now shows **Continue** and **Your lessons** with "Demo words" (due date, progress).
- **Start practice** → practice screen (Back button top left goes Home):
  - **Listen** (browser voice);
  - tap the dotted orb → say "cat" → **Stop** → listen back → **Send**.
- Feedback: score %, class (Excellent/Good/Average), coloured words, tricky sounds; **Hear it again**, **Try again**, **Next word** (last word: **All done**).
- Home → **Recent attempts** → ▶ play your own recording (private link, expires in 5 min).

## 5. Teacher again: results and the lock rule (2 min)
- **Switch role** → **I'm a teacher**: Ahmad's progress (attempts this week, average score) and the attempt in **Latest attempts** (▶ the teacher can play it too).
- Materials → open **Demo words**: "Students have attempted this material, so items are locked." → **Duplicate & edit** → an editable copy.
- Say: "Scores always refer to the exact words the child read."

## 6. If they ask "what if something fails?" (1 min)
- Pull the network cable or turn Wi-Fi off → press **Send**: "No connection. Your recording is still here." → reconnect → Send works.
- Mention, without demoing: if the speech engine is down, the attempt is saved and "Try checking again" re-scores it; nothing is lost or counted twice (tested with a real broken engine, QA report §3).

## Likely questions → where the answer is
| Question | Answer / file |
|---|---|
| Why no login? | University policy for FYP-1 (ADR-002). One teacher and one student for now (ADR-009); FYP-2 adds UC-01/02 and the roster |
| Which use cases are done? | UC-03, 04, 05, 06, 08 (assign), 10 — 6 of 13 (`specs/fyp1-scope.md`) |
| How is the database designed / secured? | `docs/database.md` (viva Q&A); RLS on, server-only key, private recordings |
| How did you test it? | `docs/qa-report.md`: 106 unit, 16 DB, 110 browser tests + QA scripts |
| Why Basic/Medium/Advanced? | SRS names (decision #17) |
| Real speech scoring? | Azure Pronunciation Assessment + own Python engine, behind one frozen contract (ADR-005); keys pending |
