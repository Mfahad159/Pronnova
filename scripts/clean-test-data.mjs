// Removes data created by tests, keeps the demo seed and hand-made materials.
//   npm run db:clean-tests        (also runs after `E2E_MUTATE=1 npm run test:e2e`)
// What counts as test data:
//   - lessons whose title starts with "E2E " (created by tests/e2e/phase2.spec.ts) — cascades to items/assignments/attempts
//   - attempts scored by the mock engine (model_version "mock:…") — the seed uses "seed"; real engines use "azure:"/"python:"
// Afterwards error_stats is rebuilt from the remaining word results, so counts stay correct.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("✗ SUPABASE_URL / SUPABASE_SECRET_KEY missing (.env.local)");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const must = (r, what) => {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
};

// 1. Test lessons (and everything hanging off them).
const lessons = must(await db.from("lessons").select("id").like("title", "E2E %"), "find test lessons");
if (lessons.length) must(await db.from("lessons").delete().in("id", lessons.map((l) => l.id)), "delete test lessons");

// 2. Mock-scored attempts + their recordings (also catches failed ones without a model version).
const attempts = must(
  await db.from("attempts").select("id, audio_path, model_version, status").or("model_version.like.mock:%,and(model_version.is.null,audio_path.not.is.null)"),
  "find test attempts",
);
const paths = attempts.map((a) => a.audio_path).filter(Boolean);
for (let i = 0; i < paths.length; i += 100) {
  const { error } = await db.storage.from("recordings").remove(paths.slice(i, i + 100));
  if (error) console.warn("! could not remove some recordings:", error.message);
}
for (let i = 0; i < attempts.length; i += 100) {
  must(await db.from("attempts").delete().in("id", attempts.slice(i, i + 100).map((a) => a.id)), "delete test attempts");
}

// 3. Rebuild per-word error stats from what's left (phoneme stats: none in the seed).
const words = must(await db.from("word_results").select("word, is_error, attempts!inner(student_id)"), "load word results");
const stats = new Map();
for (const w of words) {
  const unit = w.word.toLowerCase().replace(/[^\p{L}']/gu, "");
  if (!unit) continue;
  const k = `${w.attempts.student_id}|${unit}`;
  const s = stats.get(k) ?? { student_id: w.attempts.student_id, unit_type: "word", unit, attempts: 0, errors: 0 };
  s.attempts += 1;
  if (w.is_error) s.errors += 1;
  stats.set(k, s);
}
must(await db.from("error_stats").delete().neq("unit", ""), "clear error stats");
if (stats.size) must(await db.from("error_stats").insert([...stats.values()]), "rebuild error stats");

console.log(`✓ removed ${lessons.length} test lessons, ${attempts.length} test attempts, ${paths.length} recordings; rebuilt ${stats.size} error stats`);
