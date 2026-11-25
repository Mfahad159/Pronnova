import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PICTURE_WORDS } from "@/components/brand/word-pictures";

// Phase 4 E: app pages follow the landing design (ADR-007) and seeded Class 1 words have pictures (ADR-006).

const root = process.cwd();
function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pages(p);
    return name === "page.tsx" ? [p] : [];
  });
}
const appPages = [...pages(join(root, "app/student")), ...pages(join(root, "app/teacher"))];

describe("app pages use the landing design pieces", () => {
  it.each(appPages.map((p) => [p.slice(root.length + 1)]))("%s", (file) => {
    const src = readFileSync(join(root, file), "utf8");
    // Old generic shadcn look is replaced by components/brand (KiddyButton, Panel, PikoSays…).
    expect(src).not.toMatch(/@\/components\/ui\/(button|card|badge)"/);
    expect(src).toMatch(/@\/components\/(brand\/|layout\/(coming-soon|top-bar))/);
  });
});

describe("seeded Class 1 words", () => {
  const seed = readFileSync(join(root, "supabase/seed.sql"), "utf8");
  const wordRows = [...seed.matchAll(/\(\d+, '\w+',\s+\d+, '[^']+',\s+'word',\s+array\[([^\]]+)\]\)/g)];
  const words = wordRows.flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((w) => w[1]));

  it("has single picture words", () => {
    expect(words.length).toBeGreaterThan(5);
  });
  it.each(words)("%s has a picture", (w) => {
    expect(PICTURE_WORDS).toContain(w.toLowerCase());
  });
});
