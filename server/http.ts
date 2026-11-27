import "server-only";
import { DbError, DbNotConfiguredError } from "@/server/db/client";

// Shared JSON responses for the API routes. Error body: { error, fieldErrors?, warnings? }.

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export function fail(status: number, error: string, extra?: Record<string, unknown>) {
  return Response.json({ error, ...extra }, { status });
}

/** Read a JSON body; null when it isn't valid JSON. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as T) : null;
  } catch {
    return null;
  }
}

/** Raised for "this thing doesn't exist (for you)". */
export class NotFoundError extends Error {}

/**
 * Map known failures to HTTP. Our DB functions raise PN404 / PN409 / PN422 with a user-facing
 * message; constraint violations get a generic but clear message unless the caller passes one.
 */
export function errorResponse(err: unknown, messages: { unique?: string; foreignKey?: string } = {}) {
  if (err instanceof NotFoundError) return fail(404, err.message || "Not found.");
  if (err instanceof DbNotConfiguredError) return fail(503, err.message);
  if (err instanceof DbError) {
    switch (err.code) {
      case "PN404":
        return fail(404, err.dbMessage);
      case "PN409":
        return fail(409, err.dbMessage);
      case "PN422":
        return fail(422, err.dbMessage);
      case "23505":
        return fail(409, messages.unique ?? "That already exists.");
      case "23503":
        return fail(422, messages.foreignKey ?? "Something you picked no longer exists.");
      case "23514":
        return fail(422, "That value isn't allowed.");
    }
  }
  console.error("API error", err);
  return fail(500, "Something went wrong. Please try again.");
}
