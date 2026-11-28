// Phase 5 check 8: performance on the PRODUCTION build against the real Supabase project.
//   npm run build && npx next start -p 3100   (in another terminal)
//   BASE=http://localhost:3100 node --env-file=.env.local scripts/qa/perf.mjs
// Measures page loads (< 3 s), Send → feedback (≤ 10 s), JS/image weight, and 50 users at once.
// Writes attempts for the demo student: run `npm run db:seed` afterwards.
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require("@playwright/test");

const BASE = process.env.BASE ?? "http://localhost:3100";
const AYESHA = "00000000-0000-4000-8000-000000000002";
const cookie = `pronnova_student=${AYESHA}`;
const pct = (xs, p) => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))];
const ms = (n) => `${Math.round(n)} ms`;
const kb = (n) => `${Math.round(n / 1024)} KB`;

const home = await (await fetch(`${BASE}/api/student/home`, { headers: { cookie } })).json();
const itemId = home.continue?.itemId;
const report = { pages: [], feedback: [], load: [] };

// ── 1. Page loads (cold browser context each time; Supabase is remote, so this includes DB latency) ──
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
for (const path of ["/", "/student", "/student/chapters", `/student/practice/${itemId}`, "/teacher", "/teacher/materials", "/teacher/materials/new"]) {
  const times = [];
  let js = 0, img = 0;
  for (let run = 0; run < 3; run++) {
    const ctx = await browser.newContext();
    await ctx.addCookies([{ name: "pronnova_student", value: AYESHA, url: BASE }]);
    const page = await ctx.newPage();
    let jsBytes = 0, imgBytes = 0;
    page.on("response", async (r) => {
      const type = r.request().resourceType();
      if (type !== "script" && type !== "image") return;
      const len = Number(r.headers()["content-length"] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
      if (type === "script") jsBytes += len;
      else imgBytes += len;
    });
    const t0 = Date.now();
    await page.goto(BASE + path, { waitUntil: "load" });
    // "Usable": main heading visible and the page loader gone.
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await page.waitForSelector(".pn-loader", { state: "detached", timeout: 15000 }).catch(() => {});
    times.push(Date.now() - t0);
    js = jsBytes;
    img = imgBytes;
    await ctx.close();
  }
  report.pages.push({ page: path.replace(itemId, "[item]"), median: ms(pct(times, 50)), worst: ms(Math.max(...times)), js: kb(js), images: kb(img), "< 3 s": Math.max(...times) < 3000 ? "PASS" : "FAIL" });
}

// ── 2. Send → feedback (fake mic, mock scorer) ──
for (let run = 0; run < 5; run++) {
  const ctx = await browser.newContext({ permissions: ["microphone"] });
  await ctx.addCookies([{ name: "pronnova_student", value: AYESHA, url: BASE }]);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/student/practice/${itemId}`);
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Stop recording" }).click();
  const t0 = Date.now();
  await page.getByRole("button", { name: "Send" }).click();
  await page.locator('[role="status"]').filter({ hasText: /your score is \d+ percent/i }).waitFor({ state: "attached", timeout: 30000 });
  report.feedback.push(Date.now() - t0);
  await ctx.close();
}
await browser.close();

// ── 3. 50 users at once (SRS 3.3.3) ──
function wav(seconds = 1.5, rate = 16000) {
  const n = Math.floor(seconds * rate);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 8000), 44 + i * 2);
  return buf;
}
async function burst(name, users, fn) {
  const t0 = Date.now();
  const results = await Promise.all(Array.from({ length: users }, async () => {
    const s = Date.now();
    try {
      const r = await fn();
      return { ok: r.ok, status: r.status, t: Date.now() - s };
    } catch {
      return { ok: false, status: 0, t: Date.now() - s };
    }
  }));
  const t = results.map((r) => r.t);
  report.load.push({
    test: name,
    users,
    ok: `${results.filter((r) => r.ok).length}/${users}`,
    p50: ms(pct(t, 50)),
    p95: ms(pct(t, 95)),
    "wall time": ms(Date.now() - t0),
    errors: [...new Set(results.filter((r) => !r.ok).map((r) => r.status))].join(",") || "-",
  });
}
// Each burst runs twice: the 1st opens ~50 new TLS connections to Supabase at once (cold server),
// the 2nd shows steady state.
const read = (r) => r.text().then(() => r); // wait for the WHOLE response, not just the headers
for (const round of ["1st (cold)", "2nd (warm)"]) {
  await burst(`student dashboard page — ${round}`, 50, () => fetch(`${BASE}/student`, { headers: { cookie } }).then(read));
  await burst(`student home API — ${round}`, 50, () => fetch(`${BASE}/api/student/home`, { headers: { cookie } }).then(read));
  await burst(`teacher library page — ${round}`, 50, () => fetch(`${BASE}/teacher/materials`).then(read));
}
const audio = wav();
await burst("submit a recording (upload + score + save)", 50, () => {
  const fd = new FormData();
  fd.append("attemptId", randomUUID());
  fd.append("itemId", itemId);
  fd.append("durationMs", "1500");
  fd.append("audio", new Blob([audio], { type: "audio/wav" }), "a.wav");
  return fetch(`${BASE}/api/attempts`, { method: "POST", body: fd, headers: { cookie } });
});

console.log("\nPage loads (3 cold loads each):");
console.table(report.pages);
console.log(`\nSend → feedback (5 runs): median ${ms(pct(report.feedback, 50))}, worst ${ms(Math.max(...report.feedback))} — limit 10 s: ${Math.max(...report.feedback) <= 10000 ? "PASS" : "FAIL"}`);
console.log("\n50 users at once:");
console.table(report.load);
