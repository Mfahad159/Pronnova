// Roster rules (classes + students). Pure; the DB constraints in migration 0004 back them up.
import { normaliseItem } from "@/lib/materials";

export const ROSTER_LIMITS = { classNameMax: 120, fullNameMax: 120, rollNoMax: 20 } as const;

export function cleanClassName(name: unknown): string {
  return normaliseItem(typeof name === "string" ? name : "");
}

export function validateClassName(name: string): string | null {
  if (!name) return "Enter a class name.";
  if (name.length > ROSTER_LIMITS.classNameMax) return `Keep the class name under ${ROSTER_LIMITS.classNameMax} characters.`;
  return null;
}

export interface StudentInput {
  fullName: string;
  rollNo: string;
  classId: string;
}
export type StudentErrors = Partial<Record<keyof StudentInput, string>>;

export function cleanStudent(input: Partial<StudentInput> | null | undefined): StudentInput {
  return {
    fullName: normaliseItem(typeof input?.fullName === "string" ? input.fullName : ""),
    rollNo: normaliseItem(typeof input?.rollNo === "string" || typeof input?.rollNo === "number" ? String(input.rollNo) : ""),
    classId: String(input?.classId ?? "").trim(),
  };
}

/** `partial`: for edits, only fields that were sent are checked. */
export function validateStudent(s: Partial<StudentInput>, partial = false): StudentErrors {
  const e: StudentErrors = {};
  const need = (k: keyof StudentInput) => !partial || s[k] !== undefined;
  if (need("fullName")) {
    if (!s.fullName) e.fullName = "Enter the student's full name.";
    else if (s.fullName.length > ROSTER_LIMITS.fullNameMax) e.fullName = `Keep the name under ${ROSTER_LIMITS.fullNameMax} characters.`;
  }
  if (need("rollNo")) {
    if (!s.rollNo) e.rollNo = "Enter a roll number.";
    else if (s.rollNo.length > ROSTER_LIMITS.rollNoMax) e.rollNo = `Keep the roll number under ${ROSTER_LIMITS.rollNoMax} characters.`;
  }
  if (need("classId") && !s.classId) e.classId = "Choose a class.";
  return e;
}
