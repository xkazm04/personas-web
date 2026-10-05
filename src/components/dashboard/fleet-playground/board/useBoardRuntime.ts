"use client";

import { useEffect, useReducer, useState, type RefObject } from "react";
import { initSim, simReducer } from "./sim";

/** Drives the seeded simulation once per second while the tab is visible.
 *  Reduced motion keeps the data ticking (slower), only the motion goes still. */
export function useBoardSim(scale: number, still: boolean, hidden: boolean) {
  const [sim, dispatch] = useReducer(simReducer, undefined, initSim);
  useEffect(() => {
    if (hidden) return;
    const id = window.setInterval(() => dispatch({ type: "advance", dt: 1000, scale, still }), 1000);
    return () => window.clearInterval(id);
  }, [scale, still, hidden]);
  return [sim, dispatch] as const;
}

/** The element's content box, kept current by a ResizeObserver. */
export function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** A transient status line (decisions, the `N` walk). */
export function useToast() {
  const [toast, setToast] = useState<{ seq: number; text: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);
  const show = (text: string) => setToast((t) => ({ seq: (t?.seq ?? 0) + 1, text }));
  return [toast, show] as const;
}

/** True for the first ~2s: the arrival beat (tiles rise in), skipped when still. */
export function useArrival(still: boolean) {
  const [arriving, setArriving] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setArriving(false), 2200);
    return () => window.clearTimeout(id);
  }, []);
  return arriving && !still;
}
