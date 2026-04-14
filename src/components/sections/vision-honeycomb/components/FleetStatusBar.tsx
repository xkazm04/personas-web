"use client";

import type { AgentData } from "../types";
import { statusStyles } from "../data";
import AnimatedCounter from "./AnimatedCounter";

export default function FleetStatusBar({ agents, totalExec }: { agents: AgentData[]; totalExec: number }) {
  const statusCounts = agents.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/4 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        <span className="text-base font-mono tracking-wider uppercase text-white/30">Fleet Status</span>
      </div>
      <div className="flex items-center gap-4">
        {(["running", "healing", "idle"] as const).map((key) => {
          const st = statusStyles[key];
          const count = statusCounts[key] || 0;
          if (count === 0) return null;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
              <span className={`text-base font-mono ${st.text}`}>
                {count} {st.label.toLowerCase()}
              </span>
            </div>
          );
        })}
      </div>
      <span className="text-base font-mono text-white/20 tabular-nums">
        <AnimatedCounter value={totalExec} /> total
      </span>
    </div>
  );
}
