"use client";

import { useEffect, useRef, useState } from "react";

/** The `stage` variant's media query (globals.css, styles/stage.css). */
const STAGE_QUERY = "(min-width: 64rem) and (min-height: 37.5rem)";

export type StageBox = { w: number; h: number };

/**
 * The element's content box while the desktop stage layout is on, else null.
 *
 * A stage slot hands a panel whatever height is left after the intro, so an
 * SVG drawn in a fixed viewBox would be letterboxed and its type scaled with
 * it (a 600x320 tree in a 790x210 box renders 10px labels). Drawing in the
 * box's own pixels (`viewBox = 0 0 w h`) keeps the type at its design size
 * and spreads the geometry over the space the stage gives. Below the stage
 * the caller keeps its fixed design viewBox, so the mobile layout is unchanged.
 */
export function useStageBox<T extends Element>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<StageBox | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const stage = window.matchMedia(STAGE_QUERY);
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      const next = stage.matches && w > 0 && h > 0 ? { w, h } : null;
      setBox((prev) =>
        prev && next && prev.w === next.w && prev.h === next.h ? prev : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, box] as const;
}
