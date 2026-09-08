"use client";

import { useEffect, useRef } from "react";

/** Options for {@link useDialogFocusTrap}. Every default reproduces the
 *  original event-detail-drawer behaviour exactly, so existing call sites can
 *  omit the argument entirely. */
export interface DialogFocusTrapOptions {
  /**
   * Selector, resolved inside the panel, for the control to focus on open.
   * Defaults to the drawer convention `[data-drawer-close]`; the tour cards
   * pass `[data-tour-focus]` because their primary control is not a close
   * button.
   */
  initialFocusSelector?: string;
  /**
   * Whether the trap handles Escape itself. Default `true`. Set `false` where
   * an owner already handles Escape globally (the tour's `useTourKeyboard`) —
   * both listeners sit on `window` in the bubble phase, so `stopPropagation()`
   * would not stop the other one from firing, and the exit would run twice.
   */
  escape?: boolean;
  /**
   * Selector tried on close when the element that opened the dialog has since
   * unmounted — checked before the page-heading fallback. The tour uses it to
   * hand focus back to the (re-mounted, therefore brand-new) launcher button.
   */
  restoreFocusSelector?: string;
  /**
   * When `true`, skip focus restoration if focus has already been claimed by
   * something outside the panel. Off by default because the drawer wants an
   * unconditional restore; the tour needs it, because its cards hand over to
   * one another (intro → caption) while the outgoing card is still playing its
   * exit animation, and an unconditional restore would yank focus back out of
   * the card that just took it.
   */
  deferToMovedFocus?: boolean;
}

const FOCUSABLE =
  'a, button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal a11y for a dialog panel: traps Tab focus inside it, closes on Escape,
 * and restores focus to the triggering element on close (falling back to a
 * caller-supplied selector, then the page heading, if that node was unmounted
 * while the dialog was open). Returns the ref to attach to the panel.
 *
 * Promoted out of `src/components/dashboard/event-detail-drawer/` — it is the
 * repo's single focus trap and the tour's three `role="dialog"` cards use this
 * one rather than growing a second implementation. The behaviour with no
 * options is byte-for-byte what the event detail drawer had.
 */
export function useDialogFocusTrap(
  active: boolean,
  onClose: () => void,
  options: DialogFocusTrapOptions = {},
) {
  const {
    initialFocusSelector = "[data-drawer-close]",
    escape = true,
    restoreFocusSelector,
    deferToMovedFocus = false,
  } = options;

  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Pin onClose to a ref so an inline-arrow callback at the call site doesn't
  // re-run the effect (which would tear down the focus trap and Esc handler
  // on every parent render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  // Options are read inside the effect but must not be part of its deps: a
  // caller passing an object literal would otherwise re-arm the trap (and
  // re-run initial focus) on every render.
  const optionsRef = useRef({ initialFocusSelector, escape, restoreFocusSelector, deferToMovedFocus });
  useEffect(() => {
    optionsRef.current = { initialFocusSelector, escape, restoreFocusSelector, deferToMovedFocus };
  });

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!optionsRef.current.escape) return;
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
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

    // Focus the panel's designated control on open so Tab cycles within it.
    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        optionsRef.current.initialFocusSelector,
      );
      target?.focus();
    }, 50);

    const panelAtOpen = panelRef.current;

    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(focusTimer);
      const { restoreFocusSelector: restoreSelector, deferToMovedFocus: defer } =
        optionsRef.current;
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;

      // Something else already owns focus (a sibling dialog that took over
      // while this one was animating out) — leave it alone.
      if (defer) {
        const now = document.activeElement;
        const claimedElsewhere =
          now instanceof HTMLElement &&
          now !== document.body &&
          !(panelAtOpen && panelAtOpen.contains(now));
        if (claimedElsewhere) return;
      }

      // Guard against restoring focus to a node that was unmounted while the
      // dialog was open (e.g. a refetch dropped the triggering card, or the
      // user navigated). Without this, focus() lands on a detached node and
      // keyboard/SR users lose focus to <body> with no announcement.
      if (prev instanceof HTMLElement && document.contains(prev)) {
        prev.focus();
        return;
      }
      // The trigger is gone. Callers that know their trigger re-mounts as a
      // fresh node (the tour launcher) name it here.
      if (restoreSelector) {
        const restored = document.querySelector<HTMLElement>(restoreSelector);
        if (restored) {
          restored.focus();
          return;
        }
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
