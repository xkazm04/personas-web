"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Zap } from "lucide-react";
import type { ChatScenario } from "../types";

const FALLBACK_TIMESTAMP = "—";

export default function ChatComparisonSummary({
  scenario,
  showSatisfaction,
}: {
  scenario: ChatScenario;
  showSatisfaction: boolean;
}) {
  const prefersReduced = useReducedMotion();
  // Guard: an empty messages array (data-edit slip, partial i18n migration,
  // future async load) would otherwise crash the whole chat section because
  // arr[arr.length - 1].timestamp dereferences `undefined`.
  const workflowLast = scenario.workflow.messages.at(-1);
  const agentLast = scenario.agent.messages.at(-1);
  const workflowElapsed = workflowLast?.timestamp ?? FALLBACK_TIMESTAMP;
  const agentElapsed = agentLast?.timestamp ?? FALLBACK_TIMESTAMP;

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
                {workflowElapsed} elapsed
              </div>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={prefersReduced ? { rotate: 0 } : { rotate: 360 }}
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : { duration: 2, repeat: Infinity, ease: "linear" }
                }
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
                {agentElapsed} elapsed
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
