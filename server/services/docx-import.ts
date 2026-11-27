import "server-only";
import mammoth from "mammoth";
import { splitTextToItems, type PreviewItem, type SplitMode } from "@/lib/split-items";
import type { Level } from "@/types";

// Word (.docx) → preview items. Stores nothing: the teacher edits the preview and saves through
// the normal create-material endpoint.

export const DOCX_MAX_BYTES = 5 * 1024 * 1024;
export const DOCX_ONLY = "Only Word .docx files are supported.";
export const DOCX_EMPTY = "No text found in this document.";

export class ImportError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 413 | 415,
  ) {
    super(message);
  }
}

const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // .docx is a zip; .doc starts D0 CF 11 E0, .pdf starts %PDF

/** Throws ImportError with a teacher-friendly message; returns the preview otherwise. */
export async function importDocx(
  file: { name: string; size: number; bytes: Uint8Array },
  mode: SplitMode = "sentence",
  level?: Level,
): Promise<PreviewItem[]> {
  if (!/\.docx$/i.test(file.name)) throw new ImportError(DOCX_ONLY, 415);
  if (file.size > DOCX_MAX_BYTES) throw new ImportError("The file is too big (max 5 MB).", 413);
  if (file.bytes.length < 4 || ZIP_MAGIC.some((b, i) => file.bytes[i] !== b)) throw new ImportError(DOCX_ONLY, 415);

  let text: string;
  try {
    text = (await mammoth.extractRawText({ buffer: Buffer.from(file.bytes) })).value;
  } catch {
    // A zip that isn't a Word document (or a damaged one).
    throw new ImportError(DOCX_ONLY, 415);
  }
  const items = splitTextToItems(text, mode, level);
  if (items.length === 0) throw new ImportError(DOCX_EMPTY, 400);
  return items;
}
