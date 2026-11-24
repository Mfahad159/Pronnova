"use server";

import { deadlineToIso, hasErrors, todayInPakistan, validateMaterial, type MaterialErrors, type MaterialInput } from "@/lib/materials";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { isUuid } from "@/server/db/queries/curriculum";
import { createMaterial } from "@/server/db/queries/materials";
import type { Level } from "@/types";

export type SaveMaterialResult =
  | { ok: true; lessonId: string; assigned: boolean }
  | { ok: false; errors: MaterialErrors; message: string };

/**
 * UC-10 Upload Practice Material. Re-validates everything on the server (the browser checks are
 * only for quick feedback), then saves lesson + items (+ class assignment) in one DB transaction.
 */
export async function saveMaterial(input: MaterialInput): Promise<SaveMaterialResult> {
  const clean: MaterialInput = {
    title: String(input.title ?? "").trim(),
    instructions: String(input.instructions ?? "").trim(),
    chapterId: String(input.chapterId ?? ""),
    level: String(input.level ?? ""),
    classId: String(input.classId ?? ""),
    deadline: String(input.deadline ?? ""),
    items: Array.isArray(input.items)
      ? input.items.map((i) => ({ text: String(i?.text ?? "").replace(/\s+/g, " ").trim(), itemType: i?.itemType })).filter((i) => i.text)
      : [],
  };

  const errors = validateMaterial(clean, todayInPakistan());
  if (clean.chapterId && !isUuid(clean.chapterId)) errors.chapterId = "Choose a chapter.";
  if (clean.classId && !isUuid(clean.classId)) errors.classId = "Choose a class.";
  if (hasErrors(errors)) return { ok: false, errors, message: "Please fix the highlighted fields." };

  try {
    const teacher = await getCurrentTeacher();
    const lessonId = await createMaterial({
      teacherId: teacher.id,
      chapterId: clean.chapterId,
      level: clean.level as Level,
      title: clean.title,
      instructions: clean.instructions,
      items: clean.items,
      classId: clean.classId || null,
      deadline: clean.deadline ? deadlineToIso(clean.deadline) : null,
    });
    return { ok: true, lessonId, assigned: Boolean(clean.classId) };
  } catch (err) {
    console.error("saveMaterial failed", err);
    const msg = err instanceof Error && /class does not belong/.test(err.message)
      ? "You can only assign material to your own classes."
      : "We couldn't save the material. Nothing was saved — please try again.";
    return { ok: false, errors: {}, message: msg };
  }
}
