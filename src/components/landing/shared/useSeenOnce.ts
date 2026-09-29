"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True from the first moment `ref` is `threshold` in view in a foregrounded
 * tab, and true forever after. For one-shot reveals (a lid lifting, layers
 * separating): they play when the visitor can actually see them, never for an
 * element that is off-screen or in a hidden tab. Starts false on the server and
 * on the hydrating render; the flip happens in the observer callback.
 */
export function useSeenOnce<T extends Element>(ref: RefObject<T | null>, threshold = 0.5): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (seen || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!document.hidden && entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, ref, threshold]);
  return seen;
}
