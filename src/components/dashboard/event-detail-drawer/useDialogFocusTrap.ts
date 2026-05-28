"use client";

import { useEffect, useRef } from "react";

/**
 * Modal a11y for the event detail drawer, mirroring AgentDetailDrawer: traps
 * Tab focus inside the panel, closes on Escape, and restores focus to the
 * triggering element on close (falling back to the page heading if that node
 * was unmounted while the drawer was open). Returns the ref to attach to the
 * dialog panel.
 */
export function useDialogFocusTrap(active: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Pin onClose to a ref so an inline-arrow callback at the call site doesn't
  // re-run the effect (which would tear down the focus trap and Esc handler
  // on every parent render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handler);

    // Focus the close button on open so Tab cycles within the panel.
    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>("[data-drawer-close]");
      target?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(focusTimer);
      // Guard against restoring focus to a node that was unmounted while the
      // drawer was open (e.g. a refetch dropped the triggering card, or the
      // user navigated). Without this, focus() lands on a detached node and
      // keyboard/SR users lose focus to <body> with no announcement.
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev instanceof HTMLElement && document.contains(prev)) {
        prev.focus();
        return;
      }
      // Fallback: focus the page heading so a SR announces "<page name>" and
      // keyboard users land somewhere sensible. Headings aren't focusable by
      // default — set tabIndex temporarily so focus() works.
      const fallback = document.querySelector<HTMLElement>("main h1, h1");
      if (fallback) {
        const hadTabIndex = fallback.hasAttribute("tabindex");
        if (!hadTabIndex) fallback.tabIndex = -1;
        fallback.focus({ preventScroll: true });
        if (!hadTabIndex) {
          fallback.addEventListener(
            "blur",
            () => fallback.removeAttribute("tabindex"),
            { once: true },
          );
        }
      }
    };
  }, [active]);

  return panelRef;
}
