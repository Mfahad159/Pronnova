// Phase 5 checks 5 + 6 (automated part): every screen at 360 / 768 / 1280 / 1440 px.
//   - no sideways page scroll, and no element wider than the screen
//   - every button / link / input / select / textarea has an accessible name
//   - reduced motion: the page loader skips its bite animation
// Needs the app running (dev or `next start`) on BASE (default http://localhost:3000).
//   node scripts/qa/ui-audit.mjs [outDir]
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require("@playwright/test");

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.argv[2];
if (OUT) mkdirSync(OUT, { recursive: true });
const AYESHA = "00000000-0000-4000-8000-000000000002";
const WIDTHS = [360, 768, 1280, 1440];

const mats = await (await fetch(`${BASE}/api/materials`)).json();
const material = mats.materials?.[0]?.id;
const items = await (await fetch(`${BASE}/api/student/home`, { headers: { cookie: `pronnova_student=${AYESHA}` } })).json();
const practice = items.continue?.itemId;

const ROUTES = [
  "/",
  "/onboarding",
  "/student",
  "/student/who",
  "/student/chapters",
  "/student/chapters/10000000-0000-4000-8000-000000000001",
  ...(practice ? [`/student/practice/${practice}`] : []),
  "/student/progress",
  "/teacher",
  "/teacher/materials",
  "/teacher/materials/new",
  ...(material ? [`/teacher/materials/${material}`] : []),
  "/teacher/classes",
  "/teacher/chapters",
  "/no-such-page",
];

const problems = [];
const browser = await chromium.launch();
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768 });
  await ctx.addCookies([{ name: "pronnova_student", value: AYESHA, url: BASE }]);
  const page = await ctx.newPage();
  for (const path of ROUTES) {
    await page.goto(BASE + path);
    await page.waitForSelector(".pn-loader", { state: "detached", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const sideways = document.documentElement.scrollWidth - vw;
      // Elements sticking out of the screen (ignoring ones inside a scrollable box, e.g. tables).
      const wide = [];
      for (const el of document.querySelectorAll("body *")) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.right <= vw + 1) continue;
        let p = el.parentElement, clipped = false;
        while (p) {
          const o = getComputedStyle(p).overflowX;
          if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") { clipped = true; break; }
          p = p.parentElement;
        }
        if (!clipped && getComputedStyle(el).position !== "fixed") wide.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
      }
      // Accessible names (a practical subset of the spec: aria-label/labelledby, <label>, text, title, img alt).
      const nameOf = (el) => {
        if (el.getAttribute("aria-label")?.trim()) return el.getAttribute("aria-label");
        const by = el.getAttribute("aria-labelledby");
        if (by) return by.split(" ").map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
        if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return "label";
        if (el.closest("label")) return "label";
        if (el.getAttribute("title")) return el.getAttribute("title");
        const t = (el.innerText ?? "").trim();
        if (t) return t;
        if (el.querySelector("img[alt]:not([alt=''])")) return "img";
        if (el.getAttribute("placeholder") && el.tagName === "INPUT") return null; // placeholder is not a label
        return null;
      };
      const unnamed = [];
      for (const el of document.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=radio], [role=checkbox]")) {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden" || el.closest("[aria-hidden=true]") || el.closest("[inert]")) continue;
        if (!nameOf(el)) unnamed.push(`${el.tagName.toLowerCase()}${el.getAttribute("type") ? `[${el.getAttribute("type")}]` : ""}.${String(el.className).slice(0, 30)}`);
      }
      return { sideways, wide: [...new Set(wide)].slice(0, 5), unnamed: [...new Set(unnamed)].slice(0, 5) };
    });
    if (r.sideways > 1) problems.push(`${width}px ${path}: page scrolls sideways by ${r.sideways}px`);
    if (r.wide.length) problems.push(`${width}px ${path}: wider than the screen → ${r.wide.join(", ")}`);
    if (r.unnamed.length && width === 1280) problems.push(`${path}: controls without an accessible name → ${r.unnamed.join(", ")}`);
    if (OUT && (width === 360 || width === 768)) await page.screenshot({ path: `${OUT}/${width}${path.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: false });
  }
  await ctx.close();
}

// Reduced motion: the page loader shows no bite animation.
{
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/");
  const anim = await page.evaluate(() => {
    const p = document.querySelector(".pn-loader-upper");
    return p ? getComputedStyle(p).animationName : "gone";
  });
  if (anim !== "none" && anim !== "gone") problems.push(`reduced motion: loader still animates (${anim})`);
  await ctx.close();
}

await browser.close();
console.log(problems.length ? problems.join("\n") : `OK: ${ROUTES.length} screens × ${WIDTHS.length} widths, no sideways scroll, no unnamed controls`);
process.exit(problems.length ? 1 : 0);
