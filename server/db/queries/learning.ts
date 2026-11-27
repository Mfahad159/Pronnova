import "server-only";
import { mergeVisible } from "@/lib/assignments";
import { todayInPakistan } from "@/lib/materials";
import { PASS_SCORE, itemAccess, learningView, type Assignment, type ChapterView, type PChapter } from "@/lib/progress";
import { check, getDb } from "../client";
import { listVisibleAssignmentRows } from "./assignments";

/** Group for assigned teacher materials that don't belong to a chapter (migration 0004). */
export const MATERIALS_GROUP = { id: "materials", title: "Teacher materials", orderNo: 10_000 } as const;

export interface HomeworkEntry {
  lessonId: string;
  title: string;
  chapterTitle: string;
  level: PChapter["lessons"][number]["level"];
  /** Due date, yyyy-mm-dd (nearest upcoming one when assigned several times). */
  deadline: string | null;
  firstItemId: string | null;
  itemCount: number;
  /** Items with at least one attempt (any result). */
  attempted: number;
  mastered: number;
  /** Past the due date and not finished. Computed here (not in render) so pages stay pure. */
  overdue: boolean;
}

export interface StudentLearning {
  view: ChapterView[];
  homework: HomeworkEntry[];
  lastItemId: string | null;
}

type LessonRow = {
  id: string;
  level: PChapter["lessons"][number]["level"];
  order_no: number;
  title: string;
  visibility: "public" | "assigned";
  lesson_items: { id: string; text: string; item_type: PChapter["lessons"][number]["items"][number]["itemType"]; order_no: number }[];
};
interface ChapterRow {
  id: string;
  title: string;
  order_no: number;
  lessons: LessonRow[];
}
const LESSON_COLS = "id, level, order_no, title, visibility, lesson_items(id, text, item_type, order_no)";

const toLesson = (l: LessonRow): PChapter["lessons"][number] => ({
  id: l.id,
  level: l.level,
  orderNo: l.order_no,
  title: l.title,
  visibility: l.visibility,
  items: [...l.lesson_items].sort((a, b) => a.order_no - b.order_no).map((i) => ({ id: i.id, text: i.text, itemType: i.item_type })),
});

/**
 * Everything UC-03 needs for one (active) student: content, best scores, what's assigned to them
 * (their class + them individually, deduplicated), last attempt. Callers reject archived students.
 */
export async function getStudentLearning(student: { id: string; classId: string | null }): Promise<StudentLearning> {
  const db = await getDb();
  const today = todayInPakistan();

  const [chaptersRes, scoresRes, triedRes, lastRes, visibleRows] = await Promise.all([
    db.from("chapters").select(`id, title, order_no, lessons(${LESSON_COLS})`).order("order_no"),
    db.from("attempts").select("item_id, score").eq("student_id", student.id).eq("status", "scored"),
    db.from("attempts").select("item_id").eq("student_id", student.id),
    db.from("attempts").select("item_id").eq("student_id", student.id).order("created_at", { ascending: false }).limit(1),
    listVisibleAssignmentRows(student),
  ]);

  const chapterRows = check(chaptersRes, "load chapters") as unknown as ChapterRow[];
  const scores = check(scoresRes, "load best scores") as { item_id: string; score: number | string }[];
  const tried = new Set((check(triedRes, "load attempted items") as { item_id: string }[]).map((r) => r.item_id));
  const last = check(lastRes, "load last attempt") as { item_id: string }[];

  const best = new Map<string, number>();
  for (const s of scores) best.set(s.item_id, Math.max(best.get(s.item_id) ?? 0, Number(s.score)));

  // Class + individual assignments, one per material, nearest upcoming due date.
  const assigned = new Map<string, Assignment>(
    mergeVisible(visibleRows, today).map((v) => [v.lessonId, { lessonId: v.lessonId, deadline: v.dueDate }]),
  );

  const chapters: PChapter[] = chapterRows.map((c) => ({
    id: c.id,
    title: c.title,
    orderNo: c.order_no,
    lessons: c.lessons.map(toLesson),
  }));

  // Assigned materials without a chapter live in their own group (always open: they're homework).
  const inChapters = new Set(chapters.flatMap((c) => c.lessons.map((l) => l.id)));
  const loose = [...assigned.keys()].filter((id) => !inChapters.has(id));
  if (loose.length) {
    const rows = check(
      await db.from("lessons").select(LESSON_COLS).in("id", loose).is("chapter_id", null),
      "load assigned materials",
    ) as unknown as LessonRow[];
    if (rows.length) chapters.push({ ...MATERIALS_GROUP, lessons: rows.map(toLesson) });
  }

  const homework: HomeworkEntry[] = [];
  for (const ch of chapters) {
    for (const l of ch.lessons) {
      const a = assigned.get(l.id);
      if (!a) continue;
      const mastered = l.items.filter((i) => (best.get(i.id) ?? 0) >= PASS_SCORE).length;
      homework.push({
        lessonId: l.id,
        title: l.title,
        chapterTitle: ch.title,
        level: l.level,
        deadline: a.deadline,
        firstItemId: l.items[0]?.id ?? null,
        itemCount: l.items.length,
        attempted: l.items.filter((i) => tried.has(i.id)).length,
        mastered,
        overdue: a.deadline != null && a.deadline < today && mastered < l.items.length,
      });
    }
  }
  homework.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || a.title.localeCompare(b.title));

  return { view: learningView({ chapters, best, assigned }), homework, lastItemId: last[0]?.item_id ?? null };
}

/** Can this student open this item? (ADR-004: locked levels, hidden teacher material). */
export async function getItemAccess(student: { id: string; classId: string | null }, itemId: string) {
  const { view } = await getStudentLearning(student);
  return itemAccess(view, itemId);
}
