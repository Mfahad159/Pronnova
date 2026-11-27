import { describe, expect, it } from "vitest";
import { cleanAssignment, mergeVisible, pickDueDate, validateAssignment } from "@/lib/assignments";
import { cleanStudent, validateClassName, validateStudent } from "@/lib/roster";

const today = "2026-11-28";
const ok = { materialId: "m1", dueDate: "2026-12-01", classIds: ["c1"], studentIds: [] };

describe("validateAssignment", () => {
  it("accepts a class target with a future (or today's) date", () => {
    expect(validateAssignment(ok, today)).toEqual({});
    expect(validateAssignment({ ...ok, dueDate: today }, today)).toEqual({});
  });
  it("rejects a past due date", () => {
    expect(validateAssignment({ ...ok, dueDate: "2026-11-27" }, today).dueDate).toBe("The due date can't be in the past.");
  });
  it("needs at least one target", () => {
    expect(validateAssignment({ ...ok, classIds: [] }, today).targets).toMatch(/at least one/);
  });
  it("rejects duplicate targets", () => {
    expect(validateAssignment({ ...ok, classIds: ["c1", "c1"] }, today).targets).toMatch(/only be picked once/);
    expect(validateAssignment({ ...ok, classIds: [], studentIds: ["s1", "s1"] }, today).targets).toMatch(/only be picked once/);
  });
  it("rejects bad dates", () => {
    expect(validateAssignment({ ...ok, dueDate: "31/12/2026" }, today).dueDate).toBe("Enter a valid date.");
    expect(validateAssignment({ ...ok, dueDate: "" }, today).dueDate).toBe("Set a due date.");
  });
  it("cleanAssignment drops blanks", () => {
    expect(cleanAssignment({ materialId: " m1 ", dueDate: "2026-12-01", classIds: ["", " c1 "] })).toEqual({ ...ok, classIds: ["c1"] });
  });
});

describe("visibility: union of class + individual assignments, deduplicated", () => {
  it("one entry per material with the nearest upcoming due date", () => {
    const rows = [
      { lessonId: "m1", dueDate: "2026-12-10" }, // via class
      { lessonId: "m1", dueDate: "2026-12-02" }, // individually — sooner
      { lessonId: "m1", dueDate: "2026-11-20" }, // old, already past
      { lessonId: "m2", dueDate: "2026-12-05" },
    ];
    expect(mergeVisible(rows, today)).toEqual([
      { lessonId: "m1", dueDate: "2026-12-02" },
      { lessonId: "m2", dueDate: "2026-12-05" },
    ]);
  });
  it("when every due date is past, shows the most recent one", () => {
    expect(pickDueDate(["2026-11-01", "2026-11-20"], today)).toBe("2026-11-20");
    expect(pickDueDate([], today)).toBeNull();
  });
});

describe("roster rules", () => {
  it("class name is required and trimmed", () => {
    expect(validateClassName("")).toBe("Enter a class name.");
    expect(validateClassName("Class 1 – Blue")).toBeNull();
  });
  it("student needs full name, roll no and class", () => {
    expect(validateStudent(cleanStudent({}))).toEqual({
      fullName: "Enter the student's full name.",
      rollNo: "Enter a roll number.",
      classId: "Choose a class.",
    });
    expect(validateStudent(cleanStudent({ fullName: "  Ali   Khan ", rollNo: "7", classId: "c1" }))).toEqual({});
    expect(cleanStudent({ fullName: "  Ali   Khan ", rollNo: 7 as unknown as string, classId: "c1" }).fullName).toBe("Ali Khan");
  });
  it("edits only check the fields that were sent", () => {
    expect(validateStudent({ rollNo: "" }, true)).toEqual({ rollNo: "Enter a roll number." });
  });
});
