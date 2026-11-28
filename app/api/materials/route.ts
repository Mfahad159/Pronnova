import { revalidateTag } from "next/cache";
import { CURRICULUM_TAG } from "@/server/db/queries/learning";
import { connection } from "next/server";
import { cleanAssignment, validateAssignment, type AssignmentInput } from "@/lib/assignments";
import { cleanMaterial, hasErrors, todayInPakistan, validateMaterial, type MaterialInput } from "@/lib/materials";
import type { Level } from "@/types";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { createMaterial, createMaterialAndAssign, listMaterials } from "@/server/db/queries/materials";
import { errorResponse, fail, json, readJson } from "@/server/http";

/** GET /api/materials → { materials: [{ id, title, level, instructions, itemCount, assignmentCount, locked, createdAt, updatedAt }] } */
export async function GET() {
  // Request-time data: tell Next not to prerender this GET (outside try, so the signal isn't swallowed).
  await connection();
  try {
    return json({ materials: await listMaterials() });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * POST /api/materials { title, level, instructions?, items: string[], assign?: { dueDate, classIds?, studentIds? } }
 * → 201 { id, warnings } · 422 { error, fieldErrors, warnings }.
 * Material + items are saved in one transaction; with `assign`, the assignment is in the SAME
 * transaction (UC-10 "save and assign"). Warnings (level fit, < 3 items) never block saving.
 */
export async function POST(request: Request) {
  const body = await readJson<Partial<MaterialInput> & { assign?: Partial<Omit<AssignmentInput, "materialId">> | null }>(request);
  if (!body) return fail(422, "Send the material as JSON.");
  const m = cleanMaterial(body);
  const { errors, warnings } = validateMaterial(m);

  const assign = body.assign ? cleanAssignment({ ...body.assign, materialId: "new" }) : null;
  const assignErrors = assign ? validateAssignment(assign, todayInPakistan()) : {};
  if (hasErrors(errors) || hasErrors(assignErrors)) {
    return fail(422, "Please fix the highlighted fields.", {
      fieldErrors: { ...errors, ...(hasErrors(assignErrors) ? { assign: assignErrors } : {}) },
      warnings,
    });
  }

  try {
    const teacher = await getCurrentTeacher();
    const write = { title: m.title, level: m.level as Level, instructions: m.instructions, items: m.items };
    const id = assign ? await createMaterialAndAssign(teacher.id, write, assign) : await createMaterial(teacher.id, write);
    revalidateTag(CURRICULUM_TAG, { expire: 0 }); // students see the change on their next request
    return json({ id, warnings }, 201);
  } catch (err) {
    return errorResponse(err, { unique: "Each class or student can only be picked once." });
  }
}
