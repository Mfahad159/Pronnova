// Runs Supabase CLI commands against the hosted project using SUPABASE_DB_URL from .env.local.
// The connection string (with the DB password) never appears in package.json or the repo.
//   npm run db:push    → apply new files in supabase/migrations (recorded in supabase_migrations)
//   npm run db:seed    → run supabase/seed.sql (WIPES app data, reloads demo data)
//   npm run db:status  → list which migrations the hosted DB already has
import { spawnSync } from "node:child_process";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("✗ SUPABASE_DB_URL missing in .env.local (Supabase → Connect → Session pooler). See docs/database.md.");
  process.exit(1);
}

const cmd = process.argv[2];
const args = {
  push: ["db", "push", `--remote=${url}`, "--yes"],
  seed: ["db", "query", `--remote=${url}`, "--file", "supabase/seed.sql", "--yes"],
  status: ["migration", "list", `--remote=${url}`],
}[cmd];
if (!args) {
  console.error("Usage: node scripts/db.mjs push|seed|status");
  process.exit(1);
}

const r = spawnSync("npx", ["supabase", ...args], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
