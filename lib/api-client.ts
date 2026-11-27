// Tiny browser-side client for our JSON API. Every route answers { …data } on success and
// { error, fieldErrors?, warnings? } on failure (server/http.ts), so forms can show the server's
// message next to the right field.

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  /** Top-level message (always set when !ok). */
  error: string | null;
  fieldErrors: Record<string, unknown>;
}

export async function api<T = unknown>(url: string, init: { method?: string; json?: unknown; body?: BodyInit } = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: init.method ?? (init.json !== undefined || init.body ? "POST" : "GET"),
      headers: init.json !== undefined ? { "content-type": "application/json" } : undefined,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
      cache: "no-store",
    });
    const data = res.status === 204 ? null : ((await res.json().catch(() => null)) as (T & { error?: string; fieldErrors?: Record<string, unknown> }) | null);
    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? data : null,
      error: res.ok ? null : (data?.error ?? "Something went wrong. Please try again."),
      fieldErrors: (!res.ok && data?.fieldErrors) || {},
    };
  } catch {
    return { ok: false, status: 0, data: null, error: "No connection. Check your internet and try again.", fieldErrors: {} };
  }
}

/** A field error as a string (nested objects ignored). */
export const fieldError = (errors: Record<string, unknown>, key: string) =>
  typeof errors[key] === "string" ? (errors[key] as string) : undefined;
