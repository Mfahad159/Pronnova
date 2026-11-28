# ADR-008: Animate UI (Motion) for UI motion; lucide for arrows

## Status
Accepted (2026-11-26, team request: "apply the Animate UI effects…", "use lucide icons instead of text arrows").

## Context
The team wanted the app to feel alive in a consistent way: navbar, sidebar, tabs, accordion, select, progress, tooltip, toast, avatar group, page transitions, swapping hero text, auto height and highlight effects, all from [Animate UI](https://animate-ui.com/).

## Decision
- **Packages added:** `@animate-ui/react` and `motion` (its engine), `@floating-ui/react` (needed by Animate UI's avatar-group tooltip), `lucide-react` (icons used by Animate UI components and for arrows).
- **How:** `npx @animate-ui/cli animate all` swapped the Radix imports in our shadcn files (`components/ui/accordion, dialog, dropdown-menu, progress, select, sheet, tabs, tooltip`) for `@animate-ui/react/primitives/radix-ui`. Markup, classes and accessibility stay ours; only the motion changes. The sidebar animates through its sheet and tooltips.
- **Page transition:** `components/animate-ui/components/page-transition.tsx` (from the Animate UI registry, read before committing), `slide` effect around the page content in `AppShell`. Built on view transitions (React 19.3 `<ViewTransition>`), no Next config needed. It reads the pathname, so it sits in `<Suspense>` (Cache Components).
- **Effects:** `Highlight` (navbar hover pill, sidebar pill), `SwappingText` (hero word), `AutoHeight` (practice recorder), `AvatarGroup` (teacher dashboard).
- **Toast:** Animate UI's toast exists only for Base UI; we use Radix, so `sonner` stays (it already animates) with brand styling.
- **Icons:** Phosphor stays the main icon set. `lucide-react` is used for arrows (instead of text "→") and wherever an Animate UI component ships with lucide (e.g. the accordion chevron).
- **Loader:** (updated 2026-11-28, team request) the first-load loader is the thinking-orbs "working" orb on a sharp canvas that merges into a dotted Pronnova mark, then fades. Before JavaScript runs, a static dotted mark (SVG) shows, so the screen is never empty.

## Consequences
- Reduced motion is respected by Animate UI automatically (`reducedMotion: 'user'`).
- Two icon libraries are installed; keep new icons on Phosphor unless it is an arrow or part of an Animate UI component.
- Rerunning `npx @animate-ui/cli animate <name>` after adding a new shadcn component animates it too.

## Update 2026-11-28: transitions and mic orbs
- **Page transitions:** in-area changes use the `content` effect (gentle centre zoom, the top bar keeps its place); `RoleTransition` zooms a whole area in from the centre (60% → 100% + blur) on a role switch.
- **Mic states:** `thinking-orbs@0.3.2` (MIT, no dependencies, canvas, team request with the install command) draws the mic as one large dotted orb (`MicStage`, the orb is the tap target; state text + time below, no mic button or pills) in `features/voice/mic-status.tsx`: `breathing` = ready, `connecting` = asking permission, `listening` = recording, `working` = checking, `shaping` = done. Pinned to the light theme with dark ink in every state (no coral tint, team request), and the orb keeps the same place in every state (fixed-height text and button slots); reduced motion gets a still frame (built in).
- **Cursor:** the whole app uses a coral arrow cursor (Animate UI `Cursor`, `global`, `components/brand/app-cursor.tsx` in the root layout). In the mic section a `CursorFollow` tag also shows the mic state (`features/voice/mic-cursor.tsx`). Mouse/pen only (touch keeps the normal behaviour); decorative.
- **Sharp large orb:** `ThinkingOrb` only draws its tuned 64/32/20px canvases; scaling one up with CSS blurred the dots. `features/voice/sharp-orb.tsx` draws the 64px design at the real size × devicePixelRatio using the exported engine (`thinking-orbs/engine`: `resolvePreset`, `MODE_FRAMES`, `paintFrame`).
