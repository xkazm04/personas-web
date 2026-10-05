"use client";

import { useEffect, useState, type RefObject } from "react";

export interface Fit {
  scale: number;
  x: number;
  y: number;
}

/**
 * Scales a fixed design stage to fit its frame, centred across and resting on
 * the bottom edge (the street stays put; spare height becomes sky).
 */
export function useFitStage(ref: RefObject<HTMLElement | null>, dw: number, dh: number): Fit {
  const [fit, setFit] = useState<Fit>({ scale: 0, x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scale = Math.min(width / dw, height / dh);
      setFit({ scale, x: (width - dw * scale) / 2, y: height - dh * scale });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, dw, dh]);
  return fit;
}
