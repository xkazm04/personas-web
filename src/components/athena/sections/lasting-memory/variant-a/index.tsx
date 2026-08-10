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
import { captionAt, statusAt, statusShortAt } from "./status";

/**
 * Lasting memory, variant A — "The Tide" (her memory keeps itself).
 *
 * One full-bleed basin, and the rhythm of the thing rendered as the thing:
 * talk collects, unevenly, with stretches where nothing arrives and therefore
 * nothing happens. When it has risen to the line — not on a clock, not because
 * you asked — it starts on its own. One pass can only take so much, so it
 * takes the OLDEST part and marks what it could not reach, in place, still
 * bright, still there. What it took presses down into the band of talk that
 * settled before it, and out of that band come the few things actually worth
 * keeping, one per beat, each on a thread back to the exact place it came
 * from. Then the part it could not reach comes down, the level falls, it
 * writes one plain line about what it learned, and the tide starts coming in
 * again. Loop.
 *
 * The section's loop and the product's rhythm are the same shape, so the two
 * ends of the cycle are made to meet: the level at the last tick is the level
 * at the first, and the basin reads as continuous straight through the wrap.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a label on a line, a five-word caption, one
 * of the four things she kept, or the account the pass ends by writing.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins the tide mid-settle.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the beat after
 * the account is written, where the band, the four things, their threads, the
 * part still waiting and the line it has to climb to again are all on screen
 * at once. It deliberately does NOT rewind.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: a low tide, and a line a long way above it. */
const START_TICK = 0;

export default function LastingMemoryTide() {
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

  // Reduced motion pins the finished still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // rhythm instead of a half-filled basin.
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

        {/* The illustration — everything you have said, and the few things it
            leaves behind. The floor the percent geometry is budgeted against
            (see ./layout); below it the basin crowds its own shelf. */}
        <div className="relative min-h-[34rem] flex-1">
          <Field scene={scene} caption={captionAt(phase)} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={reduced ? undefined : { opacity: [1, 0.25, 1] }}
            transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
