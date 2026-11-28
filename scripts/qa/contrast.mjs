// Phase 5 check 6: WCAG contrast of the text/background pairs the app actually uses, computed from
// the light-theme tokens in app/globals.css. AA: 4.5:1 normal text, 3:1 large text (≥ 24px, or
// ≥ 18.66px bold) and UI parts. Run: node scripts/qa/contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const tok = Object.fromEntries([...root.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (hex) =>
  rgb(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
/** `fg` at `alpha` over `bg` (for tinted pills like bg-score-good/12). */
const mix = (fg, bg, alpha) => "#" + rgb(fg).map((c, i) => Math.round(c * alpha + rgb(bg)[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("");

const W = "#ffffff";
// [what, text colour, background, needs: "normal" 4.5 | "large" 3]
const pairs = [
  ["body text", tok.foreground, tok.background, "normal"],
  ["muted text on page", tok["muted-foreground"], tok.background, "normal"],
  ["muted text on muted panel header", tok["muted-foreground"], tok.muted, "normal"],
  ["coral links / labels (primary) on card", tok.primary, tok.card, "normal"],
  ["coral text on secondary chip", tok.primary, tok.secondary, "normal"],
  ["white on primary (buttons, active tab)", tok["primary-foreground"], tok.primary, "normal"],
  ["white on brand coral (KiddyButton, 16px semibold)", W, tok["brand-coral"], "normal"],
  ["white on brand coral (KiddyButton lg, 18px semibold)", W, tok["brand-coral"], "normal"],
  ["white on Basic badge (score-excellent)", W, tok["score-excellent"], "normal"],
  ["ink on Medium badge", tok.foreground, tok["level-medium"], "normal"],
  ["ink on Advanced badge", tok.foreground, tok["level-advanced"], "normal"],
  ["Excellent text on its 10% tint", tok["score-excellent"], mix(tok["score-excellent"], W, 0.1), "normal"],
  ["Good text on its 10% tint", tok["score-good"], mix(tok["score-good"], W, 0.1), "normal"],
  ["Average text on its 10% tint", tok["score-average"], mix(tok["score-average"], W, 0.1), "normal"],
  ["Good/amber warning text on card", tok["score-good"], tok.card, "normal"],
  ["error text on card", tok.destructive, tok.card, "normal"],
  ["due-soon pill (score-good on 20% level-medium)", tok["score-good"], mix(tok["level-medium"], W, 0.2), "normal"],
  ["focus ring vs page (UI part, drawn solid)", tok.ring, tok.background, "large"],
  ["input border vs page (UI part)", tok.input, tok.background, "large"],
];

// Below AA on purpose (docs/qa-report.md §6):
// - KiddyButton's bright brand coral: ACCEPTED by the team (2026-11-28), keep it.
// - soft 2px field borders: decision still open.
const KNOWN = new Set([
  "white on brand coral (KiddyButton, 16px semibold)",
  "white on brand coral (KiddyButton lg, 18px semibold)",
  "input border vs page (UI part)",
]);
let fails = 0;
const rows = pairs.map(([what, fg, bg, need]) => {
  const r = ratio(fg, bg);
  const min = need === "normal" ? 4.5 : 3;
  const pass = r >= min;
  if (!pass && !KNOWN.has(what)) fails++;
  const known = /KiddyButton/.test(what) ? "ACCEPTED (team)" : "OPEN (decision)";
  return { what, fg, bg, ratio: r.toFixed(2), needs: `${min}:1`, result: pass ? "PASS" : KNOWN.has(what) ? known : "FAIL" };
});
console.table(rows);
console.log(fails ? `${fails} new pair(s) below AA` : `All pairs meet WCAG AA except the accepted KiddyButton coral (2 sizes) and the open field-border decision`);
process.exit(fails ? 1 : 0);
