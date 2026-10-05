"use client";

import { useEffect, useState, type RefObject } from "react";

/** The field's real size in CSS px. Night Shift lays its scenes out to it
 *  directly (no fixed design stage), so text stays at its true size. */
export function useFieldSize(ref: RefObject<HTMLElement | null>): { w: number; h: number } {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}
