"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";
import type { TrackStep } from "../types";

export default function StepBlock({
  step,
  index,
  isActive,
  isWorkflow,
  totalSteps,
}: {
  step: TrackStep;
  index: number;
  isActive: boolean;
  isWorkflow: boolean;
  totalSteps: number;
}) {
  const prefersReduced = useReducedMotion();
  const isError = step.status === "error";
  const isWarn = step.status === "warn";

  const bgColor = isError
    ? "bg-brand-rose/20 border-brand-rose/30"
    : isWarn
      ? "bg-yellow-400/15 border-yellow-400/25"
      : isWorkflow
        ? "bg-white/5 border-glass-hover"
        : "bg-brand-emerald/10 border-brand-emerald/20";

  const iconColor = isError
    ? "text-brand-rose"
    : isWarn
      ? "text-yellow-400"
      : isWorkflow
        ? "text-muted"
        : "text-brand-emerald";

  const Icon = isError ? X : isWarn ? AlertTriangle : Check;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={
        isActive
          ? {
              opacity: 1,
              scale: 1,
              x: 0,
              ...(isError && !prefersReduced ? { rotate: [0, -1, 1, -0.5, 0] } : {}),
            }
          : { opacity: 0.3, scale: 0.9, x: 0 }
      }
      transition={{
        delay: isActive ? index * 0.35 : 0,
        duration: prefersReduced ? 0.1 : 0.35,
        ease: "easeOut",
      }}
      className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 ${bgColor} shrink-0`}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
      <span
        className={`text-base font-mono whitespace-nowrap ${
          isError
            ? "text-brand-rose line-through decoration-brand-rose/70"
            : "text-muted"
        }`}
      >
        {step.label}
      </span>

      {isError && isWorkflow && !prefersReduced && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: index * 0.35 + 0.3, duration: 0.3 }}
          className="absolute inset-0 pointer-events-none"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 0 20 L 15 12 L 30 25 L 50 8 L 70 28 L 85 15 L 100 20"
              fill="none"
              stroke="rgba(244,63,94,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: index * 0.35 + 0.3, duration: 0.5 }}
            />
          </svg>
        </motion.div>
      )}

      {index < totalSteps - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.5 } : { opacity: 0 }}
          transition={{ delay: isActive ? index * 0.35 + 0.2 : 0 }}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-muted-dark"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M 2 6 L 10 6 M 7 3 L 10 6 L 7 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
