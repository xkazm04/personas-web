"use client";

import { useEffect, useState, type RefObject } from "react";

/** An element's content-box size, kept current by a ResizeObserver. Starts at
 *  0x0 on the server and the hydrating render alike, so anything drawn from it
 *  appears on the first measured commit without a hydration mismatch. */
export function useBoxSize(ref: RefObject<Element | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}
