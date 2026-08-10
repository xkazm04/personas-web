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
 * Lasting memory, variant B — "The Archive".
 *
 * Every visitor arrives at this section with the same assumption: that an
 * assistant which gets tidier over time must be getting emptier, and that
 * something it stops mentioning is something it threw away. The section has
 * exactly one job, which is to refute that in front of them without ever
 * saying so.
 *
 * So the scene is stratified rather than sequenced. Every conversation you
 * have ever had lies along the floor of the frame, framed, permanent, and
 * only ever getting longer. Above it, each durable thing she knows is joined
 * by a hairline to the exact conversation it came out of. Above THAT, a lit
 * band holds the few she is working from today.
 *
 * The loop learns something new — a conversation opens, the record extends,
 * and a new answer rises into the light cited to the conversation that made
 * it. Then the older answer to the same question goes quiet where it stands
 * and settles down its own thread, across the seam, into the layer below.
 * It never leaves the frame, its words never stop being readable, and the
 * end of its thread fixed to its conversation never moves at all. Where it
 * stood, an outline stays open: the lit band really did get roomier.
 *
 * It closes on the beat the whole design turns on — she names the thing that
 * would go quiet first, and then spends a whole beat not touching it.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a thing you told her, a zone of the field,
 * or something she says standing on the seam.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins mid-settle.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a frame inside
 * the hold where all three strata are complete at once. It deliberately does
 * NOT rewind, because that still frame is the whole argument in one image.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty field and nothing said yet. */
const START_TICK = 0;

export default function LastingMemoryArchive() {
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

  // Reduced motion pins the assembled still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // archive instead of a half-settled card.
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

        {/* The illustration — everything she has ever been told, and the few
            things she is working from today. The floor the percent geometry
            is budgeted against (see ./layout); below it the record crowds its
            own type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field scene={scene} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          {/* The console light stops blinking once the frame is holding — the
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
