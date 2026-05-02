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

    const measure = () => {
      const elements = el.querySelectorAll<HTMLElement>(selector);
      let max = 0;
      elements.forEach((e) => {
        max = Math.max(max, e.scrollHeight);
      });
      if (max > 0) setMaxHeight(max);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.querySelectorAll<HTMLElement>(selector).forEach((e) => observer.observe(e));

    return () => observer.disconnect();
  }, [containerRef, selector]);

  return maxHeight;
}
