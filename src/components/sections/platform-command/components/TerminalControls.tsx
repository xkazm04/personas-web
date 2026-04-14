"use client";

import { motion } from "framer-motion";
import { SkipForward } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { TerminalPhase } from "../types";
import { commands } from "../data";

export default function TerminalControls({
  phase,
  showSummary,
  currentCommandIndex,
  completedCount,
  onSkip,
  onRestart,
}: {
  phase: TerminalPhase;
  showSummary: boolean;
  currentCommandIndex: number;
  completedCount: number;
  onSkip: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="px-4 sm:px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {commands.map((_, i) => {
          const isDone = i < completedCount;
          const isCurrent = i === currentCommandIndex && !showSummary;
          return (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isDone
                  ? BRAND_VAR.emerald
                  : isCurrent
                    ? BRAND_VAR.cyan
                    : "rgba(var(--surface-overlay), 0.1)",
                boxShadow: isDone
                  ? `0 0 6px ${tint("emerald", 50)}`
                  : isCurrent
                    ? `0 0 6px ${tint("cyan", 50)}`
                    : undefined,
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {(phase === "typing" || phase === "output") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onSkip}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-base font-mono text-muted-dark hover:text-muted hover:border-white/20 transition-all"
          >
            <SkipForward className="h-3 w-3" />
            Skip
          </motion.button>
        )}

        {(phase === "done" || phase === "summary") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1.5 text-base font-mono text-brand-cyan/60 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all"
          >
            Replay
          </motion.button>
        )}
      </div>
    </div>
  );
}
