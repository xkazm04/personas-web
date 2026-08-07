export const FETCH_TIMEOUT_MS = 15_000;
export const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;

export type PlatformKey = "windows" | "macos" | "linux";
export type WaitlistStatus = "idle" | "loading" | "success" | "duplicate" | "error";
export type ShareState = "idle" | "copied" | "manual";

/**
 * Best-effort visitor platform, used to pre-select the waitlist platform so a
 * Mac visitor is not offered the Windows list.
 *
 * Call from an event handler or effect — never during render: `navigator` is
 * undefined on the server, so a render-time read would desync hydration (and
 * counts as an impure render call under the React 19 rules).
 */
export function detectPlatformKey(): PlatformKey {
  if (typeof navigator === "undefined") return "windows";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const raw = (nav.userAgentData?.platform || nav.platform || nav.userAgent || "").toLowerCase();
  // macOS first: an Android UA also contains "linux".
  if (/mac|iphone|ipad|ipod/.test(raw)) return "macos";
  if (/linux|android|cros/.test(raw)) return "linux";
  return "windows";
}

export interface WaitlistErrorLabels {
  invalidEmail: string;
  errorRateLimited: string;
  errorInvalidPlatform: string;
  errorRetryable: string;
  errorGeneric: string;
}

/**
 * Turn a failed `/api/waitlist` response into a *localized* message.
 *
 * The route's prose is English-only and describes server internals, so it must
 * never reach the UI. It instead ships a stable `code` (plus the HTTP status as
 * a fallback for responses that predate the codes, e.g. `parseJsonBody`), and
 * the client picks the translated sentence.
 */
export function waitlistErrorMessage(status: number, code: unknown, labels: WaitlistErrorLabels): string {
  switch (code) {
    case "rate_limited":
      return labels.errorRateLimited;
    case "invalid_email":
      return labels.invalidEmail;
    case "invalid_platform":
      return labels.errorInvalidPlatform;
    case "store_unavailable":
      return labels.errorRetryable;
  }
  if (status === 429) return labels.errorRateLimited;
  if (status === 503) return labels.errorRetryable;
  return labels.errorGeneric;
}

export function legacyCopyToClipboard(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
