"use client";

import { motion } from "framer-motion";
import { MessageSquare, RefreshCw } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { CYCLE_MS } from "../data";
import type { Scenario } from "../types";

export default function ScenarioProgress({
  scenarios,
  activeIndex,
  paused,
  scenarioId,
  onSelect,
  onTogglePause,
}: {
  scenarios: Scenario[];
  activeIndex: number;
  paused: boolean;
  scenarioId: string;
  onSelect: (i: number) => void;
  onTogglePause: () => void;
}) {
  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-3xl">
      <div className="flex gap-1.5">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            aria-label={`Go to scenario ${i + 1}: ${s.label}`}
            aria-current={i === activeIndex ? "true" : undefined}
            className="group relative flex-1 cursor-pointer py-2.5 focus-visible:outline-none"
          >
            {/* Visual bar stays 1px tall; the padded button gives a ~24px tap target. */}
            <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/[0.06] group-focus-visible:ring-2 group-focus-visible:ring-brand-cyan/40">
              {i === activeIndex && !paused && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  key={`progress-${scenarioId}-${activeIndex}`}
                />
              )}
              {i === activeIndex && paused && (
                <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple" />
              )}
              {i < activeIndex && (
                <div className="absolute inset-0 rounded-full bg-white/[0.12]" />
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-base font-mono text-muted-dark">
        <span>
          Scenario {activeIndex + 1} of {scenarios.length}
        </span>
        <button
          onClick={onTogglePause}
          aria-label={paused ? "Resume scenario auto-play" : "Pause scenario auto-play"}
          aria-pressed={paused}
          className="cursor-pointer flex items-center gap-1.5 rounded py-2 transition-colors hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          {paused ? (
            <>
              <RefreshCw className="h-3 w-3" />
              Resume auto-play
            </>
          ) : (
            <>
              <MessageSquare className="h-3 w-3" />
              Auto-cycling
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
