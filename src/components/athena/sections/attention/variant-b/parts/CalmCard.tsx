"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import {
  ANNOTATION_DIM,
  PANEL,
  PANEL_ACTIVE,
  REPLAY,
  SPRING_POP,
} from "@/components/athena/stage/athena-tokens";
import { COPY } from "../data";

/*
 * The after beat — Athena's version of the same day. The pile is gone;
 * one calm card waits front and center with the decision already
 * summarized in a line, and a small "held · 46" chip filing everything
 * else quietly beneath. When the visitor wrestles the buried card in the
 * before beat (`engaged`), this card lifts instantly — the contrast is
 * the argument. Reduced motion: gated `animate`, composed end-state.
 */
export default function CalmCard({ engaged }: { engaged: boolean }) {
  const reduced = useReducedMotion() ?? false;

  const pop = (delay: number, rotate = -2) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22, scale: 0.95, rotate },
          whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-8">
      <motion.div
        {...pop(0.25)}
        className="w-full max-w-sm"
        animate={reduced ? undefined : { y: engaged ? -10 : 0 }}
        transition={SPRING_POP}
      >
        <div
          className={`${engaged ? PANEL_ACTIVE : PANEL} px-6 py-5 transition-colors`}
          style={{ boxShadow: engaged ? brandShadow("cyan", 40, 26) : brandShadow("cyan", 22, 10) }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 12, 45) }}
              aria-hidden
            />
            <span className="text-sm font-medium" style={{ color: BRAND_VAR.cyan }}>
              {COPY.calmKicker}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            {COPY.calmTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-dark">{COPY.calmSummary}</p>
        </div>
      </motion.div>

      {/* everything else, filed quietly beneath */}
      <motion.div {...pop(0.38, 1.5)} className="flex flex-col items-center gap-2">
        <span
          className={`${ANNOTATION_DIM} rounded-full border border-glass px-3 py-1`}
          style={{ backgroundColor: tint("cyan", 4) }}
        >
          {COPY.heldChip}
        </span>
        <span className="text-sm text-muted-dark">{COPY.heldNote}</span>
      </motion.div>
    </div>
  );
}
