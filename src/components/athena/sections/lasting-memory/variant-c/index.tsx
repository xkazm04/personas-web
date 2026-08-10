"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { COPY } from "./copy";
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";
import { statusAt, statusShortAt } from "./status";

/**
 * The lasting-memory section, variant C — "The Marker".
 *
 * The other sections on this page show Athena reaching further: one sentence
 * becomes a team, one portfolio spreads across a field, every conversation
 * arrives at one point. This one shows her reaching LESS than the field asks
 * of her, and being straight about it — which turns out to be the thing that
 * makes the rest of it trustworthy.
 *
 * Everything you have said to her lies in one seam, oldest at the left. She
 * comes in at the old end because that is the only end that leaves nothing
 * stranded, works forward until she is full, and stops. A marker plants where
 * she stopped. A bracket closes under exactly what she reached. Then she
 * writes three plain sentences: how far she got, how much is still waiting,
 * and that next time starts right here.
 *
 * Then she is gone for two whole beats — the passes are hours apart and the
 * scene spends real time on that — and comes back standing ON the marker. The
 * second bracket draws from that same edge and is exactly as long as the
 * first. Two spans, one shared edge, one identical label: no gap and no
 * overlap is a thing you can measure here rather than a claim anyone makes.
 *
 * It ends still, and it ends honest. What she has not reached is the biggest
 * thing left in the frame, it never dimmed, and the marker is standing in
 * front of it — waiting, not lost.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a label on the art or a sentence she wrote.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a sitting half-read.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a frame inside
 * the hold where both sittings are measured, both accounts are written and the
 * remainder is intact. It deliberately does NOT rewind: the still frame makes
 * the whole argument at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty seam and nothing said yet. */
const START_TICK = 0;

export default function LastingMemoryMarker() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(PARK_TICK);

  // Rewind whenever the section (re-)enters view. Render-time prev-state
  // pattern — React 19 forbids sync setState in a useEffect body.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(START_TICK);
  }

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Reduced motion pins the held still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the finished
  // argument instead of a half-read seam.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const layout = layoutFor(compact);
  const scene = sceneAt(phase);

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        className="relative flex min-h-dvh flex-col px-3 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14"
      >
        {/* Landing-style title trio — SectionIntro needs a motion parent
            driving hidden→visible for its fadeUp variants */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
        >
          <SectionIntro
            eyebrow={COPY.intro.eyebrow}
            heading={COPY.intro.heading}
            gradient={COPY.intro.gradient}
            className="mb-6 sm:mb-8"
          />
        </motion.div>

        {/* The illustration — one seam, two sittings, one shared edge.
            The floor the percent geometry is budgeted against (see ./layout);
            below it the accounts crowd their own type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field scene={scene} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          {/* The console light stops blinking once the section is holding —
              the status line is part of the frame, and the frame is still. */}
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={{ opacity: reduced || scene.holding ? 1 : [1, 0.25, 1] }}
            transition={
              reduced || scene.holding
                ? { duration: 0.6 }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
            aria-hidden="true"
          />
          <span className={`hidden truncate whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
            {statusAt(phase)}
          </span>
          <span className={`truncate whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
            {statusShortAt(phase)}
          </span>
        </div>
      </section>
    </AthenaStage>
  );
}
