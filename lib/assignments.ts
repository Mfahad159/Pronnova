// UC-08 (assign only) rules + who-sees-what. Pure functions; the DB function create_assignment()
// enforces the same rules again as the last line of defence.

export interface AssignmentInput {
  materialId: string;
  dueDate: string; // yyyy-mm-dd (Pakistan date)
  classIds: string[];
  studentIds: string[];
}

export type AssignmentErrors = Partial<Record<"materialId" | "dueDate" | "targets", string>>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const asIds = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean) : []);

export function cleanAssignment(input: Partial<AssignmentInput> | null | undefined): AssignmentInput {
  return {
    materialId: String(input?.materialId ?? "").trim(),
    dueDate: String(input?.dueDate ?? "").trim(),
    classIds: asIds(input?.classIds),
    studentIds: asIds(input?.studentIds),
  };
}

/** `today` is yyyy-mm-dd in Pakistan time (passed in so tests are stable). */
export function validateAssignment(a: AssignmentInput, today: string): AssignmentErrors {
  const e: AssignmentErrors = {};
  if (!a.materialId) e.materialId = "Choose a material.";
  if (!a.dueDate) e.dueDate = "Set a due date.";
  else if (!DATE.test(a.dueDate) || Number.isNaN(Date.parse(a.dueDate))) e.dueDate = "Enter a valid date.";
  else if (a.dueDate < today) e.dueDate = "The due date can't be in the past.";
  if (a.classIds.length + a.studentIds.length === 0) e.targets = "Choose at least one class or student.";
  else if (new Set(a.classIds).size !== a.classIds.length || new Set(a.studentIds).size !== a.studentIds.length)
    e.targets = "Each class or student can only be picked once.";
  return e;
}

/** One target row as loaded for a student (already filtered to their class or to them). */
export interface VisibleAssignmentRow {
  lessonId: string;
  dueDate: string; // yyyy-mm-dd
}

/** Nearest upcoming due date (today counts); if all are past, the most recent one. */
export function pickDueDate(dates: string[], today: string): string | null {
  if (dates.length === 0) return null;
  const upcoming = dates.filter((d) => d >= today).sort();
  if (upcoming.length) return upcoming[0];
  return [...dates].sort().at(-1) ?? null;
}

/**
 * Union of class + individual assignments for one student, one entry per material (dedupe),
 * each with the nearest upcoming due date. Order: soonest due first.
 */
export function mergeVisible(rows: VisibleAssignmentRow[], today: string): { lessonId: string; dueDate: string }[] {
  const byLesson = new Map<string, string[]>();
  for (const r of rows) byLesson.set(r.lessonId, [...(byLesson.get(r.lessonId) ?? []), r.dueDate]);
  return [...byLesson]
    .map(([lessonId, dates]) => ({ lessonId, dueDate: pickDueDate(dates, today)! }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.lessonId.localeCompare(b.lessonId));
}
