/**
 * The phone landings' one client for POST /api/waitlist. Pure apart from the injected transport:
 * `fetch`, the timeout, an external abort signal and the error reporter all come in as deps, so
 * the whole lifecycle is unit-testable in node.
 *
 * The request body is exactly `{ email, platform }` - the route's contract, nothing more.
 */
import { EMAIL_RE, FETCH_TIMEOUT_MS, waitlistErrorMessage, type PlatformKey, type WaitlistErrorLabels } from "@/components/waitlist-modal/waitlistUtils";

export interface WaitlistInput {
  email: string;
  platform: PlatformKey;
}

/** The route's stable codes, plus the two the client itself can produce. */
export type WaitlistErrorCode = "rate_limited" | "invalid_email" | "invalid_platform" | "store_unavailable" | "timeout" | "generic";

export type WaitlistResult = { kind: "invalid" } | { kind: "joined" } | { kind: "duplicate" } | { kind: "aborted" } | { kind: "error"; code: WaitlistErrorCode };

export interface WaitlistDeps {
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
  timeoutMs?: number;
  /** The caller's abort (unmount, platform switch): resolves `aborted`, never reported. */
  signal?: AbortSignal;
  /** Called once for a failure worth knowing about (non-2xx, transport error). Never for timeout or abort. */
  report?: (err: unknown) => void;
}

const KNOWN_CODES = new Set(["rate_limited", "invalid_email", "invalid_platform", "store_unavailable"]);

function codeFor(status: number, code: unknown): WaitlistErrorCode {
  if (typeof code === "string" && KNOWN_CODES.has(code)) return code as WaitlistErrorCode;
  if (status === 429) return "rate_limited";
  if (status === 503) return "store_unavailable";
  return "generic";
}

/** True when `email` (trimmed) is shaped like an address the route will accept. */
export function isWaitlistEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export async function submitWaitlist(input: WaitlistInput, deps: WaitlistDeps = {}): Promise<WaitlistResult> {
  const email = input.email.trim();
  if (!EMAIL_RE.test(email)) return { kind: "invalid" };
  if (deps.signal?.aborted) return { kind: "aborted" };

  const doFetch = deps.fetch ?? ((url: string, init: RequestInit) => fetch(url, init));
  const controller = new AbortController();
  let why: "timeout" | "caller" | null = null;
  // A transport that ignores the signal must still lose the race, so the abort rejects on its own.
  const aborted = new Promise<never>((_, reject) => {
    controller.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  });
  aborted.catch(() => {});
  const stop = (reason: "timeout" | "caller") => {
    why ??= reason;
    controller.abort();
  };
  const onCallerAbort = () => stop("caller");
  deps.signal?.addEventListener("abort", onCallerAbort, { once: true });
  const timer = setTimeout(() => stop("timeout"), deps.timeoutMs ?? FETCH_TIMEOUT_MS);

  try {
    const res = await Promise.race([
      doFetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform: input.platform }),
        signal: controller.signal,
      }),
      aborted,
    ]);
    const data = (await Promise.race([res.json().catch(() => ({})), aborted])) as { code?: unknown; duplicate?: unknown };
    if (!res.ok) {
      const code = codeFor(res.status, data.code);
      deps.report?.(new Error(`waitlist POST failed (status=${res.status}, code=${typeof data.code === "string" ? data.code : "none"})`));
      return { kind: "error", code };
    }
    return { kind: data.duplicate ? "duplicate" : "joined" };
  } catch (err) {
    if (why === "caller") return { kind: "aborted" };
    if (why === "timeout") return { kind: "error", code: "timeout" };
    deps.report?.(err);
    return { kind: "error", code: "generic" };
  } finally {
    clearTimeout(timer);
    deps.signal?.removeEventListener("abort", onCallerAbort);
  }
}

/** The translated sentence for a waitlist error code (the route's own prose never reaches the UI). */
export function waitlistErrorText(code: WaitlistErrorCode | "invalid", labels: WaitlistErrorLabels & { errorTimeout: string }): string {
  if (code === "invalid") return labels.invalidEmail;
  if (code === "timeout") return labels.errorTimeout;
  return waitlistErrorMessage(0, code, labels);
}
