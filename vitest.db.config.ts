import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Opt-in DB tests (npm run test:db): run the real queries, DB functions and API routes against the
// Supabase project in .env.local. They create rows tagged "zz-test-…" and delete them afterwards.
// Needs migration 0004 applied. NOT part of `npm test`.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/unit/server-only-stub.ts", import.meta.url)),
      "next/server": fileURLToPath(new URL("./tests/db/next-server-stub.ts", import.meta.url)),
      "next/cache": fileURLToPath(new URL("./tests/db/next-cache-stub.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/db/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
