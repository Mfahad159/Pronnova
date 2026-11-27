import "server-only";
import type { AssignmentInput, VisibleAssignmentRow } from "@/lib/assignments";
import { check, getDb } from "../client";

// UC-08 assign only (migration 0004): an assignment = material + due date; its targets are
// classes (dynamic: students added later are included) and/or individual students.

/** Assignment + targets in one transaction (create_assignment). */
export async function createAssignment(a: AssignmentInput): Promise<string> {
  return check(
    await (await getDb()).rpc("create_assignment", {
      p_material_id: a.materialId,
      p_due_date: a.dueDate,
      p_class_ids: a.classIds,
      p_student_ids: a.studentIds,
    }),
    "create assignment",
  ) as string;
}

/**
 * Every assignment that reaches this student: via their class OR directly. Not deduplicated
 * (see mergeVisible in lib/assignments.ts). Archived students must be filtered out by the caller.
 */
export async function listVisibleAssignmentRows(student: { id: string; classId: string | null }): Promise<VisibleAssignmentRow[]> {
  const filter = [`student_id.eq.${student.id}`, ...(student.classId ? [`class_id.eq.${student.classId}`] : [])].join(",");
  const rows = check(
    await (await getDb()).from("assignment_targets").select("assignments!inner(lesson_id, due_date)").or(filter),
    "load assignments",
  ) as unknown as { assignments: { lesson_id: string; due_date: string } }[];
  return rows.map((r) => ({ lessonId: r.assignments.lesson_id, dueDate: r.assignments.due_date }));
}
