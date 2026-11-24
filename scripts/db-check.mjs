// Checks that .env.local points at a Supabase project with the migration + seed applied.
// Run: npm run db:check
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("✗ SUPABASE_URL or SUPABASE_SECRET_KEY missing in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// 1. Connection: listing buckets needs a valid URL + secret key, and works before any table exists.
const { data: buckets, error: connErr } = await db.storage.listBuckets();
if (connErr) {
  console.error(`✗ connection: ${connErr.message} (check SUPABASE_URL and SUPABASE_SECRET_KEY)`);
  process.exit(1);
}
console.log(`✓ connected to ${new URL(url).hostname.split(".")[0]} with the secret key (${buckets.length} storage buckets)`);

// 2. Tables from supabase/migrations/0001_init.sql, with row counts from the seed.

const tables = ["profiles", "classes", "enrollments", "chapters", "lessons", "lesson_items", "assignments",
  "attempts", "word_results", "phoneme_results", "error_stats", "teacher_evaluations", "suggestions", "settings"];
let ok = true;
for (const t of tables) {
  // HEAD requests hide "table missing" errors, so do a real (tiny) read.
  const { count, error } = await db.from(t).select("*", { count: "exact" }).limit(1);
  if (error || count == null) { ok = false; console.error(`✗ ${t}: ${error?.message ?? "not reachable (run the migration?)"}`); }
  else console.log(`✓ ${t.padEnd(20)} ${count} rows`);
}
const { data: bucket, error: bErr } = await db.storage.getBucket("recordings");
if (bErr || !bucket) { ok = false; console.error(`✗ storage bucket "recordings": ${bErr?.message ?? "missing"}`); }
else console.log(`✓ storage bucket "recordings" (public: ${bucket.public})`);

// The browser key must NOT be able to read tables (RLS on, no grants).
const pub = process.env.SUPABASE_PUBLISHABLE_KEY;
if (pub) {
  const anon = createClient(url, pub, { auth: { persistSession: false } });
  const { data, error } = await anon.from("profiles").select("id").limit(1);
  if (!error && data?.length) { ok = false; console.error("✗ publishable key can read profiles — check grants/RLS"); }
  else console.log("✓ publishable key cannot read profiles");
}
process.exit(ok ? 0 : 1);
