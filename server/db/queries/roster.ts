import "server-only";
import type { StudentInput } from "@/lib/roster";
import { check, getDb } from "../client";

// Roster (migration 0004): classes + students. Students are profiles with role 'student'.
// Never hard-delete a student (attempts reference them): archive instead.

export interface ClassRow {
  id: string;
  name: string;
  /** Active (not archived) students. */
  studentCount: number;
  createdAt: string;
}

export interface StudentRow {
  id: string;
  fullName: string;
  rollNo: string;
  classId: string;
  className: string;
  archivedAt: string | null;
  createdAt: string;
}

interface DbStudent {
  id: string;
  name: string;
  roll_no: string;
  class_id: string;
  archived_at: string | null;
  created_at: string;
  classes: { name: string } | null;
}
const STUDENT_COLS = "id, name, roll_no, class_id, archived_at, created_at, classes!profiles_class_id_fkey(name)";

const toStudent = (r: DbStudent): StudentRow => ({
  id: r.id,
  fullName: r.name,
  rollNo: r.roll_no,
  classId: r.class_id,
  className: r.classes?.name ?? "",
  archivedAt: r.archived_at,
  createdAt: r.created_at,
});

/** Roll numbers sort like people expect: 2 before 10. */
const byRoll = (a: StudentRow, b: StudentRow) =>
  a.className.localeCompare(b.className) || a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });

export async function listClasses(): Promise<ClassRow[]> {
  const rows = check(
    await (await getDb())
      .from("classes")
      .select("id, name, created_at, profiles!profiles_class_id_fkey(archived_at)")
      .order("name"),
    "list classes",
  ) as unknown as { id: string; name: string; created_at: string; profiles: { archived_at: string | null }[] }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    studentCount: r.profiles.filter((p) => !p.archived_at).length,
  }));
}

export async function getClass(id: string): Promise<ClassRow | null> {
  return (await listClasses()).find((c) => c.id === id) ?? null;
}

/** Classes are owned by the demo teacher in FYP-1 (no teacher accounts, ADR-002). */
export async function createClass(name: string, teacherId: string): Promise<ClassRow> {
  const row = check(
    await (await getDb()).from("classes").insert({ name, teacher_id: teacherId }).select("id, name, created_at").single(),
    "create class",
  ) as { id: string; name: string; created_at: string };
  return { id: row.id, name: row.name, createdAt: row.created_at, studentCount: 0 };
}

export async function renameClass(id: string, name: string): Promise<boolean> {
  const rows = check(await (await getDb()).from("classes").update({ name }).eq("id", id).select("id"), "rename class") as unknown[];
  return rows.length > 0;
}

export async function listStudents(opts: { classId?: string; includeArchived?: boolean } = {}): Promise<StudentRow[]> {
  let q = (await getDb()).from("profiles").select(STUDENT_COLS).eq("role", "student");
  if (opts.classId) q = q.eq("class_id", opts.classId);
  if (!opts.includeArchived) q = q.is("archived_at", null);
  const rows = check(await q, "list students") as unknown as DbStudent[];
  return rows.map(toStudent).sort(byRoll);
}

/** Any student row, archived or not (callers decide what archived means for them). */
export async function getStudent(id: string): Promise<StudentRow | null> {
  const row = check(
    await (await getDb()).from("profiles").select(STUDENT_COLS).eq("id", id).eq("role", "student").maybeSingle(),
    "get student",
  ) as unknown as DbStudent | null;
  return row ? toStudent(row) : null;
}

export async function createStudent(s: StudentInput): Promise<StudentRow> {
  const row = check(
    await (await getDb())
      .from("profiles")
      .insert({ name: s.fullName, roll_no: s.rollNo, class_id: s.classId, role: "student" })
      .select(STUDENT_COLS)
      .single(),
    "create student",
  ) as unknown as DbStudent;
  return toStudent(row);
}

export async function updateStudent(id: string, s: Partial<StudentInput>): Promise<StudentRow | null> {
  const patch: Record<string, string> = {};
  if (s.fullName !== undefined) patch.name = s.fullName;
  if (s.rollNo !== undefined) patch.roll_no = s.rollNo;
  if (s.classId !== undefined) patch.class_id = s.classId;
  const rows = check(
    await (await getDb()).from("profiles").update(patch).eq("id", id).eq("role", "student").select(STUDENT_COLS),
    "update student",
  ) as unknown as DbStudent[];
  return rows[0] ? toStudent(rows[0]) : null;
}

export async function setStudentArchived(id: string, archived: boolean): Promise<StudentRow | null> {
  const rows = check(
    await (await getDb())
      .from("profiles")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id)
      .eq("role", "student")
      .select(STUDENT_COLS),
    "archive student",
  ) as unknown as DbStudent[];
  return rows[0] ? toStudent(rows[0]) : null;
}
