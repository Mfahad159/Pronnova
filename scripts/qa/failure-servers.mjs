// Phase 5 check 3 with REAL failures (production build): run `npm run build` first, then
//   node --env-file=.env.local scripts/qa/failure-servers.mjs
// 1) speech engine unreachable → attempt is saved as "failed", Retry works, nothing is counted twice
// 2) Supabase unreachable → friendly error screens / JSON errors, no crash
// Process env wins over .env.local in Next, so each server gets its own broken setting.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");

const AYESHA = "00000000-0000-4000-8000-000000000002";
const results = [];
const ok = (name, pass, detail = "") => results.push({ check: name, result: pass ? "PASS" : "FAIL", detail });

function serve(port, env) {
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: { ...process.env, ...env },
    stdio: "ignore",
  });
  return child;
}
async function waitUp(url) {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`server ${url} did not start`);
}

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });

// ── 1. Speech engine down ──────────────────────────────────────────────────
{
  const base = "http://localhost:3201";
  const srv = serve(3201, { SPEECH_ENGINE: "python", PYTHON_ENGINE_URL: "http://127.0.0.1:9" });
  try {
    await waitUp(base);
    const ctx = await browser.newContext({ permissions: ["microphone"] });
    await ctx.addCookies([{ name: "pronnova_student", value: AYESHA, url: base }]);
    const page = await ctx.newPage();
    const dogStats = async () => (await db.from("error_stats").select("attempts").eq("student_id", AYESHA).eq("unit", "dog")).data?.[0]?.attempts ?? 0;
    const statsBefore = await dogStats();
    const before = (await db.from("attempts").select("id", { count: "exact", head: true }).eq("student_id", AYESHA)).count;
    await page.goto(`${base}/student/chapters/10000000-0000-4000-8000-000000000001`);
    await page.getByRole("link", { name: /\bdog\b/i }).click();
    await page.getByRole("button", { name: "Start recording" }).click();
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Stop recording" }).click();
    await page.getByRole("button", { name: "Send" }).click();
    const saved = await page.getByText(/your recording is saved, but i couldn't check it yet/i).waitFor({ timeout: 30000 }).then(() => true, () => false);
    ok("engine down: student sees 'saved, couldn't check yet'", saved);
    const after = (await db.from("attempts").select("id, status", { count: "exact" }).eq("student_id", AYESHA).order("created_at", { ascending: false }).limit(1));
    ok("engine down: attempt row kept with status 'failed'", after.count === before + 1 && after.data[0]?.status === "failed", `attempts ${before} → ${after.count}, newest: ${after.data[0]?.status}`);
    await page.getByRole("button", { name: /try checking again/i }).click();
    await page.waitForTimeout(3000);
    const again = (await db.from("attempts").select("id", { count: "exact", head: true }).eq("student_id", AYESHA)).count;
    ok("engine down: 'Try checking again' re-uses the same attempt (no duplicate)", again === after.count, `attempts after retry: ${again}`);
    const statsAfter = await dogStats();
    ok("engine down: error stats unchanged by an unscored attempt", statsAfter === statsBefore, `"dog" attempts ${statsBefore} → ${statsAfter}`);
    await ctx.close();
  } finally {
    srv.kill();
  }
}

// ── 2. Supabase down ───────────────────────────────────────────────────────
{
  const base = "http://localhost:3202";
  const srv = serve(3202, { SUPABASE_URL: "https://pronnova-qa-down.invalid" });
  try {
    await waitUp(base);
    const ctx = await browser.newContext();
    await ctx.addCookies([{ name: "pronnova_student", value: AYESHA, url: base }]);
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    for (const path of ["/student", "/teacher/materials", "/teacher/classes"]) {
      await page.goto(base + path);
      const friendly = await page.getByRole("heading", { name: /couldn.t load this page/i }).waitFor({ timeout: 20000 }).then(() => true, () => false);
      ok(`supabase down: ${path} shows the friendly error screen`, friendly);
    }
    const api = await fetch(`${base}/api/materials`);
    const body = await api.json().catch(() => ({}));
    ok("supabase down: API answers JSON with a message (no stack trace)", api.status >= 500 && typeof body.error === "string" && !/at \w+ \(/.test(JSON.stringify(body)), `${api.status} ${JSON.stringify(body)}`);
    ok("supabase down: no uncaught browser errors", pageErrors.length === 0, pageErrors.join(" | "));
    await ctx.close();
  } finally {
    srv.kill();
  }
}

await browser.close();
console.table(results);
process.exit(results.every((r) => r.result === "PASS") ? 0 : 1);
