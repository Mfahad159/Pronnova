import { describe, expect, it } from "vitest";
import { isUuid } from "@/server/db/queries/curriculum";

describe("isUuid (route param guard)", () => {
  it("accepts seeded ids", () => {
    expect(isUuid("10000000-0000-4000-8000-000000000001")).toBe(true);
  });
  it.each(["ch-1", "", "1; drop table x", "10000000-0000-4000-8000-00000000000"])("rejects %j", (v) => {
    expect(isUuid(v)).toBe(false);
  });
});
