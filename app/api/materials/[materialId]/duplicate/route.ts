import { revalidateTag } from "next/cache";
import { CURRICULUM_TAG } from "@/server/db/queries/learning";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { isUuid } from "@/server/db/queries/curriculum";
import { duplicateMaterial } from "@/server/db/queries/materials";
import { errorResponse, fail, json } from "@/server/http";

/** POST /api/materials/[materialId]/duplicate → 201 { id } — "<title> (copy)", same items, no assignments, unlocked · 404. */
export async function POST(_request: Request, ctx: RouteContext<"/api/materials/[materialId]/duplicate">) {
  const { materialId } = await ctx.params;
  if (!isUuid(materialId)) return fail(404, "Material not found.");
  try {
    const id = await duplicateMaterial(materialId, (await getCurrentTeacher()).id);
    revalidateTag(CURRICULUM_TAG, { expire: 0 }); // students see the change on their next request
    return json({ id }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
