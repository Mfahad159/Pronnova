import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";
import { check, getDb } from "./client";

// FYP-1 has no login (ADR-002). The teacher is the seeded demo teacher. The student is whoever was
// picked on "Who are you?" (/student/who), remembered in a plain cookie — NOT authentication.
// Without a pick, the seeded demo student is used so existing flows keep working.
// FYP-2 replaces these functions with the signed-in user — nothing else should need to change.
export const DEMO_TEACHER_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_STUDENT_ID = "00000000-0000-4000-8000-000000000002";
export const STUDENT_COOKIE = "pronnova_student";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CurrentStudent extends Profile {
  classId: string | null;
  archivedAt: string | null;
}

/** The picked student was archived or removed: send them back to the picker. */
export class StudentUnavailableError extends Error {
  constructor() {
    super("Pick your name again.");
    this.name = "StudentUnavailableError";
  }
}

async function loadProfile(id: string) {
  return check(
    await (await getDb()).from("profiles").select("id, name, role, class_id, archived_at").eq("id", id).maybeSingle(),
    "load profile",
  ) as { id: string; name: string; role: Profile["role"]; class_id: string | null; archived_at: string | null } | null;
}

/** Id of the picked student (cookie), or the demo student. */
export async function getCurrentStudentId(): Promise<string> {
  const picked = (await cookies()).get(STUDENT_COOKIE)?.value;
  return picked && UUID.test(picked) ? picked : DEMO_STUDENT_ID;
}

/** For API routes: throws StudentUnavailableError if missing, not a student, or archived (→ 404). */
export async function getCurrentStudent(): Promise<CurrentStudent> {
  const row = await loadProfile(await getCurrentStudentId());
  if (!row || row.role !== "student" || row.archived_at) throw new StudentUnavailableError();
  return { id: row.id, name: row.name, role: row.role, classId: row.class_id, archivedAt: row.archived_at };
}

/** For API routes that answer 404 themselves: the active picked student, or null. */
export async function findCurrentStudent(): Promise<CurrentStudent | null> {
  try {
    return await getCurrentStudent();
  } catch (err) {
    if (err instanceof StudentUnavailableError) return null;
    throw err;
  }
}

/** For pages: same, but sends the browser to the picker instead of throwing. */
export async function getCurrentStudentOrPick(): Promise<CurrentStudent> {
  try {
    return await getCurrentStudent();
  } catch (err) {
    if (err instanceof StudentUnavailableError) redirect("/student/who");
    throw err;
  }
}

export async function getCurrentTeacher(): Promise<Profile> {
  const row = await loadProfile(DEMO_TEACHER_ID);
  if (!row) throw new Error(`Demo teacher ${DEMO_TEACHER_ID} not found. Run supabase/seed.sql.`);
  return { id: row.id, name: row.name, role: row.role };
}
