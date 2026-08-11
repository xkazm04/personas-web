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
 * The her-workshop section, variant A — "The Wall".
 *
 * The section before this one argues that one sentence becomes a working team.
 * This one starts AFTER that: a lot of work is already in flight, none of it
 * started here, and the question is no longer how it gets going but who is
 * keeping track of all of it. Its subject is attention at scale.
 *
 * So the scene is a wall of small screens, every one of them a piece of work
 * you have running, and the argument is made three times over:
 *
 *   ONE PASS, MANY ANSWERS. She does not walk the wall. A single light crosses
 *   the whole of it in one beat, and then every screen answers in the same
 *   instant. Fifteen of them are still writing, so they are working — that is
 *   the entire test, and nothing that is still producing output gets called
 *   stuck. The rest have nothing on screen, which is an observation and not yet
 *   a verdict.
 *
 *   QUIET IS NOT ONE ANSWER. The wall steps back and those five stand alone,
 *   and they turn out to be four different things: two were simply finished,
 *   one is holding a question that no record of the run would ever show (what
 *   is on the screen is what she goes by), and one really has stopped. The
 *   fifth resolves a beat later than the others, into "not sure" — she declines
 *   to call it rather than picking the likeliest answer, and that pause is the
 *   most honest second in the section.
 *
 *   ONE FINISH LINE, NOT MANY. Three screens belong to a single job. They
 *   finish apart, one at a time, and none of them says a word. The announcement
 *   waits for the last of them and then lands once, for all three.
 *
 * It ends calm: everything that does not want a person dims, three screens stay
 * lit, and the work that is still running is still running.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a screen's name, its own output, or her
 * verdict on it.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a wall half-composed.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame inside
 * the hold where every screen is read, the quiet ones are resolved, the job is
 * announced and only what needs a person is lit. It deliberately does NOT
 * rewind: the still frame makes the whole argument at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns one
 * shared stage and sections inherit it.
 */

/** The true top of the loop: the wall's shape, and nothing read yet. */
const START_TICK = 0;

export default function HerWorkshopTheWall() {
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

  // Reduced motion pins the calm still outright rather than freezing the clock,
  // so a visitor who flips the preference mid-loop lands on the whole wall read
  // instead of a half-composed one.
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

        {/* The illustration — one wall of live work, and one mind on all of it.
            The floor the percent geometry is budgeted against (see ./layout);
            below it the screens crowd their own type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field scene={scene} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          {/* The console light stops blinking once the wall is calm — the
              status line is part of the frame, and the frame is still. */}
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
