# Phase 5 QA report (FYP-1)

**Date:** 2026-11-28 · **Build:** `main` after Phase B (e27e771) + Phase 5 fixes · **Scorer:** mock (Azure keys not set yet; see "Still open")

Every check below is repeatable. Commands are in [How to re-run](#how-to-re-run).

## Summary

| # | Check | Result |
|---|---|---|
| 1 | Use-case walkthroughs (UC-03, 04, 05, 06, 08 assign, 10) | ✅ Pass: all normal, alternate and exception flows covered by browser tests |
| 2 | Routing | ✅ Pass. One dead control removed (top-bar search) |
| 3 | Interaction errors | ✅ Pass, with real engine-down and Supabase-down servers. 1 bug fixed |
| 4 | Design consistency | ✅ Pass. Level colours are tokens now. Unslop audit: light, mostly deliberate (see below) |
| 5 | Responsive | ✅ Pass at 360 / 768 / 1280 / 1440 px. 2 layout fixes |
| 6 | Accessibility | ✅ Pass, with 1 accepted exception (KiddyButton brand coral, team decision 2026-11-28) and 1 decision open (field borders) |
| 7 | Browsers / devices | 🟡 Chrome + Edge automated and passing. Firefox blocked on this PC. Safari, iPhone and Android: **manual checklist below** |
| 8 | Performance | ✅ Pass: pages < 3 s, feedback ≤ 10 s, 50 users at once OK. 1 improvement made |
| 9 | Data integrity | ✅ Pass (8/8 checks on 196 real attempts, incl. 50 submitted at once) |
| 10 | Security | ✅ Pass (17/17). One accepted risk (no login, ADR-002) |
| 11 | Docs | ✅ Index, team guide, decisions, plan updated; demo script: [demo-script.md](demo-script.md) |

**Bugs:** 9 found and fixed (below). **No open critical or high bugs.** Open items are decisions or need hardware/keys, listed with reasons under "Still open".

**Test totals (final run):** 106 unit · 16 database · 110 browser (+10 skipped by design: data-writing and keyboard walkthroughs run once, on desktop) · 26 core flows in Edge · plus the 5 QA scripts.

---

## Bugs found and fixed

| # | Severity | Bug | Fix |
|---|---|---|---|
| 1 | High | With the database unreachable, **every student page** showed Next's bare "This page couldn't load" and a React error (#441). The new profile menu sits in the layout, above the page's error screen, and threw. | The menu renders nothing on a DB error (the page's friendly error screen explains). Added `app/global-error.tsx` as a last-resort branded screen. Re-tested with a real "Supabase down" server. |
| 2 | Medium | "Try again" on the error screens used `reset()`, which only re-renders, so after a DB blip it failed again. | Uses `retry()` (re-fetches; new in Next 16.2), falling back to `reset()` / reload. |
| 3 | Medium | The fix for #1 first swallowed Next's "request-time data" signal during prerendering, which would bake the menu in as empty (seen in the build log). | Only database errors are caught now. |
| 4 | Medium | Contrast below WCAG AA: coral text on peach chips (4.08), "Good" (4.40) and "Average" (4.10) text on their tints, the due-soon pill (4.39), focus ring (2.2 at 50% opacity). | `--primary` #d63c2f → #c4362a, `--score-good` → #8f5d10, `--score-average`/`--destructive` → #c8281e, `--ring` → #d35f00, drawn solid. All now ≥ 4.5 (text) / ≥ 3 (ring). |
| 5 | Medium | 50 students opening the dashboard at once: ~5 s for its data. | The curriculum (same for everyone) is cached (`"use cache"`, refreshed after any material save and every minute). Three attempt queries merged into one. |
| 6 | Low | Top bar had a "Search lessons…" box that did nothing, on every page. | Removed. |
| 7 | Low | At 360 px the top-bar title shrank to "Hello, Ms...." next to the action button. At 768 px the add-student row squeezed the name field. | Title keeps a minimum width (button wraps below). Add-student uses two rows until wide screens. |
| 8 | Low | Level colours were hard-coded hex values in 4 places. | `--level-medium` / `--level-advanced` tokens. |
| 9 | Test only | Flaky browser tests: (a) "too short" recording depended on click speed; (b) React streaming briefly keeps a hidden copy of a page section, which strict locators counted twice; (c) dev-server compile timeouts. | (a) Stop is pressed from inside the page. (b) Shared fixture `tests/e2e/fixtures.ts` waits for the page to finish arriving. (c) 60 s timeout + 1 retry on the dev server only; the production-build run (`E2E_BASE_URL`) has no retries and passed twice in a row. |

---

## 1. Use-case walkthroughs ✅
Files: `tests/e2e/qa-use-cases.spec.ts`, `phase2.spec.ts`, `phase3.spec.ts`, `phase-b.spec.ts`. Flow names come from the SRS tables (docs/srs.md §4.3).

| UC | Flow | Result |
|---|---|---|
| UC-03 | Normal: chapters → levels → items | ✅ |
| UC-03 | 1A Continue · 1B homework / assigned lessons | ✅ |
| UC-03 | Exceptions: level locked (no links, URL blocked) · no exercises ("No words in this level yet") · network failure (friendly error screen) | ✅ |
| UC-04 | Normal: record → send → saved → scored → results stored | ✅ |
| UC-04 | 2A cancel stores nothing · 6A retry | ✅ |
| UC-04 | Exceptions: no microphone · speech engine failure (real server: attempt kept as `failed`, "Try checking again" re-uses it, nothing counted twice) · network failure (recording kept, send again works) | ✅ |
| UC-04 | Double-click Send → one request, one attempt | ✅ |
| UC-05 | Normal · 3A cancel discards audio · exceptions: mic not available, permission denied | ✅ |
| UC-06 | Score %, class, coloured words, tricky sounds, hear the word · 4A retry · 4B next word · exceptions: result not available (saved + retry), network failure | ✅ |
| UC-08 | Assign to classes and/or students · exception: nobody selected (Assign disabled) · network failure (message in dialog) | ✅ |
| UC-10 | Write / Paste / Word · required field empty · network failure on save · very long paste refused · 25-word block · level warnings | ✅ |

## 2. Routing ✅
`tests/e2e/qa-routing.spec.ts`, `routes.spec.ts`
- Every sidebar link (student + teacher) opens its page, is marked active (`aria-current`) and survives a refresh. ✅
- Back / forward. ✅
- 7 bad links (bad and unknown ids for chapters, practice items, materials, plus an unknown URL) show "We couldn't find that page" with `noindex`. ✅
  HTTP status is 200 on streamed pages: Next can't change the status after streaming starts and injects `noindex` instead (Next docs, streaming guide "Status codes"). This closes open conflict #12 as by design.
- No in-page link on the main screens leads to an error (11 links on desktop). ✅
- A returning device opening `/student/who` goes straight to the dashboard. ✅
- "Coming soon" screens (Student → Progress, Teacher → Chapters) are clearly labelled as FYP-2, not dead links.

## 3. Interaction errors ✅
Browser tests + `scripts/qa/failure-servers.mjs` (two extra production servers with a broken dependency each).

| Case | Result |
|---|---|
| Double-click Send | ✅ one request |
| Fast start/stop ("too short") | ✅ clear message, nothing sent |
| Leave mid-recording (browser Back) | ✅ nothing sent, no errors |
| Slow network (400 ms latency, 50 KB/s) | ✅ "Checking…" then the score |
| Offline while sending / saving / assigning | ✅ "No connection" message, nothing lost |
| Speech engine down (real) | ✅ 4/4 checks |
| Supabase down (real) | ✅ 5/5 checks (after fixing bug #1) |
| Very long text (≈50 k chars) | ✅ refused with a message |
| Empty form submits | ✅ field errors |
| Mic unplugged while recording | ⏳ manual (hardware), see checklist |

## 4. Design consistency ✅
- **Colours:** only tokens in app screens. The two remaining raw values were the level colours, now tokens. `#FF594B` in `app/layout.tsx` is the browser theme colour (metadata, can't be a CSS variable).
- **One button style per action:** KiddyButton = main action, Ink = strong secondary, Outline = secondary. App pages don't use plain shadcn buttons/cards (unit test `design-consistency`).
- **Every list has empty / loading / error states:** library, classes, students, lessons, chapters, attempts, assignments, picker (loading + error + empty). Every DB page has a skeleton (`<Suspense>`) and an error screen.
- **Unslop audit** (`.agents/skills/unslop`): **light, mostly deliberate.** No hue gradients in app screens, no glows, no fake data, no hype copy. What it flags, kept on purpose for a Class 1 audience (ADR-006/007), **not changed without the team**:
  - emoji in friendly copy: "Hi, Ayesha 👋", "All done! 🎉", "Super star! 🌟";
  - exclamation marks in children's messages;
  - uppercase label chips (`Eyebrow`);
  - 2–3 px press offsets on the KiddyButton (its signature);
  - one gradient on the landing demo's mic button (teammate's landing work);
  - bold (700) headings in kid-facing cards.

  If you want any of these toned down, it's a copy/style pass, ~1 hour.

## 5. Responsive ✅
`scripts/qa/ui-audit.mjs`: 15 screens × 360 / 768 / 1280 / 1440 px.
- No page scrolls sideways, and nothing is wider than the screen.
- Wide tables scroll inside their own box on phones.
- Mobile sidebar opens from the menu button.
- 2 layout fixes (bug #7).

## 6. Accessibility ✅ (2 decisions open)
- **Keyboard only:** record → stop → send → result, the material editor, and the student picker all work without a mouse; focus ring visible. (`tests/e2e/qa-a11y.spec.ts`)
- **Labels:** every button, link, input and select on the 15 screens has an accessible name (ui-audit).
- **Screen reader:** the score is announced through a polite live region ("Your score is N percent").
- **Reduced motion:** the page loader skips its animation. Animate UI follows the system setting.
- **Contrast** (`scripts/qa/contrast.mjs`): 16 of 19 pairs pass AA. The other 3:

| Pair | Ratio | Needs | Options |
|---|---|---|---|
| White text on the KiddyButton's bright coral (#ff594b), 2 sizes | 3.1:1 | 4.5:1 | **Decided 2026-11-28: keep the brand coral** (accepted exception). Mitigation: KiddyButtons always have a clear text label and icon, are large (40–54 px tall) with bold heading type, and the focus ring passes AA |
| Soft 2 px field borders vs page | 1.3:1 | 3:1 (WCAG 1.4.11) | **Still open:** (a) border → ink at ~45% (noticeably darker) · (b) keep: fields also have labels, placeholder and a strong focus ring |

## 7. Browsers / devices 🟡
| Browser | How | Result |
|---|---|---|
| Chrome desktop + Pixel 7 profile | every browser test | ✅ 110 pass |
| Microsoft Edge | `E2E_EDGE=1`, core flows (routes, lessons, upload, recording, landing) | ✅ 26 pass |
| Firefox | `E2E_FIREFOX=1` | ⛔ Windows Application Control blocks the downloaded Firefox on this PC: manual |
| Safari (macOS), iPhone, Android | — | ⏳ manual: needs real devices |

**Manual checklist (≈10 min per device, mock scorer):**
1. Open the site → loader → landing → "I'm a student".
2. Pick class → name → Continue. Reload: you stay on the dashboard.
3. Open a lesson → Listen → Record (allow the mic) → Stop → listen back → Send → score + coloured words.
4. Try again → Next word. Unplug/disable the mic and press Record: "No microphone found".
5. Teacher: Materials → New → Paste → Save → Assign to a class → the student sees it.
6. Rotate the phone: nothing cut off. Turn on "reduce motion": no loader animation.

Note any failure with device, browser version and a screenshot.

## 8. Performance ✅
`scripts/qa/perf.mjs` on the production build, against the real Supabase project (remote, about 200 ms per query from here).

| Measure | Result | Limit |
|---|---|---|
| Page usable (heading shown, loader gone), cold, worst of 3 | 2.0–2.5 s on all 7 main pages (≈1.4 s of it is the loader's one animation cycle) | < 3 s ✅ |
| Send → feedback (mock scorer) | median 2.8 s, worst 3.3 s | ≤ 10 s ✅ |
| 50 users open the dashboard at once | warm: p95 1.7 s · first burst on a fresh server: 3.5 s | — |
| 50 students' dashboard data at once | warm p95 1.1 s (was ~5 s before bug #5) | — |
| 50 recordings submitted at once | 50/50 saved and scored, p95 4.9 s | ≤ 10 s ✅ |
| JavaScript per page (uncompressed) | 0.95–1.2 MB | note |
| Images per page | ≤ 73 KB | ✅ |

Notes:
- The first burst after a server start opens ~50 TLS connections to Supabase at once (slower).
- ~1 MB of JS is mostly React + Motion/Animate UI; worth a look in FYP-2.
- Azure's free tier allows **1** concurrent request (open conflict #6), so these numbers will change with the real scorer.

## 9. Data integrity ✅
`scripts/qa/integrity.mjs` (read-only). Run on 196 attempts (192 scored, 4 failed), including 50 submitted at the same moment.
1. Error stats re-counted from raw word results: 0 differences. ✅
2. Error rate = errors / attempts × 100, 1 decimal: 0 differences. ✅
3. Every scored attempt has the right class at the cut-offs (unit tests at 85, 84.9, 84, 70, 69.9, 69): ✅
4. Failed/pending attempts have no results; no orphan results; every attempt's item and student exist. ✅
5. Every student has a class and roll number; every assignment has a target. ✅

Also checked:
- A failed scoring keeps the attempt and doesn't touch error stats (failure-servers).
- Seed reset works: `npm run db:seed`, followed by `db:check`.

## 10. Security ✅
`scripts/qa/security.mjs`, which prints PASS/FAIL only, never a secret.
- No secret values or key-shaped strings in the whole git history or the browser bundle (44 files). No `.env*` or `.docx` tracked. ✅
- RLS on 14/14 tables; the browser roles have no grants, no policies, and can't call our DB functions; the recordings bucket is private. ✅
- Signed recording links expire after exactly 300 s; another student gets 404. ✅
- Server rejects non-audio uploads (400), recordings > 1 MB (413), renamed non-Word files (415), malformed ids (404, never 500), and invalid material input (422). ✅
- No student names go to external services: the speech engines receive audio + reference text only; there is no AI integration yet. ✅

**Accepted risk:** FYP-1 has no login (ADR-002). Anyone who can reach the app can use the teacher screens and pick any student. That's fine for a local or supervised demo. **Don't deploy publicly without at least a shared access code** (FYP-2: UC-01/02).

## 11. Docs ✅
- Updated: codebase index (QA scripts, test fixture, Edge project, `E2E_BASE_URL`), team guide (how to run QA), design.md (tokens, contrast), open conflicts, implementation plan.
- New: this report and [demo-script.md](demo-script.md).

---

## Still open (not bugs: decisions, keys or hardware)
| Item | Why open | Owner |
|---|---|---|
| Field-border contrast | Brand decision (see §6). The KiddyButton coral was decided: kept | Team |
| Font: **Quicksand** (commit 4361d45) vs **Google Sans Flex** (earlier request, older docs) | Teammate changed it on purpose; used consistently | Team |
| Unslop suggestions (emoji, "!", uppercase chips) | Deliberate Class 1 tone | Team |
| Azure scorer + "Azure vs own engine" write-up | `AZURE_SPEECH_KEY/REGION` and `PYTHON_ENGINE_URL` empty | Team → then dev |
| Firefox, Safari, iPhone, Android | Blocked / needs devices — checklist §7 | Team |
| Migration 0004 on a brand-new Supabase project | Needs a second project (it ran cleanly on the existing data) | Team |
| No login → don't deploy publicly | ADR-002 | FYP-2 |

## How to re-run
```powershell
npm test
```
```powershell
npm run test:db
```
```powershell
npm run build; npx next start -p 3100
```
Then, in a second terminal (PowerShell):
```powershell
$env:E2E_BASE_URL="http://localhost:3100"; $env:E2E_MUTATE="1"; npx playwright test
```
```powershell
$env:BASE="http://localhost:3100"; node scripts/qa/ui-audit.mjs; node scripts/qa/contrast.mjs; node --env-file=.env.local scripts/qa/integrity.mjs; node --env-file=.env.local scripts/qa/security.mjs; node --env-file=.env.local scripts/qa/perf.mjs
```
```powershell
node --env-file=.env.local scripts/qa/failure-servers.mjs
```
Edge: add `$env:E2E_EDGE="1"` and `--project=edge`. Afterwards reset the demo data:
```powershell
npm run db:seed
```
