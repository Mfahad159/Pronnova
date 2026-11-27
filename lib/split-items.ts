// Text → practice items. ONE shared function for "Paste text" and "Import Word (.docx)".
// It only builds a preview: nothing is saved here. The teacher edits the preview, then saves
// through the normal create-material endpoint (which validates again).
import { MATERIAL_LIMITS, itemWarnings, wordCount } from "@/lib/materials";
import type { Level } from "@/types";

export type SplitMode = "sentence" | "line";

export interface PreviewItem {
  text: string;
  words: number;
  /** Over the hard 25-word cap: saving will be refused until it is split or shortened. */
  tooLong: boolean;
  warnings: string[];
}

// Abbreviations that end in "." but don't end a sentence (lower-case, with their dots).
const ABBREVIATIONS = new Set(["mr.", "mrs.", "ms.", "dr.", "e.g.", "i.e.", "etc.", "st.", "prof.", "vs.", "no."]);

// Bullets and numbering at the start of a line: "•", "-", "*", "1.", "2)", "(3)", "a)", "b.".
// A space must follow, so words like "e.g." or "Mr." are never touched.
const BULLET = /^\s*(?:[•●○▪▫◦‣∙·*–—-]|\(?\d{1,3}[.)]|\(?[a-zA-Z][.)])\s+/u;

/** Collapse all whitespace (incl. non-breaking/zero-width spaces) to single spaces and trim. */
export function normaliseSpaces(text: string): string {
  return text.replace(/[\s ​﻿]+/gu, " ").trim();
}

function stripBullet(line: string): string {
  let out = line;
  // Nested numbering like "1. a) word" loses both markers.
  for (let i = 0; i < 3 && BULLET.test(out); i++) out = out.replace(BULLET, "");
  return out;
}

/** Split one line on . ! ? while keeping abbreviations (Mr. Mrs. Dr. Ms. e.g. i.e. etc.) intact. */
function splitSentences(line: string): string[] {
  const sentences: string[] = [];
  let current: string[] = [];
  for (const word of line.split(" ")) {
    current.push(word);
    const bare = word.replace(/["'”’)\]]+$/u, "").toLowerCase();
    if (/[.!?]$/.test(bare) && !ABBREVIATIONS.has(bare)) {
      sentences.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) sentences.push(current.join(" "));
  return sentences;
}

/**
 * Raw text → preview items.
 * - Whitespace is normalised; bullets and numbering are stripped; empty results are dropped.
 * - "line" mode: one item per line. "sentence" mode (default): each line is also split into
 *   sentences on . ! ? (a line break always ends an item, so word lists stay one word per item).
 * - Text is otherwise kept exactly as written (Urdu and other scripts pass through unchanged).
 * - Each item carries its word count and warnings (too long, level fit when a level is given).
 */
export function splitTextToItems(raw: string, mode: SplitMode = "sentence", level?: Level): PreviewItem[] {
  const lines = String(raw ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => normaliseSpaces(stripBullet(normaliseSpaces(l))))
    .filter(Boolean);

  const texts = mode === "line" ? lines : lines.flatMap(splitSentences);
  return texts
    .map(normaliseSpaces)
    .filter(Boolean)
    .map((text) => {
      const words = wordCount(text);
      const tooLong = words > MATERIAL_LIMITS.itemWordsMax;
      return {
        text,
        words,
        tooLong,
        warnings: tooLong
          ? [`Too long: ${words} words (max ${MATERIAL_LIMITS.itemWordsMax}). Split it into shorter items.`]
          : level
            ? itemWarnings(text, level)
            : [],
      };
    });
}
