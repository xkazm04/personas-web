"use client";

import { useEffect } from "react";

/**
 * Keyboard control for an active tour: Escape exits, arrow keys step.
 *
 * The spotlight is click-through, so the visitor may be working in the page
 * itself (the Board walks its agents with the arrows). Arrows step the tour only
 * while focus is on the tour's own cards or nowhere in particular; Escape exits
 * from anywhere.
 */
export function useTourKeyboard(
  active: boolean,
  handlers: { exit: () => void; next: () => void; prev: () => void },
): void {
  const { exit, next, prev } = handlers;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exit();
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const target = e.target;
      const inPage = target instanceof Element && target !== document.body && !target.closest("[data-tour-card]");
      if (inPage) return;
      if (e.key === "ArrowRight") next();
      else prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit, next, prev]);
}
