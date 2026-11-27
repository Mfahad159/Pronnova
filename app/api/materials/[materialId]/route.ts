import { cleanMaterial, hasErrors, validateMaterial, type MaterialInput } from "@/lib/materials";
import type { Level } from "@/types";
import { isUuid } from "@/server/db/queries/curriculum";
import { getMaterial, updateMaterial } from "@/server/db/queries/materials";
import { errorResponse, fail, json, readJson } from "@/server/http";

const NOT_FOUND = "Material not found.";

/** GET /api/materials/[materialId] → { material: { …summary, items: [{ id, position, text, itemType }], assignments: [{ id, dueDate, targets }] } } */
export async function GET(_request: Request, ctx: RouteContext<"/api/materials/[materialId]">) {
  const { materialId } = await ctx.params;
  if (!isUuid(materialId)) return fail(404, NOT_FOUND);
  try {
    const material = await getMaterial(materialId);
    return material ? json({ material }) : fail(404, NOT_FOUND);
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * PATCH /api/materials/[materialId] { title?, level?, instructions?, items? } → { material, warnings }
 * · 404 · 422 { error, fieldErrors, warnings } · 409 when items change but students have attempted
 * it ("This material has student attempts. Use Duplicate & edit."). Title, level and instructions
 * stay editable on a locked material. Sending the same items unchanged is not a change.
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/materials/[materialId]">) {
  const { materialId } = await ctx.params;
  if (!isUuid(materialId)) return fail(404, NOT_FOUND);
  const body = await readJson<Partial<MaterialInput>>(request);
  if (!body) return fail(422, "Send the fields to change as JSON.");
  if (body.items !== undefined && !Array.isArray(body.items)) return fail(422, "Items must be a list.", { fieldErrors: { items: "Items must be a list." } });

  try {
    const current = await getMaterial(materialId);
    if (!current) return fail(404, NOT_FOUND);
    const currentItems = current.items.map((i) => i.text);
    const m = cleanMaterial({
      title: body.title ?? current.title,
      level: body.level ?? current.level,
      instructions: body.instructions ?? current.instructions ?? "",
      items: body.items ?? currentItems,
    });
    const itemsChanged = body.items !== undefined && JSON.stringify(m.items) !== JSON.stringify(currentItems);
    if (itemsChanged && current.locked) return fail(409, "This material has student attempts. Use Duplicate & edit.");

    const { errors, warnings } = validateMaterial(m);
    if (hasErrors(errors)) return fail(422, "Please fix the highlighted fields.", { fieldErrors: errors, warnings });

    // The DB function re-checks the lock (PN409) in case an attempt arrived in between.
    await updateMaterial(materialId, {
      title: m.title,
      level: m.level as Level,
      instructions: m.instructions,
      items: itemsChanged ? m.items : null,
    });
    return json({ material: await getMaterial(materialId), warnings });
  } catch (err) {
    return errorResponse(err);
  }
}
