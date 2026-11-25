# ADR-007: The landing page is the design base for every screen

## Status
Accepted (2026-11-26, team decision).

## Context
The landing page (3b4bd89) now has a clear Class 1 look. The student and teacher areas were built earlier in a plainer style. The team wants one consistent UI/UX across the whole app.

## Decision
New and changed screens follow the landing page's UI/UX. Concretely, reuse its building blocks instead of inventing new ones:

| Need | Use (from the landing page) |
|---|---|
| Main action buttons | `KiddyButton` (coral face + solid darker lip, press-down on hover/press) |
| Guidance, empty states, encouragement | Piko the learning buddy (`public/hero/piko-portrait.png`, `learning-buddy.tsx` style messages) |
| Word pictures | Flat 2D illustrations from `illustrations.tsx` (dark outline, coral/orange/sky/cream palette) — not photos |
| Practice screen | The interactive demo's layout: flashcard card on the left, microphone card on the right, steps Listen → Speak → Assess → Improve |
| Cards and sections | Big rounded cards, soft tints (`tint-peach`, `tint-sky`, `tint-mint`, `tint-cream`, `tint-lavender`, `tint-rose`), small coloured label chips |
| Listening | `lib/speech-tts.ts` (`speakReference`) for "hear the word" |
| Colours, font | Tokens in `app/globals.css`; Google Sans Flex |

Rules:
- **Depth:** the flat-UI rule still holds (no soft drop shadows), with one exception: the kiddy button's solid 0-blur lip and its press-down. Nothing else gets a lip or shadow.
- **Words:** short, friendly, Class 1 level (ADR-006). Feedback is encouraging, never scolding.
- **Honesty:** sample or simulated results must say so on screen.
- Shared pieces move from `components/landing/` to `components/brand/` when the app starts using them (Phase 4), so app pages don't import "landing" code.

## Consequences
- Phase 4 restyles the student area first (home, chapters, chapter, practice + result), then teacher pages.
- `docs/design.md` describes the look; this ADR is the rule to point to when a choice is unclear.
