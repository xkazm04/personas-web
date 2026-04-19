"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SkipForward } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { TerminalPhase } from "../types";
import { commands, commandBrands } from "../data";

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
  const currentCmd = commands[currentCommandIndex];
  const brand: BrandKey = commandBrands[currentCommandIndex] ?? "cyan";
  const isComplete = showSummary || phase === "done";
  const badgeLabel = isComplete
    ? `${commands.length}/${commands.length} Complete`
    : `${completedCount + 1}/${commands.length} ${currentCmd?.pillar ?? ""}`;
  const badgeBrand: BrandKey = isComplete ? "emerald" : brand;

  return (
    <div className="px-4 sm:px-6 py-3 border-t border-glass flex items-center justify-between">
      <AnimatePresence mode="wait">
        <motion.div
          key={badgeLabel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium"
          style={{
            backgroundColor: tint(badgeBrand, 10),
            borderColor: tint(badgeBrand, 20),
            color: BRAND_VAR[badgeBrand],
          }}
        >
          {badgeLabel}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {(phase === "typing" || phase === "output") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onSkip}
            className="flex items-center gap-1.5 rounded-lg border border-glass-hover bg-white/5 px-3 py-1.5 text-base font-mono text-muted-dark hover:text-muted hover:border-white/20 transition-all"
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
