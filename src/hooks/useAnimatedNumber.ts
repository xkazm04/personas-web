"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function useAnimatedNumber(target: number, duration = 600): number {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef({ value: target, time: 0 });

  useEffect(() => {
    const from = current;
    if (from === target) return;
    if (reduced) {
      setCurrent(target);
      return;
    }

    startRef.current = { value: from, time: performance.now() };

    const animate = (now: number) => {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const value = startRef.current.value + (target - startRef.current.value) * eased;

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, reduced]);

  return current;
}
