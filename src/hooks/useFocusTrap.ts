"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0);
}

interface Options {
  /** Whether the trap is engaged (e.g. the dialog's `open` flag). */
  active: boolean;
  /** Ref to the element that contains all trappable focus targets. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Ref to the element that should receive focus on open (the dialog's
   * primary action). Falls back to the first focusable element when this
   * is absent, missing, or disabled.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Modal focus management shared by ConfirmDialog and BatchReviewModal: on
 * open, moves focus to the primary action (or first focusable element);
 * cycles Tab / Shift+Tab within the panel so keyboard and screen-reader
 * users cannot Tab into the page behind the dialog; restores focus to the
 * element that opened the dialog on close.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
}: Options): void {
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // Remember what to restore focus to once the dialog closes.
    restoreRef.current = document.activeElement as HTMLElement | null;
    const restore = restoreRef.current;

    // Move focus to the primary action, falling back to the first focusable.
    const initial = initialFocusRef?.current;
    const target =
      initial && !initial.hasAttribute("disabled")
        ? initial
        : getFocusable(container)[0];
    target?.focus();

    function onKeyDown(e: KeyboardEvent) {
      const node = containerRef.current;
      if (e.key !== "Tab" || !node) return;
      const items = getFocusable(node);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !node.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !node.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    }

    // Listen at the document level: keydown events dispatch on the focused
    // element, so a container-scoped listener never fires once focus has
    // already escaped the panel — exactly the case the recovery branches in
    // onKeyDown are written to handle. The `node.contains(activeEl)` checks
    // keep this a no-op while focus is legitimately inside the trap.
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus to the triggering element on close.
      restore?.focus?.();
    };
  }, [active, containerRef, initialFocusRef]);
}
