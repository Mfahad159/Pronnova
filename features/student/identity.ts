"use client";

import { api } from "@/lib/api-client";

// "Who are you?" — this REPLACES LOGIN until auth arrives in FYP-2 (ADR-002). The picked student id
// is kept in localStorage and mirrored to a cookie (POST /api/student/session) so server-rendered
// pages can read it. Anyone on the device can switch: it identifies, it doesn't authenticate.

export const STUDENT_STORAGE_KEY = "pronnova.studentId";

export function readSavedStudentId(): string | null {
  try {
    return window.localStorage.getItem(STUDENT_STORAGE_KEY);
  } catch {
    return null; // private mode / blocked storage: the cookie alone still works
  }
}

function writeSavedStudentId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(STUDENT_STORAGE_KEY, id);
    else window.localStorage.removeItem(STUDENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Remember this student on the device (localStorage + server cookie). Fails with 404 if missing/archived. */
export async function rememberStudent(id: string) {
  const r = await api("/api/student/session", { json: { studentId: id } });
  if (r.ok) writeSavedStudentId(id);
  return r;
}

/** "Not you? Switch student": forget the student everywhere. */
export async function forgetStudent() {
  writeSavedStudentId(null);
  await api("/api/student/session", { method: "DELETE" });
}

/** Is the saved id still a valid, active student? (GET /api/students/[id] answers 404 when archived.) */
export async function checkStudent(id: string) {
  return api<{ student: { id: string; fullName: string } }>(`/api/students/${encodeURIComponent(id)}`);
}
