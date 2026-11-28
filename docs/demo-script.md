# FYP-1 demo script (≈12 minutes)

What to click, in order, and what to say. Use the seeded demo data. Practise once the day before.

## Before the demo (10 min)
1. Reset the data, so everything looks like this script:
   ```powershell
   npm run db:seed
   ```
2. Use the production build: it's faster and steadier than `npm run dev`.
   ```powershell
   npm run build; npx next start -p 3000
   ```
3. In Chrome open `http://localhost:3000` in **two windows**:
   - **Teacher:** a normal window.
   - **Student:** an incognito window, so it starts as a new device.
4. Plug in a headset mic and say a test word once on any practice page, so the browser's mic permission is already granted.
5. Have `docs/qa-report.md` ready for questions about testing.

The scorer is the **mock** until Azure keys are added. Say so if asked: "Scores come from a stand-in engine with the same contract as Azure (ADR-005); the real engine plugs in without changing the app."

## 1. Landing (1 min)
- Load the site: the Pronnova logo "bites" while the page loads.
- Scroll quickly: hero (the word swaps), interactive demo, how it works, FAQ.
- Say: "Pronnova helps Class 1 children in Pakistan practise English pronunciation. Teachers give work; children speak, and get word-by-word feedback."

## 2. Teacher: roster and material (4 min)
- Landing → **Choose Role** → **I'm a teacher**.
- **Classes & Students:**
  - two classes;
  - add a student (e.g. "Sara", roll no. 7) → toast;
  - archive one → confirm dialog → gone from the list; tick **Show archived** → Unarchive.
- **Materials → New material:**
  - Title "Demo words", level Basic;
  - **Write** tab: type `cat`, Enter, `dog`, Enter;
  - **Paste** tab: paste `1. I see a big red ball. 2. The sun is hot.` → **Split into items** → choose **Add to list**;
  - point out word counts, and the amber "Long for Basic: 1–3 words suggested" warning (warnings never block);
  - type a 26-word sentence → it turns red and **Save** is disabled → delete it → **Save material**.
- **Library:**
  - the new card → **Assign**;
  - tick **Class 1 – Blue**, search and tick one student from Class 1 – Green, pick a due date;
  - point at the live summary → **Assign** → the card shows "assigned 1 time".

## 3. Student: pick, practise, feedback (5 min)
Student window → `http://localhost:3000/student`.
- **"Who are you?"** → Class 1 – Blue → **Ayesha** → **Continue**.
- Dashboard:
  - greeting with class;
  - the **Continue** card;
  - **Your lessons**, including "Demo words" (due date, progress bar).
- Tap **Demo words** → practice screen:
  - **Listen** (browser voice);
  - **Record** → say "cat" → **Stop** → listen back → **Send**.
- Feedback:
  - score %, class (Excellent/Good/Average), coloured words, tricky sounds;
  - **Hear it again**, **Try again**, **Next word**.
- Back to the dashboard → **Recent attempts** → ▶ play your own recording (private link, expires in 5 min).
- Reload the page: still Ayesha (remembered on this device). User menu (bottom of the sidebar) → **Not you? Switch student**.

## 4. Teacher again: the lock rule (1 min)
- Teacher window → Materials → open **Demo words**:
  - banner "Students have attempted this material, so items are locked.";
  - the items are read-only.
- **Duplicate & edit** → an editable copy "Demo words (copy)".
- Say: "Scores always refer to the exact words the child read."

## 5. If they ask "what if something fails?" (1 min)
- Pull the network cable or turn Wi-Fi off → press **Send**: "No connection. Your recording is still here." → reconnect → Send works.
- Mention, without demoing: if the speech engine is down, the attempt is saved and "Try checking again" re-scores it; nothing is lost or counted twice (tested with a real broken engine, QA report §3).

## Likely questions → where the answer is
| Question | Answer / file |
|---|---|
| Why no login? | University policy for FYP-1 (ADR-002). Students are *picked*, not signed in; FYP-2 adds UC-01/02 |
| Which use cases are done? | UC-03, 04, 05, 06, 08 (assign), 10 — 6 of 13 (`specs/fyp1-scope.md`) |
| How is the database designed / secured? | `docs/database.md` (viva Q&A); RLS on, server-only key, private recordings |
| How did you test it? | `docs/qa-report.md`: 106 unit, 16 DB, 110 browser tests + QA scripts |
| Why Basic/Medium/Advanced? | SRS names (decision #17) |
| Real speech scoring? | Azure Pronunciation Assessment + own Python engine, behind one frozen contract (ADR-005); keys pending |
