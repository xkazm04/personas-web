"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { ChatScenario } from "../types";

export default function ChatComparisonSummary({
  scenario,
  showSatisfaction,
}: {
  scenario: ChatScenario;
  showSatisfaction: boolean;
}) {
  return (
    <AnimatePresence>
      {showSatisfaction && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-5 rounded-xl border border-glass-hover bg-white/[0.03] p-4 backdrop-blur-sm"
        >
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-base font-mono uppercase tracking-wider text-brand-rose/80 mb-1">
                Workflow
              </div>
              <div className="text-lg font-bold text-brand-rose/90">
                {scenario.workflow.messages.length} msgs
              </div>
              <div className="text-base text-brand-rose/70 font-mono">
                {scenario.workflow.messages[scenario.workflow.messages.length - 1].timestamp}{" "}
                elapsed
              </div>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto h-8 w-8 rounded-full border border-brand-cyan/20 flex items-center justify-center mb-1"
              >
                <Zap className="h-4 w-4 text-brand-cyan" />
              </motion.div>
              <span className="text-base font-mono text-brand-cyan/60">vs</span>
            </div>

            <div className="text-center">
              <div className="text-base font-mono uppercase tracking-wider text-brand-emerald/80 mb-1">
                Agent
              </div>
              <div className="text-lg font-bold text-brand-emerald/90">
                {scenario.agent.messages.length} msgs
              </div>
              <div className="text-base text-brand-emerald/70 font-mono">
                {scenario.agent.messages[scenario.agent.messages.length - 1].timestamp}{" "}
                elapsed
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
