import "server-only";
import { PASS_SCORE, itemAccess, learningView, type Assignment, type ChapterView, type PChapter } from "@/lib/progress";
import { check, getDb } from "../client";

export interface HomeworkEntry {
  lessonId: string;
  title: string;
  chapterTitle: string;
  level: PChapter["lessons"][number]["level"];
  deadline: string | null;
  firstItemId: string | null;
  itemCount: number;
  mastered: number;
  /** Past the deadline and not finished. Computed here (not in render) so pages stay pure. */
  overdue: boolean;
}

export interface StudentLearning {
  view: ChapterView[];
  homework: HomeworkEntry[];
  lastItemId: string | null;
}

interface ChapterRow {
  id: string;
  title: string;
  order_no: number;
  lessons: {
    id: string;
    level: PChapter["lessons"][number]["level"];
    order_no: number;
    title: string;
    visibility: "public" | "assigned";
    lesson_items: { id: string; text: string; item_type: PChapter["lessons"][number]["items"][number]["itemType"]; order_no: number }[];
  }[];
}

/** Everything UC-03 needs for one student: content, best scores, their assignments, last attempt. */
export async function getStudentLearning(studentId: string): Promise<StudentLearning> {
  const db = await getDb();

  const [chaptersRes, scoresRes, lastRes, classesRes] = await Promise.all([
    db
      .from("chapters")
      .select("id, title, order_no, lessons(id, level, order_no, title, visibility, lesson_items(id, text, item_type, order_no))")
      .order("order_no"),
    db.from("attempts").select("item_id, score").eq("student_id", studentId).eq("status", "scored"),
    db.from("attempts").select("item_id").eq("student_id", studentId).order("created_at", { ascending: false }).limit(1),
    db.from("enrollments").select("class_id").eq("student_id", studentId),
  ]);

  const chapterRows = check(chaptersRes, "load chapters") as unknown as ChapterRow[];
  const scores = check(scoresRes, "load best scores") as { item_id: string; score: number | string }[];
  const last = check(lastRes, "load last attempt") as { item_id: string }[];
  const classIds = (check(classesRes, "load classes") as { class_id: string }[]).map((r) => r.class_id);

  const filter = [`student_id.eq.${studentId}`, ...(classIds.length ? [`class_id.in.(${classIds.join(",")})`] : [])].join(",");
  const assignmentRows = check(
    await db.from("assignments").select("lesson_id, deadline").or(filter),
    "load assignments",
  ) as { lesson_id: string; deadline: string | null }[];

  const best = new Map<string, number>();
  for (const s of scores) best.set(s.item_id, Math.max(best.get(s.item_id) ?? 0, Number(s.score)));

  // If a lesson is assigned twice (class + student), the earliest deadline wins.
  const assigned = new Map<string, Assignment>();
  for (const a of assignmentRows) {
    const prev = assigned.get(a.lesson_id);
    if (!prev || (a.deadline && (!prev.deadline || a.deadline < prev.deadline))) {
      assigned.set(a.lesson_id, { lessonId: a.lesson_id, deadline: a.deadline });
    }
  }

  const chapters: PChapter[] = chapterRows.map((c) => ({
    id: c.id,
    title: c.title,
    orderNo: c.order_no,
    lessons: c.lessons.map((l) => ({
      id: l.id,
      level: l.level,
      orderNo: l.order_no,
      title: l.title,
      visibility: l.visibility,
      items: [...l.lesson_items].sort((a, b) => a.order_no - b.order_no).map((i) => ({ id: i.id, text: i.text, itemType: i.item_type })),
    })),
  }));

  const now = Date.now();
  const homework: HomeworkEntry[] = [];
  for (const ch of chapters) {
    for (const l of ch.lessons) {
      const a = assigned.get(l.id);
      if (!a) continue;
      homework.push({
        lessonId: l.id,
        title: l.title,
        chapterTitle: ch.title,
        level: l.level,
        deadline: a.deadline,
        firstItemId: l.items[0]?.id ?? null,
        itemCount: l.items.length,
        mastered: l.items.filter((i) => (best.get(i.id) ?? 0) >= PASS_SCORE).length,
        overdue: false,
      });
      const h = homework[homework.length - 1];
      h.overdue = h.deadline != null && new Date(h.deadline).getTime() < now && h.mastered < h.itemCount;
    }
  }
  homework.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));

  return { view: learningView({ chapters, best, assigned }), homework, lastItemId: last[0]?.item_id ?? null };
}

/** Can this student open this item? (ADR-004: locked levels, hidden teacher material). */
export async function getItemAccess(studentId: string, itemId: string) {
  const { view } = await getStudentLearning(studentId);
  return itemAccess(view, itemId);
}
