"use client";

import { motion } from "framer-motion";
import { Brain, Check, Zap } from "lucide-react";
import type { Scenario } from "../types";

export default function AgentPanel({ scenario }: { scenario: Scenario }) {
  return (
    <div className="space-y-3">
      {scenario.agent.thoughts.map((thought, i) => (
        <motion.div
          key={`${scenario.id}-t-${i}`}
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: i * 0.2, duration: 0.35 }}
          className="flex items-start gap-2.5"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-purple/10 ring-1 ring-brand-purple/10">
            <Brain className="h-3 w-3 text-brand-purple/70" />
          </div>
          <span className="text-base text-muted leading-relaxed italic">
            &ldquo;{thought}&rdquo;
          </span>
        </motion.div>
      ))}

      {scenario.agent.actions.map((action, i) => (
        <motion.div
          key={`${scenario.id}-a-${i}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{
            delay: scenario.agent.thoughts.length * 0.2 + i * 0.12,
            duration: 0.3,
          }}
          className="flex items-start gap-2.5"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-cyan/10 ring-1 ring-brand-cyan/10">
            <Zap className="h-3 w-3 text-brand-cyan/70" />
          </div>
          <span className="text-base text-muted leading-relaxed">{action}</span>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          delay:
            scenario.agent.thoughts.length * 0.2 +
            scenario.agent.actions.length * 0.12 +
            0.1,
          duration: 0.3,
        }}
        className="mt-4 rounded-xl border border-brand-emerald/10 bg-brand-emerald/5 px-3 py-2.5"
      >
        <div className="flex items-center gap-2 mb-1">
          <Check className="h-3 w-3 text-brand-emerald/60" />
          <span className="text-base font-mono uppercase tracking-wider text-brand-emerald/70">
            Result
          </span>
        </div>
        <p className="text-base text-brand-emerald/80 leading-relaxed">
          {scenario.agent.result}
        </p>
      </motion.div>
    </div>
  );
}
