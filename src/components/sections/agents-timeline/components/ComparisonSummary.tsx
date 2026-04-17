"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import type { Scenario } from "../types";

export default function ComparisonSummary({
  scenario,
  showResults,
}: {
  scenario: Scenario;
  showResults: boolean;
}) {
  return (
    <AnimatePresence>
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-brand-rose/30 flex items-center justify-center">
                  <X className="h-2 w-2 text-brand-rose" />
                </div>
                <span className="text-base font-mono uppercase tracking-wider text-brand-rose/60">
                  Workflow
                </span>
              </div>
              <div className="text-2xl font-bold text-brand-rose/80 tabular-nums">
                {(scenario.workflow.totalMs / 1000).toFixed(1)}s
              </div>
              <div className="text-base text-brand-rose/60 font-mono mt-1">FAILED</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-brand-emerald/30 flex items-center justify-center">
                  <Check className="h-2 w-2 text-brand-emerald" />
                </div>
                <span className="text-base font-mono uppercase tracking-wider text-brand-emerald/60">
                  Agent
                </span>
              </div>
              <div className="text-2xl font-bold text-brand-emerald/80 tabular-nums">
                {(scenario.agent.totalMs / 1000).toFixed(1)}s
              </div>
              <div className="text-base text-brand-emerald/60 font-mono mt-1">RESOLVED</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-3.5 w-3.5 text-brand-cyan" />
              <span className="text-base font-mono text-brand-cyan/70">
                Agent resolved{" "}
                <span className="text-brand-cyan font-bold">
                  {(
                    ((scenario.workflow.totalMs - scenario.agent.totalMs) /
                      scenario.workflow.totalMs) *
                    100
                  ).toFixed(0)}
                  %
                </span>{" "}
                faster
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
