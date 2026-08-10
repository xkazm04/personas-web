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
 * Section 6, variant A — "One mind" (the page's closing section).
 *
 * The direct rendering of the claim: you can keep as many conversations with
 * her as you like, and she is the same person in every one of them.
 *
 * The story the deterministic clock tells: several conversations exist at
 * once, each visibly its own place — its own subject, its own last exchange,
 * its own state, one waiting on you and one still working while you are not
 * looking at it. Under all of them is ONE body of memory they all draw on,
 * with a thread from each. Then the spine of the whole thing: you tell ONE
 * conversation something small and concrete, and the words themselves lift out
 * of it and come to rest in that shared body — and the instant they land,
 * every other conversation has them. So when you ask a question somewhere else
 * entirely, in a conversation that was never told, she answers with the fact
 * she never saw there, and says where she learned it. The words in the answer
 * are the words you typed. Then every thread lights at once: the conversations
 * differ, she does not.
 *
 * The proof that she is one rather than many is structural rather than
 * asserted — there is exactly ONE of her on the field, she travels between the
 * seats each conversation holds open for her, and the conversation she is not
 * in keeps working the whole time she is away.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a subject, a line someone typed, a state
 * chip or the thing she now knows.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a conversation halfway.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame where
 * the fact is visible in all three of its places at once (said, kept, used).
 * It deliberately does NOT rewind: the still frame has to be the frame the
 * whole chain was for.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty field and the shape of a few places. */
const START_TICK = 0;

export default function OneMindEverywhere() {
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
  // argument instead of a half-composed field.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const layout = layoutFor(compact);
  const scene = sceneAt(phase, layout.panels.length);

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

        {/* The illustration — several conversations, and the one mind behind
            all of them. The floor the percent geometry is budgeted against
            (see ./layout); below it the field crowds its own type.
            The narrow floor is the taller of the two on purpose: stacked
            conversations need more height than a row of them does, and the
            answer to a field that is short of room is fewer things in it, not
            smaller words in it. On a short phone the section grows past the
            viewport rather than shrinking its own type. */}
        <div className="relative min-h-[40rem] flex-1 md:min-h-[36rem]">
          <Field scene={scene} layout={layout} compact={compact} reduced={reduced} />
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
