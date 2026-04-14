"use client";

import { motion } from "framer-motion";
import { Gauge, RotateCcw } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { ThemedChip } from "@/components/primitives";
import { examples } from "../data";
import type { TimelinePhase } from "../types";

export default function ExampleSelector({
  activeExample,
  isRunning,
  speed,
  phase,
  onExampleClick,
  onToggleSpeed,
  onReplay,
  onReset,
}: {
  activeExample: number | null;
  isRunning: boolean;
  speed: 1 | 2;
  phase: TimelinePhase;
  onExampleClick: (i: number) => void;
  onToggleSpeed: () => void;
  onReplay: () => void;
  onReset: () => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="mb-6 flex flex-wrap gap-2 justify-center items-center"
    >
      {examples.map((ex, i) => (
        <ThemedChip
          key={ex.label}
          active={activeExample === i}
          onClick={() => onExampleClick(i)}
          disabled={isRunning}
          size="sm"
          icon={
            <ex.icon className="h-3.5 w-3.5" style={{ color: ex.iconColor }} />
          }
        >
          {ex.label}
        </ThemedChip>
      ))}

      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={onToggleSpeed}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-base font-mono text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all"
        >
          <Gauge className="h-3.5 w-3.5" />
          {speed}x
        </button>
        {phase === "done" && (
          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-base font-medium text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
        )}
        {phase !== "idle" && (
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-base font-medium text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all disabled:opacity-40"
          >
            Reset
          </button>
        )}
      </div>
    </motion.div>
  );
}
