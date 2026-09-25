"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Hourglass } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";

/**
 * The run's elapsed time, ticking only inside the two components that show it.
 * It used to be section state updated every 50ms, which re-rendered the whole
 * playground - both terminal panes and every flow node - twenty times a second
 * for the length of a run.
 */
function useRunElapsed(startedAt: number | null, running: boolean, totalMs: number) {
  const [now, setNow] = useState(() => startedAt ?? 0);
  useEffect(() => {
    if (!running || startedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running, startedAt]);
  if (startedAt === null) return 0;
  if (!running) return totalMs;
  return Math.min(Math.max(now - startedAt, 0), totalMs);
}

interface RunProps {
  startedAt: number | null;
  running: boolean;
  totalMs: number;
}

export function RunProgressBar({ startedAt, running, totalMs, reduced }: RunProps & { reduced: boolean }) {
  const elapsed = useRunElapsed(startedAt, running, totalMs);
  const pct = totalMs > 0 ? Math.min(100, (elapsed / totalMs) * 100) : 0;
  return (
    <div
      className="relative h-1 bg-white/[0.03]"
      role="progressbar"
      aria-label="Simulation progress"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 left-0 origin-left"
        style={{
          width: "100%",
          transform: `scaleX(${pct / 100})`,
          background: `linear-gradient(90deg, ${BRAND_VAR.cyan}, ${BRAND_VAR.purple}, ${BRAND_VAR.emerald})`,
          transition: reduced ? "none" : "transform 0.1s linear",
        }}
      />
    </div>
  );
}

export function RunTimer({ startedAt, running, totalMs, done }: RunProps & { done: boolean }) {
  const elapsed = useRunElapsed(startedAt, running, totalMs);
  const remaining = Math.max(0, totalMs - elapsed);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-muted-dark" />
        <span className={`text-base font-mono tabular-nums ${done ? "text-brand-emerald/60" : "text-muted-dark"}`}>
          {(elapsed / 1000).toFixed(1)}s
        </span>
      </div>
      {running && remaining > 0 && (
        <div className="flex items-center gap-1.5">
          <Hourglass className="h-3 w-3 text-brand-cyan/60" />
          <span className="text-base font-mono tabular-nums text-brand-cyan/60">~{(remaining / 1000).toFixed(1)}s</span>
        </div>
      )}
    </motion.div>
  );
}
