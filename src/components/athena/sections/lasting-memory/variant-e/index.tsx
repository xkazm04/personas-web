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
 * The lasting-memory section, variant E — "Every night, a little more".
 *
 * The other sections on this page happen in a moment: one sentence becomes a
 * team, one portfolio spreads across a field, every conversation arrives at
 * one point. This one is the only section that takes TIME as its subject. It
 * is not one pass shown carefully — it is five ordinary days of working
 * together, end to end, so that the thing being sold is not a mechanism but a
 * relationship that is worth more in a week than it was on Monday.
 *
 * The scene is two rows and one difference between them. Along the top, each
 * day's talk builds up to the same height and then goes quiet as the next day
 * starts beside it — same volume, over and over, endlessly recycled. Along the
 * bottom, a shelf that only ever grows: two things a night, each landing under
 * the day it came out of and keeping a hairline back up to it. By the last
 * frame the top of the scene has churned five times and the bottom has never
 * given anything back.
 *
 * Two beats are the reason it is honest. One day barely gets going, never
 * reaches the line, and gets no night at all — the pass is driven by how much
 * was actually said, and this is where the scene says so out loud. And two
 * days later, the first thing she ever kept lights up and runs back into the
 * day being worked: growth that pays off, not growth that only accumulates.
 *
 * Elapsed time is carried by light and rhythm alone. A day fades one step
 * further with every day that passes, never to nothing — the talk is still
 * there, it is just behind her. There is no clock, no date and no counter
 * anywhere in the frame.
 *
 * It ends on the shelf. The talk band drops to one quiet floor, everything she
 * has kept lifts together, and the last four seconds are still.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a stage's name or a sentence she wrote.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins the stretch halfway.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a frame inside
 * the hold where all five days are lived, everything kept is on the shelf and
 * still joined to its day, and the recall is still traced across the field. It
 * deliberately does NOT rewind: the still frame makes the whole argument at
 * once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty stretch and no days lived yet. */
const START_TICK = 0;

export default function LastingMemoryEveryNight() {
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
  // stretch instead of a half-lived one.
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

        {/* The illustration — five days, three bands, one of them growing.
            The floor the percent geometry is budgeted against (see ./layout);
            below it the written accounts crowd their own type. */}
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
