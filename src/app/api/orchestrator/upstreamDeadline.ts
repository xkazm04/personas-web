/**
 * A deadline for one call to the orchestrator.
 *
 * Every relay used to pass only `req.signal`, so a hung orchestrator held the
 * request (and the server function) open until the platform killed it. The
 * deadline aborts the upstream fetch after `UPSTREAM_TIMEOUT_MS`, and
 * `timedOut()` tells that abort apart from the client's own, so the route can
 * answer a typed 504 instead of the 499 a disconnect gets.
 *
 * A REST relay keeps the deadline until the body is read. A stream relay
 * calls `clear()` once the upstream headers arrive, so a long-lived stream is
 * never cut by it.
 */

/**
 * Below the browser's own 15 s abort in `orchestratorFetch` (src/lib/api.ts),
 * so the client sees the typed 504 rather than its own timeout.
 */
export const UPSTREAM_TIMEOUT_MS = 12_000;

export interface UpstreamDeadline {
  /** Pass to fetch: aborts on the client's disconnect or at the deadline. */
  signal: AbortSignal;
  /** True when the deadline, not the client, aborted the call. */
  timedOut: () => boolean;
  /** Stops the deadline; the client's signal still applies. */
  clear: () => void;
}

export function upstreamDeadline(
  clientSignal: AbortSignal,
  ms: number = UPSTREAM_TIMEOUT_MS,
): UpstreamDeadline {
  const deadline = new AbortController();
  let fired = false;
  const timer = setTimeout(() => {
    fired = true;
    deadline.abort(new DOMException("Upstream timed out", "TimeoutError"));
  }, ms);
  return {
    signal: AbortSignal.any([clientSignal, deadline.signal]),
    timedOut: () => fired,
    clear: () => clearTimeout(timer),
  };
}

/** The 504 every relay answers when the deadline fires. */
export function upstreamTimeoutResponse(): Response {
  return Response.json({ error: "upstream_timeout" }, { status: 504 });
}
