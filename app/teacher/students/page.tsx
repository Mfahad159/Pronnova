import { redirect } from "next/navigation";

// The roster lives on "Classes & Students". Per-student progress (UC-12) is FYP-2.
export default function TeacherStudentsPage() {
  redirect("/teacher/classes");
}
