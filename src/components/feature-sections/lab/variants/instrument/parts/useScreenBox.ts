"use client";

import { useEffect, useRef, useState } from "react";

export type Box = { w: number; h: number };

/** The design box every screen renders in before it is measured (server, first paint). */
export const FALLBACK_BOX: Box = { w: 640, h: 300 };

/**
 * The element's content box in CSS pixels, at every width. A scope draws in
 * its screen's own pixels (`viewBox = 0 0 w h`), so its type and stroke widths
 * stay at design size whether the stage slot is wide and short or the phone
 * column is narrow and tall. The first render uses FALLBACK_BOX on both
 * server and client, so hydration agrees; the ResizeObserver callback (not
 * the effect body) commits the measured size.
 */
export function useScreenBox<T extends Element>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<Box>(FALLBACK_BOX);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      if (w <= 0 || h <= 0) return;
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, box] as const;
}
