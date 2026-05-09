"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import type { StageStatus, TimelineStage } from "../types";

export default function StageCard({
  stage,
  status,
  isOutput,
  reduced,
}: {
  stage: TimelineStage;
  status: StageStatus;
  index: number;
  isOutput: boolean;
  reduced: boolean;
}) {
  const Icon = stage.icon;

  return (
    <motion.div
      layout
      className={`relative flex-shrink-0 rounded-2xl border transition-all duration-500 ${
        status === "active"
          ? "w-52 border-brand-cyan/40 bg-brand-cyan/[0.06] shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-105"
          : status === "done"
            ? isOutput
              ? "w-48 border-brand-emerald/30 bg-brand-emerald/[0.06]"
              : "w-48 border-brand-emerald/20 bg-white/[0.02]"
            : "w-44 border-glass bg-white/[0.01]"
      }`}
      style={{ zIndex: status === "active" ? 10 : 1 }}
    >
      {status === "active" && !reduced && (
        <motion.div
          className="absolute -inset-[1px] rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.12) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <AnimatePresence>
        {status === "done" && isOutput && !reduced && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl border-2 border-brand-emerald/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="absolute inset-0 rounded-2xl border border-brand-emerald/20"
            />
          </>
        )}
      </AnimatePresence>

      <div className="relative p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-500 ${
              status === "active"
                ? "border-brand-cyan/30 bg-brand-cyan/10"
                : status === "done"
                  ? "border-brand-emerald/20 bg-brand-emerald/[0.06]"
                  : "border-glass bg-white/[0.02]"
            }`}
          >
            {status === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
            ) : status === "active" ? (
              <Loader2 className="h-4 w-4 text-brand-cyan animate-spin" />
            ) : status === "locked" ? (
              <Lock className="h-3.5 w-3.5 text-muted-dark" />
            ) : (
              <Icon className="h-4 w-4 text-muted-dark" />
            )}
          </div>
          <span
            className={`text-base font-mono tabular-nums ${
              status === "active"
                ? "text-brand-cyan/70"
                : status === "done"
                  ? "text-brand-emerald/80"
                  : "text-muted-dark"
            }`}
          >
            {stage.timing}
          </span>
        </div>

        <h4
          className={`text-base font-semibold transition-colors duration-300 ${
            status === "active"
              ? "text-brand-cyan"
              : status === "done"
                ? "text-foreground"
                : "text-muted-dark"
          }`}
        >
          {stage.label}
        </h4>

        <AnimatePresence>
          {(status === "active" || status === "done") && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
              className={`text-base leading-relaxed ${
                status === "done"
                  ? isOutput
                    ? "text-brand-emerald/70 font-medium"
                    : "text-muted-dark"
                  : "text-muted"
              }`}
            >
              {stage.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
