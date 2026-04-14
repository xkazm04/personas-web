"use client";

import type { ElementType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { TrackStep } from "../types";
import StepBlock from "./StepBlock";
import RaceTimer from "./RaceTimer";
import ResultCard from "./ResultCard";

function TimeCursor({
  isRunning,
  durationMs,
}: {
  isRunning: boolean;
  durationMs: number;
}) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-cyan/60 via-brand-purple/40 to-brand-cyan/60 z-10 pointer-events-none"
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Track({
  steps,
  isWorkflow,
  isActive,
  result,
  totalMs,
  showResult,
  label,
  icon: Icon,
}: {
  steps: TrackStep[];
  isWorkflow: boolean;
  isActive: boolean;
  result: string;
  totalMs: number;
  showResult: boolean;
  label: string;
  icon: ElementType;
}) {
  const themeColor = isWorkflow
    ? "border-brand-rose/10 bg-brand-rose/[0.02]"
    : "border-brand-emerald/10 bg-brand-emerald/[0.02]";

  const headerColor = isWorkflow ? "text-brand-rose/70" : "text-brand-emerald/70";
  const timerColor = isWorkflow ? "text-brand-rose/50" : "text-brand-emerald/50";

  return (
    <div className={`rounded-xl border p-4 ${themeColor} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${headerColor}`} />
          <span
            className={`text-base font-mono uppercase tracking-wider ${headerColor}`}
          >
            {label}
          </span>
        </div>
        <RaceTimer
          isRunning={isActive}
          durationMs={totalMs}
          label="Time"
          color={timerColor}
        />
      </div>

      <div className="relative">
        <TimeCursor isRunning={isActive} durationMs={totalMs} />

        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-white/5" />
        {isActive && (
          <motion.div
            className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full ${
              isWorkflow
                ? "bg-gradient-to-r from-brand-rose/40 to-brand-rose/20"
                : "bg-gradient-to-r from-brand-emerald/40 to-brand-cyan/30"
            }`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: totalMs / 1000, ease: "easeOut" }}
          />
        )}

        <div className="relative flex items-center gap-5 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {steps.map((step, i) => (
            <StepBlock
              key={`${step.label}-${i}`}
              step={step}
              index={i}
              isActive={isActive}
              isWorkflow={isWorkflow}
              totalSteps={steps.length}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.8 }}
            transition={{
              delay: isActive ? steps.length * 0.35 + 0.2 : 0,
              duration: 0.3,
              type: "spring",
            }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isWorkflow
                ? "bg-brand-rose/20 ring-1 ring-brand-rose/30"
                : "bg-brand-emerald/20 ring-1 ring-brand-emerald/30"
            }`}
          >
            {isWorkflow ? (
              <X className="h-4 w-4 text-brand-rose" />
            ) : (
              <Check className="h-4 w-4 text-brand-emerald" />
            )}
          </motion.div>
        </div>
      </div>

      <ResultCard isWorkflow={isWorkflow} result={result} visible={showResult} />
    </div>
  );
}
