import { levels } from "@/lib/materials";
import { splitTextToItems, type SplitMode } from "@/lib/split-items";
import type { Level } from "@/types";
import { fail, json, readJson } from "@/server/http";

const MAX_TEXT = 50_000;

/**
 * POST /api/materials/split { text, mode?: "sentence" | "line", level? } → { items: [{ text, words, tooLong, warnings }] }.
 * Preview only — nothing is saved. The teacher edits the list, then saves with POST /api/materials.
 */
export async function POST(request: Request) {
  const body = await readJson<{ text?: unknown; mode?: unknown; level?: unknown }>(request);
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) return fail(422, "Paste some text first.", { fieldErrors: { text: "Paste some text first." } });
  if (text.length > MAX_TEXT) return fail(413, "That's too much text at once (max 50,000 characters).");
  const mode: SplitMode = body?.mode === "line" ? "line" : "sentence";
  const level = levels.includes(body?.level as Level) ? (body?.level as Level) : undefined;
  return json({ items: splitTextToItems(text, mode, level) });
}
