"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Options {
  /** How many items to mount immediately on first render. */
  initial?: number;
  /** How many additional items to mount on each tick. */
  batch?: number;
  /** Delay between ticks (ms). */
  intervalMs?: number;
}

/**
 * Progressively reveal a list of N items so they MOUNT in small batches across
 * frames instead of all in one shot. On a heavy section this spreads the React
 * reconciliation + framer-motion init cost over ~½–1s (much less jank on load)
 * while giving a natural staggered entrance. Reduced-motion users get the whole
 * list immediately.
 *
 * Usage: `const shown = useStaggeredReveal(items.length); items.slice(0, shown).map(...)`.
 */
export function useStaggeredReveal(
  total: number,
  { initial = 4, batch = 2, intervalMs = 70 }: Options = {},
): number {
  const prefersReducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(() => Math.min(initial, total));

  useEffect(() => {
    // Reduced-motion short-circuits via the return value below — no work here.
    if (prefersReducedMotion || revealed >= total) return;
    const id = setTimeout(
      () => setRevealed((c) => Math.min(c + batch, total)),
      intervalMs,
    );
    return () => clearTimeout(id);
  }, [revealed, total, batch, intervalMs, prefersReducedMotion]);

  // Reduced-motion users get the whole list at once.
  return prefersReducedMotion ? total : revealed;
}
