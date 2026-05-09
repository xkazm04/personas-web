"use client";

import { useEffect, useRef, useState } from "react";

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function useAnimatedNumber(target: number, duration = 600): number {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef({ value: target, time: 0 });
  // Mirrors the most-recently-rendered value synchronously. React state
  // commits asynchronously, so reading `current` from the effect closure
  // can lag behind the in-flight setCurrent call when `target` changes
  // rapidly — producing visible jumps as the next animation starts from a
  // stale value. The ref is updated inside `animate` so the next effect
  // always picks up where the last frame actually left off.
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    if (from === target) return;

    startRef.current = { value: from, time: performance.now() };

    const animate = (now: number) => {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const value = startRef.current.value + (target - startRef.current.value) * eased;

      currentRef.current = value;
      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}
