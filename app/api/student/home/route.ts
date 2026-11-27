import { connection } from "next/server";
import { continueItem } from "@/lib/progress";
import { findCurrentStudent } from "@/server/db/demo-user";
import { getStudentLearning } from "@/server/db/queries/learning";
import { getStudent } from "@/server/db/queries/roster";
import { errorResponse, fail, json } from "@/server/http";

/**
 * GET /api/student/home → {
 *   student: { id, fullName, rollNo, classId, className },
 *   materials: [{ id, title, level, dueDate, overdue, itemCount, attempted, progress, firstItemId }],
 *   continue: { itemId, text, lessonTitle } | null
 * }
 * For the picked student (same cookie as every student endpoint). 404 if missing or archived →
 * the app sends them back to the "Who are you?" picker. Materials = class + individual
 * assignments, deduplicated, nearest upcoming due date first. "continue" reuses UC-03 rules.
 */
export async function GET() {
  // Request-time data: tell Next not to prerender this GET (outside try, so the signal isn't swallowed).
  await connection();
  try {
    const current = await findCurrentStudent();
    if (!current) return fail(404, "Pick your name again.");
    const [student, learning] = await Promise.all([getStudent(current.id), getStudentLearning(current)]);
    const next = continueItem(learning.view, learning.lastItemId);
    return json({
      student: student && {
        id: student.id,
        fullName: student.fullName,
        rollNo: student.rollNo,
        classId: student.classId,
        className: student.className,
      },
      materials: learning.homework.map((h) => ({
        id: h.lessonId,
        title: h.title,
        level: h.level,
        dueDate: h.deadline,
        overdue: h.overdue,
        itemCount: h.itemCount,
        attempted: h.attempted,
        progress: h.itemCount ? h.attempted / h.itemCount : 0,
        firstItemId: h.firstItemId,
      })),
      continue: next ? { itemId: next.id, text: next.text, lessonTitle: next.lessonTitle } : null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
