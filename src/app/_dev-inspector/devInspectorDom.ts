/**
 * Browser plumbing for {@link DevInspector}: clipboard copy with a legacy
 * fallback, the SSR-safe client flag, and the typing-target guard for its
 * keyboard shortcuts. Dev-only; never ships to production.
 */

import { useSyncExternalStore } from "react";

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// SSR-safe "am I on the client" detection without a setState-in-effect
// mounted flag (React 19 purity rules): server snapshot is false, client
// snapshot is true, and nothing ever notifies — so no re-render churn.
const emptySubscribe = () => () => {};
export const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}
