"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND, beatCaption, beatDetail, beatTitle } from "../shared/beats";

export const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif' };

/** The drawing's caption: what the pen is drawing now, said as a benefit. */
export default function Caption({ run }: { run: MindRun }) {
  const idle = run.phase === "idle";
  const beat = run.focus;
  const brand = run.phase === "done" ? "emerald" : BEAT_BRAND[BEATS[beat]];
  return (
    <div className="relative border-t border-dashed border-glass-strong px-6 pb-4 pt-3" aria-live="polite">
      <span className="absolute right-6 top-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-dark">{run.lab.stylised}</span>
      <motion.div
        key={idle ? "idle" : `${run.activeExample}-${beat}`}
        initial={run.reduced ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="min-w-0"
      >
        <div className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: BRAND_VAR[idle ? "cyan" : brand] }}>
          {idle ? run.lab.wholePlan : `${run.lab.underAttention} · ${beat + 1}/${BEATS.length} · ${beatTitle(run, beat)}`}
        </div>
        <p className="mt-1 truncate text-[clamp(1.4rem,2.2vw,2.1rem)] italic leading-tight text-foreground" style={SERIF}>
          {idle ? run.lab.idleHint : beatCaption(run, beat)}
        </p>
        <p className="truncate font-mono text-base" style={{ color: idle ? "var(--muted-dark)" : BRAND_VAR[brand] }}>
          {idle ? run.copy.mindIdleHint : beatDetail(run, beat)}
        </p>
      </motion.div>
    </div>
  );
}
