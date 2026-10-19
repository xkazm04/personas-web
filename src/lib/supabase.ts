import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Per-request bound for every Supabase call. supabase-js sets no timeout of its
 * own, and postgrest-js retries idempotent reads, so without this a hung
 * upstream holds an API route or a dashboard read open indefinitely.
 */
export const SUPABASE_FETCH_TIMEOUT_MS = 10_000;

/**
 * A `fetch` that aborts after `ms`, while still honouring the caller's own
 * signal (postgrest's `.abortSignal()`). Built on a plain AbortController so it
 * runs in browsers without `AbortSignal.any`. Shared by the browser/anon client
 * here and the server-only admin client.
 */
export function timedFetch(ms: number, base: typeof fetch = fetch): typeof fetch {
  return (input, init) => {
    const controller = new AbortController();
    const outer = init?.signal;
    const onAbort = () => controller.abort(outer?.reason);
    if (outer?.aborted) onAbort();
    else outer?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(
      () => controller.abort(new DOMException(`Supabase request exceeded ${ms} ms`, "TimeoutError")),
      ms,
    );
    return base(input, { ...init, signal: controller.signal }).finally(() => {
      clearTimeout(timer);
      outer?.removeEventListener("abort", onAbort);
    });
  };
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars not configured");
  }
  _client = createClient(url, key, {
    global: { fetch: timedFetch(SUPABASE_FETCH_TIMEOUT_MS) },
  });
  return _client;
}
