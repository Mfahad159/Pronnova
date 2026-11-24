# Design

Reference: [`design/reference-dashboard.png`](design/reference-dashboard.png) (an audio-tool dashboard). **Use it for layout, flow and feel only. Do not copy it.** Pronnova keeps its own brand, words and images.

## What we take from the reference
| Reference has | Pronnova version |
|---|---|
| Left sidebar: logo, workspace picker, grouped menu ("Main Menu", "Products", "Others") | Sidebar per role. **Student:** Home, Chapters, Practice, Progress. **Teacher:** Dashboard, Materials, Chapters, Students, Reports. Bottom: Help, Settings |
| Top bar: greeting "Good morning, name", search, primary button | "Good morning, Ayesha 👋 — 3 lessons due this week", search lessons, primary button **Start practice** (student) / **Upload material** (teacher) |
| Tabs: Explore / History / Favorites | Student: **Learn / History / Saved** |
| Row of colorful category tiles with 3D illustrations | **Chapter cards** using `public/objects/img1–4.jpg` on soft tinted backgrounds |
| Search + sort dropdown + action button above a table | Filter by level (Basic/Medium/Advanced), status, sort by score/date |
| Table rows: play button, title, tags, **waveform**, duration, count, actions | **Attempt history / exercise list**: play recording, text, chapter + level tags, waveform, **score pill** (green ≥85, amber 70–84, red <70), date, retry |

## What we change
- **Color:** Pronnova coral/orange (from `public/icons/logo.svg` and the old prototype tokens), not the reference's green.
  - Brand coral `#FF594B` (logo) · accent `#FF8D28` · canvas `#FFFBF7` · ink `#100E0E`
  - Buttons use a darker coral `#D63C2F` so white text passes WCAG AA contrast.
  - Score colors (text-safe on white): excellent `#157A3E`, good `#9A6412`, average `#D93025`.
  - All tokens live at the top of `app/globals.css` (`:root` + `.dark`). Use them as Tailwind classes (`bg-primary`, `text-score-good`, `bg-tint-peach`). Never hard-code colors in components.
- **Font:** Plus Jakarta Sans (friendly, very readable), set in `app/layout.tsx`.
- **Tone:** warmer and friendlier — users are Class 6–10 students. Larger tap targets (≥ 44 px), bigger practice text, short clear messages.
- **Practice page is not a table.** One big card: the sentence, a large round **Record** button, live waveform, then the result with each word colored by score.
- **Mobile:** sidebar becomes a bottom bar or drawer. Tables become stacked cards.

## Images (`public/`)
- `avatar/*` — the teacher character. Use as a friendly guide: empty states ("No attempts yet — try your first one!"), practice tips, teacher dashboard header.
- `objects/*` — kids illustrations. Chapter card art and landing page.
- `icons/logo.svg` — brand mark.
Use `next/image` with proper sizes; the JPGs are 2400 px wide.

## Quality bar
- After screens exist, run an **unslop** audit (see `agent-skills.md`) to remove generic "AI-looking" patterns.
- Check contrast (WCAG AA) on tinted cards and score pills.
- Every async action shows loading, success and error states (SRS 3.3.9: clear error messages).
