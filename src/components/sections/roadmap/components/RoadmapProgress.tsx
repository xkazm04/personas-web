"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Circle, CheckCircle2 } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import {
  completedCount,
  totalPhases,
  remainingCount,
  progressPercent,
  progressWidth,
} from "@/data/roadmap-phases";

export default function RoadmapProgress() {
  // Gate the shimmer sweep, breathing dot, and fill animation — the bar
  // resolves to its final static state under reduced-motion (repo convention;
  // matches the sibling RevealTile treatment in RoadmapAreas).
  const reduced = useReducedMotion() ?? false;
  const { t } = useTranslation();
  const p = t.roadmapSection.progress;
  // All counts/percentages flow from phaseCardData (single source of truth)
  // — flipping a `completed` flag now updates the public progress copy in
  // lockstep with the phase grid. Only the label text is localized; the
  // pluralization/special-case branches are ported faithfully.
  const phasesCompleteLabel = p.phasesComplete
    .replace("{completed}", String(completedCount))
    .replace("{total}", String(totalPhases));
  const phasesDoneLabel =
    completedCount === 0
      ? p.noneDone
      : completedCount === 1
        ? p.firstDone
        : p.rangeDone.replace("{count}", String(completedCount));
  const phasesRemainingLabel = (remainingCount === 1 ? p.toGoOne : p.toGoOther).replace(
    "{count}",
    String(remainingCount),
  );

  return (
    <motion.div data-tour-diagram="roadmap-progress" variants={fadeUp} className="mt-10 mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 text-base font-mono text-muted mb-4">
        <span className="font-medium tracking-wide">{phasesCompleteLabel}</span>
        <span
          className="font-bold text-base"
          style={{ color: BRAND_VAR.cyan, textShadow: `0 0 8px ${tint("cyan", 80)}` }}
        >
          {progressPercent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={phasesCompleteLabel}
        className="relative h-2.5 rounded-full bg-white/[0.06] shadow-inner"
        style={{ "--progress": progressPercent / 100 } as React.CSSProperties}
      >
        <motion.div
          className="relative h-full rounded-full overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, ${BRAND_VAR.cyan}, ${BRAND_VAR.blue}, ${BRAND_VAR.purple})`,
            boxShadow: `0 0 15px ${tint("purple", 50)}`,
            ...(reduced ? { width: progressWidth } : null),
          }}
          initial={reduced ? false : { width: 0 }}
          whileInView={reduced ? undefined : { width: progressWidth }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        >
          {/* Decorative shimmer sweep — omitted entirely under reduced motion */}
          {!reduced && (
            <motion.div
              className="absolute inset-0 animate-progress-shimmer"
              style={{
                background: "linear-gradient(90deg, transparent 70%, rgba(255,255,255,0.15) 90%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 1, 1, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 2.4, delay: 0.4, times: [0, 0.15, 0.65, 1] }}
            />
          )}
        </motion.div>
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${reduced ? "" : "animate-progress-dot-breathe"}`}
          style={{
            backgroundColor: BRAND_VAR.cyan,
            boxShadow: `0 0 6px ${tint("cyan", 80)}, 0 0 12px ${tint("cyan", 40)}`,
            ...(reduced ? { left: "calc(var(--progress) * 100%)" } : null),
          }}
          initial={reduced ? false : { left: "0%" }}
          whileInView={reduced ? undefined : { left: "calc(var(--progress) * 100%)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base font-mono text-muted font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" style={{ color: BRAND_VAR.emerald, filter: `drop-shadow(0 0 5px ${tint("emerald", 60)})` }} />
          <span>{phasesDoneLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-muted" />
          <span>{phasesRemainingLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}
