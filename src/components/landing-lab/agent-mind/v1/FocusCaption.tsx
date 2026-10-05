"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND, beatCaption, beatDetail, beatTitle } from "../shared/beats";

/**
 * The beat under attention, named at display size in a band the mind pane
 * owns: what the agent is doing (title), why it matters to you (caption) and
 * the concrete thing it produced for this prompt (detail).
 */
export default function FocusCaption({ run }: { run: MindRun }) {
  const idle = run.phase === "idle";
  const beat = run.focus;
  const brand = run.phase === "done" ? "emerald" : BEAT_BRAND[BEATS[beat]];
  const key = idle ? "idle" : `${run.activeExample}-${beat}`;
  return (
    <div className="relative border-t border-glass px-5 py-3 stage:py-[1.6svh]" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate font-mono text-xs uppercase tracking-[0.2em]" style={{ color: BRAND_VAR[brand] }}>
          {idle ? run.lab.wholePlan : `${run.lab.underAttention} · ${beat + 1}/${BEATS.length} · ${beatTitle(run, beat)}`}
        </span>
      </div>
      <motion.div
        key={key}
        initial={run.reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-1"
      >
        <p className="truncate text-[clamp(1.15rem,1.7vw,1.6rem)] font-semibold leading-tight tracking-tight text-foreground">
          {idle ? run.lab.idleHint : beatCaption(run, beat)}
        </p>
        <p className="mt-0.5 truncate font-mono text-base" style={{ color: idle ? "var(--muted-dark)" : BRAND_VAR[brand] }}>
          {idle ? run.copy.mindIdleHint : beatDetail(run, beat)}
        </p>
      </motion.div>
    </div>
  );
}
