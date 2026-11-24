// Runs Supabase CLI commands against the hosted project using SUPABASE_DB_URL from .env.local.
// The connection string (with the DB password) never appears in package.json or the repo.
//   npm run db:push    → apply new files in supabase/migrations (recorded in supabase_migrations)
//   npm run db:seed    → run supabase/seed.sql (WIPES app data, reloads demo data)
//   npm run db:status  → list which migrations the hosted DB already has
//   npm run db:verify  → read-only security check (supabase/checks/access.sql)
import { spawnSync } from "node:child_process";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("✗ SUPABASE_DB_URL missing in .env.local (Supabase → Connect → Session pooler). See docs/database.md.");
  process.exit(1);
}

const cmd = process.argv[2];
const args = {
  push: ["db", "push", `--remote=${url}`, "--yes"],
  // `db query` runs one statement only, so seeding goes through `db push --include-seed`
  // (seed path set in supabase/config.toml → [db.seed]).
  seed: ["db", "push", `--remote=${url}`, "--include-seed", "--yes"],
  status: ["migration", "list", `--remote=${url}`],
  // Read-only security check: RLS on, no browser grants, private bucket.
  verify: ["db", "query", `--remote=${url}`, "--read-only", "--file", "supabase/checks/access.sql"],
}[cmd];
if (!args) {
  console.error("Usage: node scripts/db.mjs push|seed|status|verify");
  process.exit(1);
}

const r = spawnSync("npx", ["supabase", ...args], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
