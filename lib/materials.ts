// Material rules (UC-10 teacher library). Pure functions: used by the form for quick feedback AND
// re-checked on the server before saving, so the browser can never skip them.
// Limits from the 2026-11-28 brief: 1–20 items, ≤ 25 words per item (hard: the 15 s recording
// limit, UC-05); level fit and "fewer than 3 items" are WARNINGS that never block saving.
// Levels keep the SRS names (basic/medium/advanced = the brief's easy/medium/hard).
import type { ItemType, Level } from "@/types";

export const MATERIAL_LIMITS = {
  titleMax: 160,
  instructionsMax: 1000,
  itemsMin: 1,
  itemsMax: 20,
  itemWordsMax: 25, // hard cap
  itemCharsMax: 600,
  fewItemsWarn: 3, // warn below this
} as const;

/** Words per item that suit each level (warning only). */
export const LEVEL_WORDS: Record<Level, { min: number; max: number }> = {
  basic: { min: 1, max: 3 },
  medium: { min: 4, max: 10 },
  advanced: { min: 11, max: 20 },
};

export const levels: Level[] = ["basic", "medium", "advanced"];
const levelName: Record<Level, string> = { basic: "Basic", medium: "Medium", advanced: "Advanced" };

export const wordCount = (text: string) => text.split(/\s+/u).filter(Boolean).length;
export const normaliseItem = (text: string) => String(text ?? "").replace(/[\s ]+/gu, " ").trim();

/** Item type stored with each item (used by the practice screen). Guessed from the text. */
export function detectItemType(text: string): ItemType {
  const t = text.trim();
  const words = wordCount(t);
  const sentenceEnds = (t.match(/[.!?](\s|$)/g) ?? []).length;
  if (words <= 1) return "word";
  if (sentenceEnds >= 2) return "paragraph";
  if (sentenceEnds === 1 || words > 5) return "sentence";
  return "phrase";
}

/** Hard problem with one item (blocks saving), or null. */
export function itemProblem(text: string): string | null {
  const t = normaliseItem(text);
  if (!t) return "An item can't be empty.";
  if (t.length > MATERIAL_LIMITS.itemCharsMax) return `Too long (max ${MATERIAL_LIMITS.itemCharsMax} characters).`;
  const words = wordCount(t);
  if (words > MATERIAL_LIMITS.itemWordsMax)
    return `Too long: ${words} words (max ${MATERIAL_LIMITS.itemWordsMax}). Split it into shorter items.`;
  return null;
}

/** Level-fit advice for one item (never blocks saving). */
export function itemWarnings(text: string, level: Level): string[] {
  const words = wordCount(normaliseItem(text));
  const fit = LEVEL_WORDS[level];
  if (!fit || words === 0) return [];
  if (words < fit.min) return [`Short for ${levelName[level]}: ${fit.min}–${fit.max} words suggested`];
  if (words > fit.max) return [`Long for ${levelName[level]}: ${fit.min}–${fit.max} words suggested`];
  return [];
}

export interface MaterialInput {
  title: string;
  level: string;
  instructions: string;
  items: string[];
}

export type MaterialErrors = Partial<Record<"title" | "level" | "instructions" | "items", string>> & {
  /** index → message, for item-level errors. */
  itemErrors?: Record<number, string>;
};

export interface MaterialWarning {
  /** Item index, or absent for a whole-material warning. */
  item?: number;
  message: string;
}

/** Trim and collapse the fields the way they will be saved. Empty items are KEPT so they can be reported. */
export function cleanMaterial(input: Partial<MaterialInput> | null | undefined): MaterialInput {
  return {
    title: normaliseItem(input?.title ?? ""),
    level: String(input?.level ?? "").trim(),
    instructions: String(input?.instructions ?? "").trim(),
    items: Array.isArray(input?.items) ? input.items.map((i) => normaliseItem(typeof i === "string" ? i : "")) : [],
  };
}

/** Hard errors (block saving) and warnings (returned, never block). Pass a cleaned input. */
export function validateMaterial(input: MaterialInput): { errors: MaterialErrors; warnings: MaterialWarning[] } {
  const errors: MaterialErrors = {};
  const warnings: MaterialWarning[] = [];

  if (!input.title) errors.title = "Enter a title.";
  else if (input.title.length > MATERIAL_LIMITS.titleMax) errors.title = `Keep the title under ${MATERIAL_LIMITS.titleMax} characters.`;
  if (!levels.includes(input.level as Level)) errors.level = "Choose a level.";
  if (input.instructions.length > MATERIAL_LIMITS.instructionsMax)
    errors.instructions = `Keep instructions under ${MATERIAL_LIMITS.instructionsMax} characters.`;

  if (input.items.length < MATERIAL_LIMITS.itemsMin) errors.items = "Add at least one word, phrase or sentence.";
  else if (input.items.length > MATERIAL_LIMITS.itemsMax) errors.items = `Add at most ${MATERIAL_LIMITS.itemsMax} items per material.`;

  const itemErrors: Record<number, string> = {};
  input.items.forEach((text, i) => {
    const p = itemProblem(text);
    if (p) itemErrors[i] = p;
    else if (levels.includes(input.level as Level)) {
      for (const message of itemWarnings(text, input.level as Level)) warnings.push({ item: i, message });
    }
  });
  if (Object.keys(itemErrors).length) {
    errors.itemErrors = itemErrors;
    errors.items ??= "Fix the highlighted items.";
  }
  if (input.items.length > 0 && input.items.length < MATERIAL_LIMITS.fewItemsWarn)
    warnings.push({ message: `Only ${input.items.length} item${input.items.length === 1 ? "" : "s"}: ${MATERIAL_LIMITS.fewItemsWarn} or more make better practice.` });

  return { errors, warnings };
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;

/** Items as the DB functions expect them. */
export const toDbItems = (items: string[]) => items.map((text) => ({ text, item_type: detectItemType(text) }));

/** Today's date in Pakistan (yyyy-mm-dd). */
export function todayInPakistan(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(now);
}
