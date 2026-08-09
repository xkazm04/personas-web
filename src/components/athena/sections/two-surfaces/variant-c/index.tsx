"use client";

import { motion, useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import CollapseScene from "./CollapseScene";

/**
 * Section 2 — "Two surfaces. Nothing else." · variant C, "The Collapse".
 *
 * Interface archaeology, dramatized: six competing notification panels
 * used to tower cramped above Athena's transcript; on entry they stack
 * and fight for space, then compress with spring physics into the single
 * two-level attention bar — six mono chips, every badge count conserved
 * (the annotation ledger beside the bar confirms it). The freed vertical
 * space visibly returns to the transcript: the payoff is SPACE, rendered.
 * One interaction beat: hover/focus a chip and it lifts, peeking one line
 * of what it holds — nothing lost, only quieted. Replays on re-entry.
 *
 * Reduced motion pins the collapsed end-state (ledger visible, chip peeks
 * still work); all gating happens on `animate` props, never markup.
 *
 * NOTE: the AthenaStage wrapper is for standalone preview only — it
 * unwraps at page assembly, where /athena owns one shared stage.
 */
export default function TwoSurfacesCollapse() {
  const reduced = useReducedMotion() ?? false;

  /** Shared spring pop-in for the typography zone; replays on re-entry. */
  const pop = (delay: number, rotate = -1) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16, scale: 0.97, rotate },
          whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <AthenaStage>
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 sm:py-24">
        {/* Typography owns this clear zone — the art never enters it */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.p {...pop(0.05, 1)} className={ANNOTATION}>
            {COPY.eyebrow}
          </motion.p>
          <motion.h2
            {...pop(0.14)}
            className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
          >
            {COPY.headline}
          </motion.h2>
          <motion.p
            {...pop(0.24, 1)}
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg"
          >
            {COPY.sub}
          </motion.p>
        </div>

        {/* The scene — six panels tower, collapse, and the transcript breathes */}
        <motion.div {...pop(0.34)} className="mt-12 w-full sm:mt-14">
          <CollapseScene />
        </motion.div>
      </section>
    </AthenaStage>
  );
}
