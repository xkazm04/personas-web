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
 * Section 6, variant B — "Pick it up where you left it".
 *
 * The page's closing section. Where variant A renders the architecture of one
 * shared mind, B renders what living with it actually feels like: you never
 * re-explain yourself.
 *
 * The story the deterministic clock tells: on one ordinary day you are talking
 * about the roadmap, and you mention one thing in passing — you are away from
 * the 12th, Dana covers. She says "Noted." Days pass, and the distance between
 * the conversations on screen IS the days; there is no calendar anywhere in
 * this section. Somewhere else entirely, in a conversation about the release,
 * you ask a question that has nothing to do with being away — and the message
 * you were about to type, the one re-explaining what you already said, appears
 * in the box and clears itself before you send it. Her answer already worked
 * around it. More days pass, further this time. In a third conversation you ask
 * something with no context in it at all, and she answers it plainly, from the
 * thing you said once. Then all three come back up at the same strength, the
 * line under them lights end to end, and what never happened gets named.
 *
 * The soul of it is that there is one of her and she TRAVELS. She is never
 * duplicated across the three conversations and nothing is ever handed over
 * between them — she simply kept going, which is why the third conversation
 * knows what the first one was told.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is somebody's message, a conversation's
 * subject, or the closing mark.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins on a day they did not
 * watch begin.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, where all three
 * conversations are lit at one strength, both lines have surfaced and the
 * closing mark has landed. It deliberately does NOT rewind: a section about
 * continuity has to hold still on the frame where the continuity is visible.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: three empty outlines and a day about to start. */
const START_TICK = 0;

export default function OneMindContinuity() {
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

  // Reduced motion pins the finished still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // story instead of one conversation and two empty outlines.
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

        {/* The illustration — three conversations, days apart, and one thing
            you said once still doing work in all of them. The floor the
            percent geometry is budgeted against (see ./layout); below it the
            conversations crowd their own type. */}
        <div className="relative min-h-[32rem] flex-1 md:min-h-[36rem]">
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
