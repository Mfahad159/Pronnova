import { redirect } from "next/navigation";

// Classes & Students is hidden in FYP-1 since 2026-11-28 (one teacher, one student). Old links land on
// the dashboard instead of a dead page. The roster code (features/roster, /api/classes, /api/students)
// stays for FYP-2.
export default function StudentsPage() {
  redirect("/teacher");
}
