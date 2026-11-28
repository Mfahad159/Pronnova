import "server-only";
import type { Profile } from "@/types";
import { check, getDb } from "./client";

// FYP-1 has no login (ADR-002) and, since 2026-11-28, exactly ONE teacher (Umar) and ONE student
// (Ahmad), seeded in supabase/seed.sql. These functions return them. FYP-2 replaces them with the
// signed-in user — nothing else should need to change.
export const DEMO_TEACHER_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_STUDENT_ID = "00000000-0000-4000-8000-000000000002";

export interface CurrentStudent extends Profile {
  classId: string | null;
  archivedAt: string | null;
}

/** The demo student is missing or archived (database not seeded). */
export class StudentUnavailableError extends Error {
  constructor() {
    super("The demo student is missing. Run npm run db:seed.");
    this.name = "StudentUnavailableError";
  }
}

async function loadProfile(id: string) {
  return check(
    await (await getDb()).from("profiles").select("id, name, role, class_id, archived_at").eq("id", id).maybeSingle(),
    "load profile",
  ) as { id: string; name: string; role: Profile["role"]; class_id: string | null; archived_at: string | null } | null;
}

/** Id of the student using the app: always the one demo student in FYP-1. */
export async function getCurrentStudentId(): Promise<string | null> {
  return DEMO_STUDENT_ID;
}

/** For API routes: throws StudentUnavailableError if missing, not a student, or archived (→ 404). */
export async function getCurrentStudent(): Promise<CurrentStudent> {
  const id = await getCurrentStudentId();
  const row = id ? await loadProfile(id) : null;
  if (!row || row.role !== "student" || row.archived_at) throw new StudentUnavailableError();
  return { id: row.id, name: row.name, role: row.role, classId: row.class_id, archivedAt: row.archived_at };
}

/** For API routes that answer 404 themselves: the demo student, or null if missing. */
export async function findCurrentStudent(): Promise<CurrentStudent | null> {
  try {
    return await getCurrentStudent();
  } catch (err) {
    if (err instanceof StudentUnavailableError) return null;
    throw err;
  }
}

/** For pages: the demo student (errors reach the page's error screen). Name kept from the picker era. */
export async function getCurrentStudentOrPick(): Promise<CurrentStudent> {
  return getCurrentStudent();
}

export async function getCurrentTeacher(): Promise<Profile> {
  const row = await loadProfile(DEMO_TEACHER_ID);
  if (!row) throw new Error(`Demo teacher ${DEMO_TEACHER_ID} not found. Run supabase/seed.sql.`);
  return { id: row.id, name: row.name, role: row.role };
}
