"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

/**
 * Shared logic for the mobile nav panel — open/close state, Escape key,
 * focus trap within the panel, body scroll lock, and route-change auto-close.
 */
export function useMobileMenu(panelRef: RefObject<HTMLDivElement | null>) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // Close on route change
  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  // Body scroll lock + key handling
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close, panelRef]);

  // Auto-focus first link when opened
  useEffect(() => {
    if (open && panelRef.current) {
      const first = panelRef.current.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [open, panelRef]);

  return { open, setOpen, close };
}
