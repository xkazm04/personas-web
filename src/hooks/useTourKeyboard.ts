"use client";

import { useEffect } from "react";

/** Keyboard control for an active tour: Escape exits, arrow keys step. */
export function useTourKeyboard(
  active: boolean,
  handlers: { exit: () => void; next: () => void; prev: () => void },
): void {
  const { exit, next, prev } = handlers;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit, next, prev]);
}
