// Phase 5 check 10: security. Prints PASS/FAIL only — never a secret value.
//   BASE=http://localhost:3100 node --env-file=.env.local scripts/qa/security.mjs   (after `npm run build`)
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);
const { Client } = require("pg");

const BASE = process.env.BASE ?? "http://localhost:3100";
const AYESHA = "00000000-0000-4000-8000-000000000002";
const results = [];
const ok = (check, pass, detail = "") => results.push({ check, result: pass ? "PASS" : "FAIL", detail });

// Secret VALUES to look for (from .env.local), plus generic key shapes. Never printed.
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const dbPassword = (() => {
  try {
    return decodeURIComponent(new URL(env.SUPABASE_DB_URL).password);
  } catch {
    return "";
  }
})();
const secrets = [env.SUPABASE_SECRET_KEY, dbPassword, env.AZURE_SPEECH_KEY, env.GEMINI_API_KEY].filter((s) => s && s.length >= 8);
const SHAPES = /sb_secret_[A-Za-z0-9_-]{10,}|eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|postgres(ql)?:\/\/[^\s:]+:[^\s@]{6,}@/;

// 1. Git: whole history + tracked files.
const history = execSync("git log -p --all", { maxBuffer: 1024 * 1024 * 512 }).toString();
ok("git history has no secret values", !secrets.some((s) => history.includes(s)));
ok("git history has no key-shaped strings", !SHAPES.test(history.replace(/\.\.\./g, "")));
const tracked = execSync("git ls-files").toString().split("\n");
ok("no .env* or .docx file is tracked", !tracked.some((f) => /(^|\/)\.env|\.docx$/i.test(f)), tracked.filter((f) => /(^|\/)\.env|\.docx$/i.test(f)).join(", "));
ok("only harmless vars are exposed to the browser (NEXT_PUBLIC_*)", Object.keys(env).filter((k) => k.startsWith("NEXT_PUBLIC_")).every((k) => !/KEY|SECRET|PASSWORD|DB_URL/.test(k)));

// 2. Browser bundle.
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : files.push(join(d, f))));
walk(".next/static");
const bundle = files.map((f) => readFileSync(f, "utf8")).join("\n");
ok(`browser bundle (${files.length} files) has no secret values`, !secrets.some((s) => bundle.includes(s)));
ok("browser bundle has no key-shaped strings", !SHAPES.test(bundle));

// 3. Database access rules (same as npm run db:verify).
const pg = new Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await pg.connect();
const v = (await pg.query(readFileSync("supabase/checks/access.sql", "utf8"))).rows[0];
ok("RLS on every table", Number(v.rls_on_tables) === Number(v.total_tables), `${v.rls_on_tables}/${v.total_tables}`);
ok("browser roles have no table grants and no policies", Number(v.browser_grants) === 0 && Number(v.policies) === 0);
ok("browser roles can't call our DB functions", v.browser_can_call_create_material === false && v.browser_can_call_complete_attempt === false);
ok("recordings bucket is private", v.bucket_public === false);
const audio = (await pg.query(`select id from public.attempts where student_id = $1 and audio_path is not null order by created_at desc limit 1`, [AYESHA])).rows[0];
await pg.end();

// 4. Signed recording links expire after 5 minutes; other people's recordings are hidden.
if (audio) {
  const r = await fetch(`${BASE}/api/recordings/${audio.id}?as=student`, { headers: { cookie: `pronnova_student=${AYESHA}` } });
  const { url } = await r.json();
  const token = new URL(url).searchParams.get("token");
  const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  ok("signed recording link expires in 5 minutes", claims.exp - claims.iat === 300, `exp - iat = ${claims.exp - claims.iat}s`);
  const other = await fetch(`${BASE}/api/recordings/${audio.id}?as=student`, { headers: { cookie: "pronnova_student=00000000-0000-4000-8000-000000000020" } });
  ok("another student can't get that recording (404)", other.status === 404, `status ${other.status}`);
} else ok("signed recording link check", false, "no attempt with audio found — record one first");

// 5. Server-side validation of uploads and input.
const post = (path, body, headers = {}) => fetch(BASE + path, { method: "POST", body, headers: { cookie: `pronnova_student=${AYESHA}`, ...headers } });
const attemptForm = (file, name, durationMs = "1500") => {
  const fd = new FormData();
  fd.append("attemptId", crypto.randomUUID());
  fd.append("itemId", "00000000-0000-4000-8000-0000000000ff");
  fd.append("durationMs", durationMs);
  fd.append("audio", file, name);
  return fd;
};
let r = await post("/api/attempts", attemptForm(new Blob(["not audio"], { type: "text/plain" }), "x.txt"));
ok("recording upload refuses a non-audio file", r.status === 400 || r.status === 415, `status ${r.status}`);
r = await post("/api/attempts", attemptForm(new Blob([new Uint8Array(1_200_000)], { type: "audio/webm" }), "big.webm"));
ok("recording upload refuses > 1 MB", r.status === 413, `status ${r.status}`);
const fd = new FormData();
fd.append("file", new Blob([new Uint8Array([0x4d, 0x5a, 0x90, 0])]), "virus.docx");
r = await post("/api/materials/import", fd);
ok("Word import refuses a renamed non-Word file", r.status === 415, `status ${r.status}`);
const junk = ["/api/students/'%20or%201=1--", "/api/materials/..%2F..%2Fetc", "/api/recordings/xyz", "/api/classes/<script>"];
const statuses = await Promise.all(junk.map((p) => fetch(BASE + p, { method: p.startsWith("/api/classes") ? "PATCH" : "GET", body: p.startsWith("/api/classes") ? "{}" : undefined }).then((x) => x.status)));
ok("malformed ids get 404, never a server error", statuses.every((s) => s === 404), statuses.join(","));
r = await post("/api/materials", JSON.stringify({ title: "<img src=x onerror=alert(1)>", level: "basic", items: [] }), { "content-type": "application/json" });
ok("material API validates on the server (empty items → 422)", r.status === 422, `status ${r.status}`);

console.table(results);
process.exit(results.every((x) => x.result === "PASS") ? 0 : 1);
