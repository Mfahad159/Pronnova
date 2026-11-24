import "server-only";
import type { Chapter, Lesson, LessonItem } from "@/types";
import { check, getDb } from "../client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Route params come from the URL; reject junk before it reaches Postgres (avoids 22P02 errors). */
export const isUuid = (v: string) => UUID.test(v);

interface ChapterRow {
  id: string;
  title: string;
  order_no: number;
  grade_tag: string;
  cover_image: string | null;
  tint: Chapter["tint"];
}

const toChapter = (r: ChapterRow): Chapter => ({
  id: r.id,
  title: r.title,
  orderNo: r.order_no,
  gradeTag: r.grade_tag,
  image: r.cover_image ?? "/objects/img1.jpg",
  tint: r.tint,
});

export async function listChapters(): Promise<Chapter[]> {
  const rows = check(
    await (await getDb()).from("chapters").select("id, title, order_no, grade_tag, cover_image, tint").order("order_no"),
    "list chapters",
  );
  return (rows as ChapterRow[]).map(toChapter);
}

export interface ChapterContent {
  chapter: Chapter;
  lessons: (Lesson & { items: LessonItem[] })[];
}

/** One chapter with its lessons (by level, order) and their items. null if not found. */
export async function getChapterContent(chapterId: string): Promise<ChapterContent | null> {
  if (!isUuid(chapterId)) return null;
  const row = check(
    await (await getDb())
      .from("chapters")
      .select(
        "id, title, order_no, grade_tag, cover_image, tint, lessons(id, chapter_id, level, order_no, title, lesson_items(id, lesson_id, item_type, text, order_no))",
      )
      .eq("id", chapterId)
      .maybeSingle(),
    "load chapter",
  ) as
    | (ChapterRow & {
        lessons: {
          id: string;
          chapter_id: string;
          level: Lesson["level"];
          order_no: number;
          title: string;
          lesson_items: { id: string; lesson_id: string; item_type: LessonItem["itemType"]; text: string; order_no: number }[];
        }[];
      })
    | null;
  if (!row) return null;

  const lessons = [...row.lessons]
    .sort((a, b) => a.order_no - b.order_no)
    .map((l) => ({
      id: l.id,
      chapterId: l.chapter_id,
      level: l.level,
      orderNo: l.order_no,
      title: l.title,
      items: [...l.lesson_items]
        .sort((a, b) => a.order_no - b.order_no)
        .map((i) => ({ id: i.id, lessonId: i.lesson_id, itemType: i.item_type, text: i.text })),
    }));
  return { chapter: toChapter(row), lessons };
}

export interface ItemWithContext extends LessonItem {
  lessonTitle: string;
  level: Lesson["level"];
  chapterId: string;
  chapterTitle: string;
}

export async function getItem(itemId: string): Promise<ItemWithContext | null> {
  if (!isUuid(itemId)) return null;
  const row = check(
    await (await getDb())
      .from("lesson_items")
      .select("id, lesson_id, item_type, text, lessons!inner(title, level, chapters!inner(id, title))")
      .eq("id", itemId)
      .maybeSingle(),
    "load item",
  ) as unknown as {
    id: string;
    lesson_id: string;
    item_type: LessonItem["itemType"];
    text: string;
    lessons: { title: string; level: Lesson["level"]; chapters: { id: string; title: string } };
  } | null;
  if (!row) return null;
  return {
    id: row.id,
    lessonId: row.lesson_id,
    itemType: row.item_type,
    text: row.text,
    lessonTitle: row.lessons.title,
    level: row.lessons.level,
    chapterId: row.lessons.chapters.id,
    chapterTitle: row.lessons.chapters.title,
  };
}
