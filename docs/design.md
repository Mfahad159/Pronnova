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
- **Logo & favicon (2026-11-25):** sound-column mark in the brand gradient coral `#FF594B` → orange `#FF8D28` (`public/icons/pronnova-mark.svg`, favicons in `public/`), matching the UI. Recolour with `tools/` (see `tools/README.md`).
- **Landing page sections (2026-11-25):** layout ideas taken from novakidenglish.com (benefit pillars, numbered steps with alternating images, product-style example, level cards, teacher block, FAQ, repeated single CTA, dark footer). Content, images and branding are Pronnova's. We deliberately left out pricing, testimonials, invented stats and award logos — we have none that are real.
- **Photo collage (2026-11-25):** after the hero — tilted, very rounded photo tiles in columns running off both edges, headline in the middle, a "No app to install" card (layout idea from the ClassDojo homepage; no ratings shown because we have none). Photos in `public/photos/`, all free licences, credited under the section:
  | File | Source | Photographer |
  |---|---|---|
  | `smiling-schoolboys-kp.jpg` | [Pexels 18627614](https://www.pexels.com/photo/18627614/) | Zeeshan Khan |
  | `boy-in-classroom-pakistan.jpg` | [Unsplash DreH1YbP1js](https://unsplash.com/photos/DreH1YbP1js) | Assad Tanoli |
  | `class-listening-to-teacher.jpg` | [Pexels 12714642](https://www.pexels.com/photo/12714642/) | Pexels contributor |
  | `girls-studying-hijab.jpg` | [Pexels 448877](https://www.pexels.com/photo/448877/) | Akela Photography |
  | `girls-reading-together.jpg` | [Pexels 14071968](https://www.pexels.com/photo/14071968/) | Fatima Yusuf |
  | `student-reading-library.jpg` | [Pexels 33992741](https://www.pexels.com/photo/33992741/) (Gujrat, Pakistan) | Elements Interactive |
  | `children-walking-to-school.jpg` | [Pexels 31692715](https://www.pexels.com/photo/31692715/) | clickbyabbas |
  | `schoolboy-uniform-pakistan.jpg` | [Unsplash mgP2OdoTHso](https://unsplash.com/photos/mgP2OdoTHso) | Assad Tanoli |
  Only use free-licence photos (Pexels License / Unsplash License — never Unsplash+). They show real children: use as atmosphere only, never imply they use Pronnova. Re-encode before adding (strips location data).
- **Font:** Google Sans Flex for everything (body and headings), variable weight, loaded with `next/font/google` in `app/layout.tsx` and wired to `--font-sans` / `--font-heading` in `app/globals.css`. To change the font, edit those two places only.
- **Flat UI — no shadows or depth (2026-11-25):** no `shadow-*`, no press-down/scale effects on buttons. Separate things with borders (`border`, `ring-1 ring-foreground/10`) and tinted backgrounds; show hover with colour (e.g. `hover:border-primary/40`, `hover:bg-muted`). Toast shadows are switched off in `app/globals.css`.
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
