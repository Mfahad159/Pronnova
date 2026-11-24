import "server-only";
import type { Profile } from "@/types";
import { check, getDb } from "./client";

// FYP-1 has no login (ADR-002). Everyone acts as these seeded people (supabase/seed.sql).
// FYP-2 replaces these two functions with the signed-in user — nothing else should need to change.
export const DEMO_TEACHER_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_STUDENT_ID = "00000000-0000-4000-8000-000000000002";

async function getProfile(id: string): Promise<Profile> {
  const row = check(
    await (await getDb()).from("profiles").select("id, name, role").eq("id", id).maybeSingle(),
    "load demo profile",
  );
  if (!row) throw new Error(`Demo profile ${id} not found. Run supabase/seed.sql.`);
  return row as Profile;
}

export const getCurrentStudent = () => getProfile(DEMO_STUDENT_ID);
export const getCurrentTeacher = () => getProfile(DEMO_TEACHER_ID);
