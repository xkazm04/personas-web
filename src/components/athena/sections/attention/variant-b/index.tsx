"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import {
  ANNOTATION,
  HEADLINE,
  REPLAY,
  SPRING_POP,
  SUBLINE,
} from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import NoisePile from "./parts/NoisePile";
import CalmCard from "./parts/CalmCard";

/**
 * Section 2, variant B — "Nothing slips" (round 2, benefit-first).
 *
 * The visitor's day told twice, side by side: on the left, the aftermath
 * every other assistant leaves — 47 notifications teetering in a pile,
 * all shouting, the one real decision buried and barely visible. On the
 * right, the same day with Athena — the pile is gone, one calm card
 * carries the decision in a single line, everything else held quietly
 * beneath. One keyboard-accessible micro-interaction: wrestle the buried
 * card (it struggles, and fails to surface) and watch the calm card lift
 * instantly. Copy is pure visitor benefit — no product internals.
 *
 * NOTE: AthenaStage wraps this prototype for standalone preview only —
 * unwrap at page assembly (the page owns one shared stage).
 *
 * Reduced motion: composed end-state — both beats fully visible, no
 * drop-in physics, no struggle; `animate` props gated, elements kept.
 */
export default function AttentionNothingSlips() {
  const reduced = useReducedMotion() ?? false;
  const [engaged, setEngaged] = useState(false);

  /** Springy entrance with a slight settle-rotation; replays on re-entry. */
  const pop = (delay: number, rotate = -2) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.97, rotate },
          whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <AthenaStage>
      <section className="mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center px-6 py-20 sm:py-24">
        {/* Copy zone — large, arm's-length readable, art never crowds it */}
        <div className="max-w-3xl">
          <motion.p {...pop(0, 1.5)} className={ANNOTATION}>
            {COPY.eyebrow}
          </motion.p>
          <motion.h2 {...pop(0.08)} className={`mt-4 ${HEADLINE}`}>
            {COPY.headline}
          </motion.h2>
          <motion.p {...pop(0.16, 1)} className={`mt-5 max-w-2xl ${SUBLINE}`}>
            {COPY.subline}
          </motion.p>
        </div>

        {/* The visitor's day, told twice — beats stack on mobile */}
        <div className="mt-12 grid gap-10 sm:mt-16 md:grid-cols-2 md:gap-8">
          <motion.figure {...pop(0.2, -1.5)} className="flex flex-col">
            <figcaption className="mb-4 text-sm font-medium text-muted-dark">
              {COPY.beforeLabel}
              <span className="ml-2 text-foreground/70">{COPY.tryHint}</span>
            </figcaption>
            <NoisePile engaged={engaged} onEngage={setEngaged} />
          </motion.figure>

          <motion.figure {...pop(0.3, 1.5)} className="flex flex-col">
            <figcaption className="mb-4 text-sm font-medium text-foreground/80">
              {COPY.afterLabel}
            </figcaption>
            <CalmCard engaged={engaged} />
          </motion.figure>
        </div>
      </section>
    </AthenaStage>
  );
}
