import { levels } from "@/lib/materials";
import type { Level } from "@/types";
import { fail, json } from "@/server/http";
import { DOCX_MAX_BYTES, DOCX_ONLY, ImportError, importDocx } from "@/server/services/docx-import";

/**
 * POST /api/materials/import (multipart form: file = one .docx ≤ 5 MB, mode?, level?)
 * → { items: [{ text, words, tooLong, warnings }] }. Preview only — nothing is stored.
 * 415 "Only Word .docx files are supported." · 400 "No text found in this document." · 413 too big.
 */
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > DOCX_MAX_BYTES + 64 * 1024) return fail(413, "The file is too big (max 5 MB).");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(415, DOCX_ONLY);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail(415, DOCX_ONLY);
  const mode = form.get("mode") === "line" ? "line" : "sentence";
  const levelRaw = String(form.get("level") ?? "");
  const level = levels.includes(levelRaw as Level) ? (levelRaw as Level) : undefined;

  try {
    const items = await importDocx(
      { name: file.name, size: file.size, bytes: new Uint8Array(await file.arrayBuffer()) },
      mode,
      level,
    );
    return json({ items });
  } catch (err) {
    if (err instanceof ImportError) return fail(err.status, err.message);
    console.error("docx import failed", err);
    return fail(500, "We couldn't read that file. Please try again.");
  }
}
