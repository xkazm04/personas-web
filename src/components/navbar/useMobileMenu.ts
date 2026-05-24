"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";

/**
 * Shared logic for the mobile nav panel — open/close state, Escape key,
 * focus trap within the panel, body scroll lock, route-change auto-close,
 * and focus restoration to the hamburger trigger when the panel closes.
 *
 * The panel renders with role="dialog" aria-modal="true", so WAI-ARIA
 * Authoring Practices require focus return on close — without it
 * keyboard / screen-reader users land on document.body and the next Tab
 * cycles from the start of the page rather than continuing where they were.
 */
export function useMobileMenu(panelRef: RefObject<HTMLDivElement | null>) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Snapshot the element that owned focus when the panel opened (typically
  // the hamburger button). Restored on close if it's still in the DOM.
  const triggerRef = useRef<HTMLElement | null>(null);
  // Record *why* the panel is closing. Restoring focus to the hamburger
  // is correct for Escape / backdrop-tap (the user closed it themselves
  // and expects to keep navigating from where they were), but wrong for
  // route navigation: the new page's content is what wants focus, not
  // the navbar trigger that's already in the visited row of links. So
  // we skip the restoration on route-driven closes.
  const closeReasonRef = useRef<"user" | "route" | null>(null);

  const close = useCallback(() => {
    closeReasonRef.current = "user";
    setOpen(false);
  }, []);

  // Close on route change. The pathname effect runs once on mount too;
  // gate on `open` so we don't poison closeReasonRef on the initial pass.
  useEffect(() => {
    queueMicrotask(() => {
      setOpen((prev) => {
        if (prev) closeReasonRef.current = "route";
        return false;
      });
    });
  }, [pathname]);

  // Body scroll lock + key handling
  useEffect(() => {
    if (!open) return;
    lockBodyScroll();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    document.addEventListener("keydown", handleKey);
    return () => {
      unlockBodyScroll();
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close, panelRef]);

  // Capture trigger on open, auto-focus first link, and restore focus on close.
  useEffect(() => {
    if (open) {
      // Snapshot whatever owned focus before the panel was rendered —
      // almost always the hamburger button that toggled `open`.
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        triggerRef.current = active;
      }
      if (panelRef.current) {
        const first = panelRef.current.querySelector<HTMLElement>("a, button");
        first?.focus();
      }
      return;
    }

    // Closed: restore focus to the trigger if it's still in the DOM
    // AND the close wasn't triggered by route navigation. Returning
    // focus to the hamburger after a route change yanks the keyboard /
    // screen-reader cursor away from the freshly-mounted page; the new
    // route's first focusable element (skip-link, hero heading, etc.)
    // is the right anchor in that case. For Escape / backdrop / X-tap
    // closes the user is staying on the same page, so the trigger
    // restoration matches WAI-ARIA expectations.
    const trigger = triggerRef.current;
    const reason = closeReasonRef.current;
    triggerRef.current = null;
    closeReasonRef.current = null;
    if (reason !== "route" && trigger && document.contains(trigger)) {
      trigger.focus();
    }
  }, [open, panelRef]);

  return { open, setOpen, close };
}
