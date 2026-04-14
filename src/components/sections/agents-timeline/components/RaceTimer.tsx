"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";

export default function RaceTimer({
  isRunning,
  durationMs,
  label,
  color,
}: {
  isRunning: boolean;
  durationMs: number;
  label: string;
  color: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      queueMicrotask(() => setElapsed(0));
      startRef.current = null;
      return;
    }

    startRef.current = performance.now();
    const tick = () => {
      if (!startRef.current) return;
      const now = performance.now();
      const diff = Math.min(now - startRef.current, durationMs);
      setElapsed(diff);
      if (diff < durationMs) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, durationMs]);

  const seconds = (elapsed / 1000).toFixed(1);

  return (
    <div className="flex items-center gap-1.5">
      <Timer className={`h-3 w-3 ${color}`} />
      <span className={`text-base font-mono tabular-nums ${color}`}>
        {label}: {seconds}s
      </span>
    </div>
  );
}
