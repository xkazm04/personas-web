export const FETCH_TIMEOUT_MS = 15_000;
export const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;

export type PlatformKey = "windows" | "macos" | "linux";
export type WaitlistStatus = "idle" | "loading" | "success" | "duplicate" | "error";
export type ShareState = "idle" | "copied" | "manual";

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
