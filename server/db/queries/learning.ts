import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { mergeVisible } from "@/lib/assignments";
import { todayInPakistan } from "@/lib/materials";
import { PASS_SCORE, itemAccess, learningView, type Assignment, type ChapterView, type PChapter } from "@/lib/progress";
import { check, getDb, getDbForCache } from "../client";
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
  /** Where tapping the lesson resumes: first item not tried yet, else first not mastered, else the first. */
  nextItemId: string | null;
  itemCount: number;
  /** Items with at least one attempt (any result). */
  attempted: number;
  mastered: number;
  /** Past the due date and not finished. Computed here (not in render) so pages stay pure. */
  overdue: boolean;
  /** Due today or within the next 2 days, and not finished. */
  dueSoon: boolean;
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

/** Cache tag for the curriculum (chapters → lessons → items). Material writes revalidate it. */
export const CURRICULUM_TAG = "curriculum";

/**
 * The curriculum is the same for every student, so it is cached (Phase 5 load test: 50 students at
 * once made this the slowest query). Refreshes on its own within ~1 minute (cacheLife "minutes")
 * and immediately after any material write (revalidateTag in the materials API).
 */
async function loadCurriculum(): Promise<ChapterRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CURRICULUM_TAG);
  return check(
    await getDbForCache().from("chapters").select(`id, title, order_no, lessons(${LESSON_COLS})`).order("order_no"),
    "load chapters",
  ) as unknown as ChapterRow[];
}

/**
 * Everything UC-03 needs for one (active) student: content, best scores, what's assigned to them
 * (their class + them individually, deduplicated), last attempt. Callers reject archived students.
 */
export async function getStudentLearning(student: { id: string; classId: string | null }): Promise<StudentLearning> {
  const db = await getDb();
  const today = todayInPakistan();

  // One attempts query serves best scores, tried items and the last item (was three queries).
  const [chapterRows, attemptsRes, visibleRows] = await Promise.all([
    loadCurriculum(),
    db.from("attempts").select("item_id, score, status").eq("student_id", student.id).order("created_at", { ascending: false }),
    listVisibleAssignmentRows(student),
  ]);
  const attempts = check(attemptsRes, "load attempts") as { item_id: string; score: number | string | null; status: string }[];

  const best = new Map<string, number>();
  for (const a of attempts) {
    if (a.status === "scored" && a.score != null) best.set(a.item_id, Math.max(best.get(a.item_id) ?? 0, Number(a.score)));
  }
  const tried = new Set(attempts.map((a) => a.item_id));
  const last = attempts.slice(0, 1);

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
        nextItemId:
          (l.items.find((i) => !tried.has(i.id)) ?? l.items.find((i) => (best.get(i.id) ?? 0) < PASS_SCORE) ?? l.items[0])?.id ?? null,
        itemCount: l.items.length,
        attempted: l.items.filter((i) => tried.has(i.id)).length,
        mastered,
        overdue: a.deadline != null && a.deadline < today && mastered < l.items.length,
        dueSoon: a.deadline != null && a.deadline >= today && daysBetween(today, a.deadline) <= 2 && mastered < l.items.length,
      });
    }
  }
  homework.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || a.title.localeCompare(b.title));

  return { view: learningView({ chapters, best, assigned }), homework, lastItemId: last[0]?.item_id ?? null };
}

/** Whole days from one yyyy-mm-dd date to another. */
function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Can this student open this item? (ADR-004: locked levels, hidden teacher material). */
export async function getItemAccess(student: { id: string; classId: string | null }, itemId: string) {
  const { view } = await getStudentLearning(student);
  return itemAccess(view, itemId);
}
