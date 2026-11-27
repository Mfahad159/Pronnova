import { findCurrentStudent } from "@/server/db/demo-user";
import { getStudent } from "@/server/db/queries/roster";
import { StudentMenu } from "./student-menu";

/** Server part of the profile menu: nothing until a student has been picked on this device. */
export async function CurrentStudentMenu() {
  const current = await findCurrentStudent();
  const student = current ? await getStudent(current.id) : null;
  if (!student) return null;
  return <StudentMenu name={student.fullName} className={student.className} />;
}
