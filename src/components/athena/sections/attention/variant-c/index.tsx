"use client";

import { motion, useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import {
  ANNOTATION_DIM,
  HEADLINE,
  REPLAY,
  SPRING_POP,
  SUBLINE,
} from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import TimelineBand from "./TimelineBand";
import BandOverlays from "./BandOverlays";

/**
 * Section 2 (attention), variant C — "A day, drawn."
 *
 * The illustration IS the visitor's day: one horizon band from morning
 * to the small hours, its light shifting dawn→day→dusk→night. Above the
 * line, a typical assistant's interruption storm; below it, Athena's
 * three luminous moments — silent through the visitor's flow block,
 * asleep at night while the storm still twitches once at 2 am.
 *
 * Wrapped in AthenaStage for standalone preview; the wrapper unwraps at
 * page assembly (the page owns one shared stage).
 *
 * On mobile the band turns vertical: morning at the top, night at the
 * bottom, moment labels revealed on hover/focus (keyboard-accessible).
 * Reduced motion renders the fully composed timeline — `animate` props
 * are gated, no element is ever dropped.
 */
export default function AttentionDayDrawn() {
  const reduced = useReducedMotion() ?? false;

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <AthenaStage>
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 sm:py-24">
        {/* Copy zone — typography owns this band, large at arm's length */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p {...rise(0)} className={ANNOTATION_DIM}>
            {COPY.eyebrow}
          </motion.p>
          <motion.h2 {...rise(0.08)} className={`mt-4 ${HEADLINE}`}>
            {COPY.headline}
          </motion.h2>
          <motion.p {...rise(0.16)} className={`mx-auto mt-5 max-w-2xl ${SUBLINE}`}>
            {COPY.subline}
          </motion.p>
        </div>

        {/* The day, drawn — horizontal band on desktop */}
        <motion.div
          {...rise(0.26)}
          className="relative mt-14 hidden w-full max-w-6xl pb-16 md:block"
        >
          <div className="relative aspect-[1000/240] w-full">
            <TimelineBand orientation="h" />
            <BandOverlays orientation="h" />
          </div>
        </motion.div>

        {/* …and vertical on mobile: morning at the top, night at the bottom */}
        <motion.div {...rise(0.26)} className="relative mt-12 md:hidden">
          <div className="relative aspect-[240/1000] w-48">
            <TimelineBand orientation="v" />
            <BandOverlays orientation="v" />
          </div>
        </motion.div>
      </section>
    </AthenaStage>
  );
}
