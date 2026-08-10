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
import { CYCLE, INITIAL_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 5, variant C — "The Thing You Stopped Looking At".
 *
 * The wildcard of the three. A and B both stage the survey — the sweep, the
 * ranking, the present tense. This one is about the feeling underneath it: the
 * project you were proud of six weeks ago that has been quietly going wrong
 * while your attention was somewhere else, and the relief of being told before
 * it costs anything.
 *
 * So it renders ELAPSED ATTENTION rather than current state. There is no map,
 * no grid and no chart: a night field with six lights in it, and two kinds of
 * attention over them — yours, a warm pool that moves and takes its warmth
 * with it, and hers, a faint wash that covers everything and never goes out.
 * A light left outside your pool cools out of cyan through amber into rose,
 * dims, frays at the rim, stops breathing and collects dust, across eight of
 * the twenty-five ticks, because the slow part is the part nobody feels. Then
 * she notices, draws one line, carries it forward while the rest of the field
 * steps back, and writes down exactly what she found — a number, a date, and
 * the two things that are not fine. Your attention lands on it again, the
 * colour arc runs backwards in two beats instead of eight, and it goes home
 * healthy with a quiet mark on it. Loop.
 *
 * The only words outside the illustration are the SectionIntro trio and one
 * mono status line. Everything else — the names, the count of weeks, the
 * finding — is inside the art.
 *
 * The clock only runs while the section is on screen (useInView, 40%) and
 * rewinds to tick 0 on every entry, so nobody joins at the point where the
 * thing is already rotting and never sees that it used to be fine.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame where
 * the field is whole, the one that was fading is home and healthy with "Back
 * to 98%" under its name, and her mark is on all of it. It deliberately does
 * NOT rewind: the still frame makes the whole claim at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: six lights still only ghosts, nothing decided. */
const START_TICK = 0;

export default function WholePortfolioQuietDecay() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(INITIAL_TICK);

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

  // Reduced motion pins the healed still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // field intact instead of on the worst frame of the decay.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const scene = sceneAt(phase);
  const layout = layoutFor(compact);

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

        {/* The illustration. It bleeds past the section's gutters on purpose —
            this one is a place, not a panel, and a place has no margins.
            The floor is the height the geometry is budgeted against; below it
            the lights would crowd the type they sit under. */}
        <div className="relative -mx-3 min-h-[34rem] flex-1 sm:-mx-6">
          <Field scene={scene} layout={layout} reduced={reduced} />
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
