import "server-only";
import { connection } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Thrown when SUPABASE_URL / SUPABASE_SECRET_KEY are missing, so pages can show a setup hint. */
export class DbNotConfiguredError extends Error {
  constructor() {
    super("Database is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local (see docs/team-guide.md).");
    this.name = "DbNotConfiguredError";
  }
}

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the SECRET key (service_role, bypasses RLS).
 * Never import this from a Client Component — `server-only` makes that a build error.
 * `connection()` marks every DB read as request-time, so pages never query at build time
 * (Cache Components: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md).
 */
export async function getDb(): Promise<SupabaseClient> {
  await connection();
  return getDbForCache();
}

/**
 * Same client WITHOUT `connection()`: only for `"use cache"` functions, which may not call
 * request-time APIs (node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md).
 */
export function getDbForCache(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new DbNotConfiguredError();
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

/** A failed DB call. `code` is the Postgres SQLSTATE (e.g. 23505 unique, PN409 from our functions). */
export class DbError extends Error {
  constructor(
    message: string,
    readonly code: string | undefined,
    /** The DB's own message (for RAISE EXCEPTION in our functions, this is user-facing text). */
    readonly dbMessage: string,
  ) {
    super(message);
    this.name = "DbError";
  }
}

/** Turns a Supabase error into a thrown DbError with context. */
export function check<T>(result: { data: T; error: { message: string; code?: string } | null }, what: string): T {
  if (result.error) throw new DbError(`DB ${what} failed: ${result.error.message}`, result.error.code, result.error.message);
  return result.data;
}
