import { execFileSync } from "node:child_process";

// After a run that wrote data (E2E_MUTATE=1), remove what the tests created so the demo stays clean.
export default function globalTeardown() {
  if (!process.env.E2E_MUTATE) return;
  execFileSync(process.execPath, ["--env-file=.env.local", "scripts/clean-test-data.mjs"], { stdio: "inherit" });
}
