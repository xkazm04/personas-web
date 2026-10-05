"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { MindRun } from "../shared/useMindRun";
import { DIMENSIONS } from "../shared/beats";

/**
 * The four things every run hands back. The frame is always there - so the
 * visitor sees what is coming before it arrives - and the values land one
 * after another when the run completes.
 */
export default function ResultGrid({ run }: { run: MindRun }) {
  const done = run.phase === "done";
  return (
    <div
      data-am-result
      className="mt-auto overflow-hidden rounded-xl border transition-colors duration-700"
      style={{
        borderColor: done ? tint("emerald", 30) : "var(--border-glass)",
        background: done ? tint("emerald", 5) : "rgba(var(--surface-overlay), 0.015)",
      }}
    >
      <div className="flex items-center justify-between border-b border-glass px-4 py-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: done ? BRAND_VAR.emerald : "var(--muted-dark)" }}>
          {run.lab.outcomeTitle}
        </span>
        {done && <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-emerald">{run.copy.executionComplete}</span>}
      </div>
      <ul className="grid grid-cols-2">
        {DIMENSIONS.map((d, i) => (
          <li key={d.key} className="flex min-w-0 gap-2.5 px-3.5 py-2 stage:py-[0.9svh]">
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500"
              style={{ background: tint(d.brand, done ? 18 : 6) }}
            >
              <d.icon className="h-3.5 w-3.5" style={{ color: BRAND_VAR[d.brand] }} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: BRAND_VAR[d.brand] }}>
                {run.copy.dimensions[d.key]}
              </div>
              <motion.p
                className="line-clamp-2 text-base leading-snug text-foreground"
                initial={false}
                animate={{ opacity: done ? 1 : 0, y: done || run.reduced ? 0 : 6 }}
                transition={run.reduced ? { duration: 0 } : { duration: 0.45, delay: done ? 0.15 + i * 0.12 : 0 }}
              >
                {run.example.result[d.key]}
              </motion.p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
