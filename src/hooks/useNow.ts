"use client";

import { useEffect, useState } from "react";

/**
 * A wall-clock reading that refreshes every `intervalMs`. Render code may not
 * call `Date.now()` itself (impure), so time-windowed projections take this.
 * The interval stops while the tab is hidden and re-reads on return.
 */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, intervalMs);
    const onVisible = () => {
      if (!document.hidden) setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
  return now;
}
