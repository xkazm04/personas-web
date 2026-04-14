"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, ShieldAlert, X } from "lucide-react";
import type { Scenario } from "../types";

export default function WorkflowPanel({ scenario }: { scenario: Scenario }) {
  const statusColor = {
    ok: "text-brand-emerald/70",
    warn: "text-yellow-400/70",
    error: "text-brand-rose/70",
  };
  const statusBg = {
    ok: "bg-brand-emerald/10 ring-brand-emerald/10",
    warn: "bg-yellow-400/10 ring-yellow-400/10",
    error: "bg-brand-rose/10 ring-brand-rose/10",
  };
  const statusIcon = { ok: Check, warn: AlertTriangle, error: X };

  return (
    <div className="space-y-3">
      {scenario.workflow.steps.map((step, i) => {
        const Icon = statusIcon[step.status];
        return (
          <motion.div
            key={`${scenario.id}-w-${i}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className="flex items-start gap-2.5"
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ${statusBg[step.status]}`}
            >
              <Icon className={`h-3 w-3 ${statusColor[step.status]}`} />
            </div>
            <span
              className={`text-base leading-relaxed ${
                step.status === "error"
                  ? "text-brand-rose/70 line-through decoration-brand-rose/30"
                  : "text-muted"
              }`}
            >
              {step.text}
            </span>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          delay: scenario.workflow.steps.length * 0.15 + 0.1,
          duration: 0.3,
        }}
        className="mt-4 rounded-xl border border-brand-rose/10 bg-brand-rose/5 px-3 py-2.5"
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="h-3 w-3 text-brand-rose/60" />
          <span className="text-base font-mono uppercase tracking-wider text-brand-rose/70">
            Result
          </span>
        </div>
        <p className="text-base text-brand-rose/80 leading-relaxed">
          {scenario.workflow.result}
        </p>
      </motion.div>
    </div>
  );
}
