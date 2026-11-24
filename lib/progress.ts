// UC-03 learning rules (ADR-004). Pure functions over data loaded by server/db/queries/learning.ts.
import { GOOD_MIN } from "@/lib/scoring";
import type { ItemType, Level } from "@/types";

/** A level is "done" when every item in it has a best score of at least this (= "Good"). */
export const PASS_SCORE = GOOD_MIN;
export const LEVEL_ORDER: Level[] = ["basic", "medium", "advanced"];

export interface PItem {
  id: string;
  text: string;
  itemType: ItemType;
}
export interface PLesson {
  id: string;
  level: Level;
  orderNo: number;
  title: string;
  visibility: "public" | "assigned";
  items: PItem[];
}
export interface PChapter {
  id: string;
  title: string;
  orderNo: number;
  lessons: PLesson[];
}
export interface Assignment {
  lessonId: string;
  deadline: string | null;
}

export interface LearningInput {
  chapters: PChapter[]; // ordered by orderNo; lessons/items in any order
  best: Map<string, number>; // itemId → best scored attempt
  assigned: Map<string, Assignment>; // lessonId → assignment for this student
}

export type ItemStatus = "mastered" | "tried" | "new";
export interface ItemView extends PItem {
  status: ItemStatus;
  best: number | null;
  homework: boolean;
  lessonTitle: string;
}
export interface LevelView {
  level: Level;
  unlocked: boolean;
  done: boolean;
  items: ItemView[]; // public items (shown locked when the level is locked)
  homework: ItemView[]; // assigned items in this level (always open)
  mastered: number;
  total: number;
}
export interface ChapterView {
  id: string;
  title: string;
  orderNo: number;
  levels: LevelView[];
  mastered: number;
  total: number;
  /** First level that isn't done yet (the student's "stage"), or null when all done. */
  currentLevel: Level | null;
}

const byOrder = <T extends { orderNo: number }>(a: T, b: T) => a.orderNo - b.orderNo;

function itemView(item: PItem, lesson: PLesson, best: Map<string, number>, homework: boolean): ItemView {
  const b = best.get(item.id);
  return {
    ...item,
    best: b ?? null,
    status: b == null ? "new" : b >= PASS_SCORE ? "mastered" : "tried",
    homework,
    lessonTitle: lesson.title,
  };
}

/** Levels of one chapter with lock state. Basic is always open; each next level needs the previous one done. */
export function chapterView(ch: PChapter, input: Omit<LearningInput, "chapters">): ChapterView {
  const lessons = [...ch.lessons].sort(byOrder);
  let previousOpenAndDone = true;
  const levels = LEVEL_ORDER.map((level): LevelView => {
    const inLevel = lessons.filter((l) => l.level === level);
    const items = inLevel
      .filter((l) => l.visibility === "public")
      .flatMap((l) => l.items.map((i) => itemView(i, l, input.best, input.assigned.has(l.id))));
    const homework = inLevel
      .filter((l) => l.visibility === "assigned" && input.assigned.has(l.id))
      .flatMap((l) => l.items.map((i) => itemView(i, l, input.best, true)));
    const mastered = items.filter((i) => i.status === "mastered").length;
    const unlocked = previousOpenAndDone;
    const done = mastered === items.length; // empty level counts as done
    previousOpenAndDone = unlocked && done;
    return { level, unlocked, done, items, homework, mastered, total: items.length };
  });
  const mastered = levels.reduce((s, l) => s + l.mastered, 0);
  const total = levels.reduce((s, l) => s + l.total, 0);
  const current = levels.find((l) => l.total > 0 && !l.done);
  return { id: ch.id, title: ch.title, orderNo: ch.orderNo, levels, mastered, total, currentLevel: current?.level ?? null };
}

export function learningView(input: LearningInput): ChapterView[] {
  return [...input.chapters].sort(byOrder).map((ch) => chapterView(ch, input));
}

export type Access = "open" | "locked" | "hidden";

/** Can this student open this item? hidden = assigned material not given to them (treat as not found). */
export function itemAccess(view: ChapterView[], itemId: string): Access {
  for (const ch of view) {
    for (const lv of ch.levels) {
      if (lv.homework.some((i) => i.id === itemId)) return "open";
      const it = lv.items.find((i) => i.id === itemId);
      if (it) return lv.unlocked || it.homework ? "open" : "locked";
    }
  }
  return "hidden";
}

/** Every item the student can open, in course order (chapter → level → lesson → item). */
export function openItemsInOrder(view: ChapterView[]): ItemView[] {
  return view.flatMap((ch) =>
    ch.levels.flatMap((lv) => [...(lv.unlocked ? lv.items : lv.items.filter((i) => i.homework)), ...lv.homework]),
  );
}

/**
 * UC-03 alt 1A "Continue": the last item tried if it isn't mastered yet, otherwise the next
 * open item after it that isn't mastered, otherwise the first open un-mastered item anywhere.
 */
export function continueItem(view: ChapterView[], lastItemId: string | null): ItemView | null {
  const open = openItemsInOrder(view);
  const idx = lastItemId ? open.findIndex((i) => i.id === lastItemId) : -1;
  if (idx >= 0 && open[idx].status !== "mastered") return open[idx];
  const after = idx >= 0 ? open.slice(idx + 1).find((i) => i.status !== "mastered") : undefined;
  return after ?? open.find((i) => i.status !== "mastered") ?? null;
}
