import { cleanClassName, validateClassName } from "@/lib/roster";
import { isUuid } from "@/server/db/queries/curriculum";
import { getClass, renameClass } from "@/server/db/queries/roster";
import { errorResponse, fail, json, readJson } from "@/server/http";

/** PATCH /api/classes/[classId] { name } → { class } · 404 · 422 · 409 duplicate name. (No delete in FYP-1.) */
export async function PATCH(request: Request, ctx: RouteContext<"/api/classes/[classId]">) {
  const { classId } = await ctx.params;
  if (!isUuid(classId)) return fail(404, "Class not found.");
  const body = await readJson<{ name?: unknown }>(request);
  const name = cleanClassName(body?.name);
  const problem = validateClassName(name);
  if (problem) return fail(422, problem, { fieldErrors: { name: problem } });
  try {
    if (!(await renameClass(classId, name))) return fail(404, "Class not found.");
    return json({ class: await getClass(classId) });
  } catch (err) {
    return errorResponse(err, { unique: "A class with this name already exists." });
  }
}
