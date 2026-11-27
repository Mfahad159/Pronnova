import { connection } from "next/server";
import { cleanClassName, validateClassName } from "@/lib/roster";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { createClass, listClasses } from "@/server/db/queries/roster";
import { errorResponse, fail, json, readJson } from "@/server/http";

const DUPLICATE = "A class with this name already exists.";

/** GET /api/classes → { classes: [{ id, name, studentCount, createdAt }] } (also feeds the "Who are you?" picker). */
export async function GET() {
  // Request-time data: tell Next not to prerender this GET (outside try, so the signal isn't swallowed).
  await connection();
  try {
    return json({ classes: await listClasses() });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/classes { name } → 201 { class } · 422 { error, fieldErrors } · 409 duplicate name. */
export async function POST(request: Request) {
  const body = await readJson<{ name?: unknown }>(request);
  const name = cleanClassName(body?.name);
  const problem = validateClassName(name);
  if (problem) return fail(422, problem, { fieldErrors: { name: problem } });
  try {
    const created = await createClass(name, (await getCurrentTeacher()).id);
    return json({ class: created }, 201);
  } catch (err) {
    return errorResponse(err, { unique: DUPLICATE });
  }
}
