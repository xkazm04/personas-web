"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface TweenOptions {
  enabled: boolean;
  durationMs?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useTweenedNumber(
  target: number,
  { enabled, durationMs = 1400 }: TweenOptions,
): number {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = enabled && !reducedMotion;
  const [value, setValue] = useState(() => (shouldAnimate ? 0 : target));

  useEffect(() => {
    if (!shouldAnimate) return;

    let raf = 0;
    const start = performance.now();

    const tick = (ts: number) => {
      const t = Math.min((ts - start) / durationMs, 1);
      setValue(target * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, shouldAnimate, target]);

  return shouldAnimate ? value : target;
}
