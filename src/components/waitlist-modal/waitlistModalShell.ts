/**
 * Non-visual plumbing for `WaitlistModal`: focus save/restore + count fetch,
 * the Escape/Tab key handler with its focus trap, and the open-reset /
 * share-copy state transitions. Extracted so the modal component itself stays
 * inside the `custom-quality/max-tsx-lines` budget.
 */
import { useEffect } from "react";
import type { ShareState, WaitlistStatus } from "./waitlistUtils";

export function useWaitlistFocusAndKeys({ open, onClose, fetchCount, modalRef, previousFocusRef }: { open: boolean; onClose: () => void; fetchCount: (signal: AbortSignal) => Promise<void>; modalRef: React.RefObject<HTMLDivElement | null>; previousFocusRef: React.RefObject<HTMLElement | null> }) {
  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement;
    const controller = new AbortController();
    queueMicrotask(() => fetchCount(controller.signal));
    return () => controller.abort();
  }, [open, fetchCount, previousFocusRef]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && modalRef.current) trapFocus(event, modalRef.current);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, modalRef]);
}

function trapFocus(event: KeyboardEvent, modal: HTMLDivElement) {
  const focusable = modal.querySelectorAll<HTMLElement>('a, button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function resetModalState(setters: { setStatus: (status: WaitlistStatus) => void; setEmail: (email: string) => void; setSubmittedEmail: (email: string) => void; setEarlyBeta: (enabled: boolean) => void; setErrorMsg: (message: string) => void; setShareState: (state: ShareState) => void; setShareFallbackUrl: (url: string) => void }) {
  setters.setStatus("idle");
  setters.setEmail("");
  setters.setSubmittedEmail("");
  setters.setEarlyBeta(false);
  setters.setErrorMsg("");
  setters.setShareState("idle");
  setters.setShareFallbackUrl("");
}

/**
 * Show the "copied" bubble and retire it after 2s.
 *
 * The timer handle is parked in `timerRef` so the caller can cancel it when the
 * modal closes or unmounts — an uncancelled timeout would call setState on a
 * gone component (and, on a fast close/re-open, wipe a fresh "copied" state).
 */
export function markCopied(
  setShareState: (state: ShareState | ((state: ShareState) => ShareState)) => void,
  setShareFallbackUrl: (url: string) => void,
  timerRef: { current: ReturnType<typeof setTimeout> | null },
) {
  setShareState("copied");
  setShareFallbackUrl("");
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    setShareState((state) => (state === "copied" ? "idle" : state));
  }, COPIED_BUBBLE_MS);
}

const COPIED_BUBBLE_MS = 2000;
