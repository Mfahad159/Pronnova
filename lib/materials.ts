// UC-10 material rules. Pure functions: used by the form (live preview) AND re-checked on the
// server before saving, so the browser can never skip them.
import type { ItemType, Level } from "@/types";

export const MATERIAL_LIMITS = {
  titleMax: 160,
  instructionsMax: 1000,
  itemsMax: 30,
  itemCharsMax: 600,
  // SRS 2.4 allows ~15-word sentences; Class 1 (ADR-006) keeps them short: max 8, warn above 6.
  sentenceWordsMax: 8,
  sentenceWordsWarn: 6,
  paragraphWordsMax: 80,
} as const;

export const itemTypes: ItemType[] = ["word", "phrase", "sentence", "paragraph"];
const levels: Level[] = ["basic", "medium", "advanced"];

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Guess the type from the text. The teacher can override it. */
export function detectItemType(text: string): ItemType {
  const t = text.trim();
  const words = wordCount(t);
  const sentenceEnds = (t.match(/[.!?](\s|$)/g) ?? []).length;
  if (words <= 1) return "word";
  if (sentenceEnds >= 2 || words > MATERIAL_LIMITS.sentenceWordsMax) return "paragraph";
  if (sentenceEnds === 1 || words > 5) return "sentence";
  return "phrase";
}

export interface DraftItem {
  text: string;
  itemType: ItemType;
}

/** One item per line: trims, collapses spaces, drops empty lines and exact duplicates (case-insensitive). */
export function parseItemLines(raw: string): DraftItem[] {
  const seen = new Set<string>();
  const out: DraftItem[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const text = line.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, itemType: detectItemType(text) });
  }
  return out;
}

/** Problem with one item, or null if fine. */
export function itemProblem(item: DraftItem): string | null {
  const words = wordCount(item.text);
  if (item.text.length > MATERIAL_LIMITS.itemCharsMax) return `Too long (max ${MATERIAL_LIMITS.itemCharsMax} characters).`;
  if (item.itemType === "word" && words !== 1) return "A word item must be a single word.";
  if (item.itemType === "sentence" && words > MATERIAL_LIMITS.sentenceWordsMax)
    return `Sentences can have up to ${MATERIAL_LIMITS.sentenceWordsMax} words. Split it or mark it as a paragraph.`;
  if (item.itemType === "paragraph" && words > MATERIAL_LIMITS.paragraphWordsMax)
    return `Paragraphs can have up to ${MATERIAL_LIMITS.paragraphWordsMax} words.`;
  return null;
}

/** Soft advice for Class 1 (does not block saving), or null. */
export function itemWarning(item: DraftItem): string | null {
  const words = wordCount(item.text);
  if (item.itemType === "sentence" && words > MATERIAL_LIMITS.sentenceWordsWarn && words <= MATERIAL_LIMITS.sentenceWordsMax)
    return `${words} words is long for Class 1. Try ${MATERIAL_LIMITS.sentenceWordsWarn} or fewer.`;
  return null;
}

export interface MaterialInput {
  title: string;
  instructions: string;
  chapterId: string;
  level: string;
  classId: string; // "" = save without class (UC-10 alt 3A)
  deadline: string; // yyyy-mm-dd or ""
  items: DraftItem[];
}

export type MaterialErrors = Partial<Record<"title" | "instructions" | "chapterId" | "level" | "classId" | "deadline" | "items", string>> & {
  itemErrors?: Record<number, string>;
};

/** Validates everything. `today` is yyyy-mm-dd in Pakistan time (passed in so tests are stable). */
export function validateMaterial(input: MaterialInput, today: string): MaterialErrors {
  const e: MaterialErrors = {};
  const title = input.title.trim();
  if (!title) e.title = "Enter a title.";
  else if (title.length > MATERIAL_LIMITS.titleMax) e.title = `Keep the title under ${MATERIAL_LIMITS.titleMax} characters.`;
  if (input.instructions.length > MATERIAL_LIMITS.instructionsMax)
    e.instructions = `Keep instructions under ${MATERIAL_LIMITS.instructionsMax} characters.`;
  if (!input.chapterId) e.chapterId = "Choose a chapter.";
  if (!levels.includes(input.level as Level)) e.level = "Choose a level.";

  if (input.classId && !input.deadline) e.deadline = "Set a due date for the class.";
  if (input.deadline) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) e.deadline = "Enter a valid date.";
    else if (input.deadline < today) e.deadline = "The due date can't be in the past.";
  }

  if (input.items.length === 0) e.items = "Add at least one word, phrase or sentence.";
  else if (input.items.length > MATERIAL_LIMITS.itemsMax) e.items = `Add at most ${MATERIAL_LIMITS.itemsMax} items per material.`;
  const itemErrors: Record<number, string> = {};
  input.items.forEach((it, i) => {
    if (!itemTypes.includes(it.itemType)) itemErrors[i] = "Choose a type.";
    else {
      const p = itemProblem(it);
      if (p) itemErrors[i] = p;
    }
  });
  if (Object.keys(itemErrors).length) {
    e.itemErrors = itemErrors;
    e.items ??= "Fix the highlighted items.";
  }
  return e;
}

export const hasErrors = (e: MaterialErrors) => Object.keys(e).length > 0;

/** Today's date in Pakistan (yyyy-mm-dd). */
export function todayInPakistan(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(now);
}

/** End of the chosen day in Pakistan time, as an ISO timestamp (deadline = whole day). */
export function deadlineToIso(date: string): string {
  return `${date}T23:59:59+05:00`;
}
