"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Timer } from "lucide-react";
import type { ChatScenario } from "../types";
import { lastSeconds } from "../timeline-utils";

const FALLBACK_TIMESTAMP = "—";

function RaceBar({
  label,
  pct,
  clock,
  outcome,
  labelColor,
  barColor,
  delay,
  instant,
}: {
  label: string;
  pct: number;
  clock: string;
  outcome: string;
  labelColor: string;
  barColor: string;
  delay: number;
  instant: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-24 shrink-0 font-mono text-base tracking-wider ${labelColor}`}
      >
        {label}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            instant
              ? { duration: 0 }
              : { duration: 0.8, ease: "easeOut", delay }
          }
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
        />
      </div>
      <span
        className={`w-32 shrink-0 text-right font-mono text-base ${labelColor}`}
      >
        {clock} · {outcome}
      </span>
    </div>
  );
}

/**
 * "Time to outcome" footer for the Race Log variant — two horizontal bars
 * whose lengths are proportional to each channel's elapsed time, plus the
 * speed multiple between them.
 */
export default function TimelineRaceSummary({
  scenario,
  show,
}: {
  scenario: ChatScenario;
  show: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const wfSec = lastSeconds(scenario.workflow.messages);
  const agSec = lastSeconds(scenario.agent.messages);
  const maxSec = Math.max(wfSec, agSec, 1);
  const ratio = agSec > 0 ? wfSec / agSec : 0;
  const ratioLabel = ratio % 1 === 0 ? ratio.toFixed(0) : ratio.toFixed(1);
  const wfLast = scenario.workflow.messages.at(-1);
  const agLast = scenario.agent.messages.at(-1);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={
            prefersReduced
              ? { duration: 0.2 }
              : // The card's only height change during playback — same linear
                // expansion as the rows so the close feels continuous.
                {
                  height: { duration: 0.5, ease: "linear" },
                  opacity: { duration: 0.4, ease: "easeOut", delay: 0.15 },
                }
          }
          className="overflow-hidden"
        >
          <div className="mt-5 rounded-xl border border-glass-hover bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="mb-3 font-mono text-base uppercase tracking-wider text-muted-dark">
            Time to outcome
          </div>
          <div className="space-y-2.5">
            <RaceBar
              label="workflow-bot"
              pct={(wfSec / maxSec) * 100}
              clock={wfLast?.timestamp ?? FALLBACK_TIMESTAMP}
              outcome={wfLast?.tone === "success" ? "resolved" : "handed off"}
              labelColor="text-brand-rose/80"
              barColor="bg-brand-rose/50"
              delay={0.2}
              instant={!!prefersReduced}
            />
            <RaceBar
              label="agent-bot"
              pct={(agSec / maxSec) * 100}
              clock={agLast?.timestamp ?? FALLBACK_TIMESTAMP}
              outcome={agLast?.tone === "success" ? "resolved" : "handed off"}
              labelColor="text-brand-emerald/80"
              barColor="bg-brand-emerald/60"
              delay={0.35}
              instant={!!prefersReduced}
            />
          </div>
          {ratio > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 font-mono text-base text-brand-cyan/70">
              <Timer className="h-3.5 w-3.5" />
              agent reached its outcome {ratioLabel}× sooner
            </div>
          )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
