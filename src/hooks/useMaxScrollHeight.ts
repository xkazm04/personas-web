"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Watch a hidden measurement subtree and report the max scrollHeight of
 * elements matching `selector`. Updates via ResizeObserver — so heights
 * stay correct after font-load, viewport zoom, or i18n copy changes
 * (the original "measure once on mount" pattern silently went stale on
 * any of those events).
 *
 * Pair with a hidden subtree positioned off-screen:
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   const wfHeight = useMaxScrollHeight(ref, "[data-measure-wf]");
 *
 *   <div ref={ref} aria-hidden style={{ position: "absolute", left: -9999 }}>
 *     {items.map(i => <div key={i} data-measure-wf>{render(i)}</div>)}
 *   </div>
 *
 * The hook runs only client-side; SSR returns 0.
 */
export function useMaxScrollHeight(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
): number {
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let scheduled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      const elements = el.querySelectorAll<HTMLElement>(selector);
      let max = 0;
      elements.forEach((e) => {
        max = Math.max(max, e.scrollHeight);
      });
      if (max > 0) {
        // Bail out if unchanged — breaks any parent↔child resize feedback.
        setMaxHeight((prev) => (prev === max ? prev : max));
      }
    };

    measure();

    // Defer RO-driven setState to a fresh task. Writing state synchronously
    // inside a ResizeObserver callback can trigger "ResizeObserver loop
    // completed with undelivered notifications" warnings (and oscillating
    // layouts) when the resulting height drives an ancestor of the
    // measured nodes. Coalescing through setTimeout breaks the
    // synchronous feedback path without registering as an animation.
    const observer = new ResizeObserver(() => {
      if (scheduled) return;
      scheduled = true;
      timerId = setTimeout(() => {
        scheduled = false;
        timerId = null;
        measure();
      }, 0);
    });
    observer.observe(el);
    el.querySelectorAll<HTMLElement>(selector).forEach((e) => observer.observe(e));

    return () => {
      if (timerId !== null) clearTimeout(timerId);
      observer.disconnect();
    };
  }, [containerRef, selector]);

  return maxHeight;
}
