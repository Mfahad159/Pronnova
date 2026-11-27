// Database commands over a direct Postgres connection (the `pg` package), using SUPABASE_DB_URL
// from .env.local. Replaces the Supabase CLI for these tasks because Windows Application Control
// blocks supabase.exe on the team's PCs. The DB URL (with password) is never printed.
//   npm run db:push    → apply new files in supabase/migrations, recorded in
//                        supabase_migrations.schema_migrations (same table the Supabase CLI uses)
//   npm run db:seed    → run supabase/seed.sql (WIPES app data, reloads demo data)
//   npm run db:status  → which migrations are applied / pending
//   npm run db:verify  → read-only security check (supabase/checks/access.sql)
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Client } = require("pg");

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("✗ SUPABASE_DB_URL missing in .env.local (Supabase → Connect → Session pooler). See docs/database.md.");
  process.exit(1);
}
const cmd = process.argv[2];
if (!["push", "seed", "status", "verify"].includes(cmd)) {
  console.error("Usage: node scripts/db-pg.mjs push|seed|status|verify");
  process.exit(1);
}

// Supabase's pooler serves its own certificate chain; this is a dev tool talking to the team's project.
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const files = () =>
  readdirSync("supabase/migrations")
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort()
    .map((f) => ({ file: f, version: f.split("_")[0], name: f.replace(/^\d+_/, "").replace(/\.sql$/, "") }));

async function applied() {
  const r = await client.query("select version from supabase_migrations.schema_migrations");
  return new Set(r.rows.map((x) => x.version));
}

async function run(sql, label) {
  const t0 = Date.now();
  try {
    await client.query(sql);
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error(`✗ ${label} failed — nothing from it was applied.\n  ${err.message}`);
    process.exit(1);
  }
  console.log(`✓ ${label} (${Date.now() - t0} ms)`);
}

await client.connect();
try {
  if (cmd === "status") {
    const done = await applied();
    for (const m of files()) console.log(`${done.has(m.version) ? "✓ applied" : "· pending"}  ${m.file}`);
  }

  if (cmd === "push") {
    const done = await applied();
    const pending = files().filter((m) => !done.has(m.version));
    if (pending.length === 0) console.log("✓ Nothing to apply: the database is up to date.");
    for (const m of pending) {
      const sql = readFileSync(`supabase/migrations/${m.file}`, "utf8");
      await run(sql, `migration ${m.file}`);
      await client.query(
        "insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)",
        [m.version, m.name, [sql]],
      );
    }
  }

  if (cmd === "seed") await run(readFileSync("supabase/seed.sql", "utf8"), "seed supabase/seed.sql");

  if (cmd === "verify") {
    const r = await client.query(readFileSync("supabase/checks/access.sql", "utf8"));
    console.table(r.rows);
  }
} finally {
  await client.end();
}
