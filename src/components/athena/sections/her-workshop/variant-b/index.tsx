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
 * The her-workshop section, variant B — "The Workshop".
 *
 * The section before this one argues that one sentence becomes a working team.
 * This one argues something else entirely, and never re-argues that: she does
 * not have A TOOL, she has a workshop — several different kinds of machinery,
 * each doing its own kind of work at its own pace — and every one of them
 * reports to the same desk.
 *
 * So the scene is five visibly different instruments composing one at a time
 * around a single desk, and the difference between them is the whole point:
 *
 *   filled lanes    work she has hands on right now, several at once, each
 *                   moving at its own rate. One lands while you watch.
 *   still cards     work waiting its turn — and it keeps waiting. It moves at
 *                   exactly one moment, when you press start, and then it walks
 *                   over and takes the free slot on the bench.
 *   a dial          standing orders, rim crowded, pointer working round. It
 *                   keeps perfect time and needs nobody.
 *   dashed tracks   things arriving constantly at no rhythm at all — a file
 *                   changing, an event landing, a job upstream handing on.
 *   a far bench     a second machine at the edge of the field. It pairs — one
 *                   six-digit code, both screens, the same instant — and then
 *                   it stands there, lit and ready. It never runs anything,
 *                   because in truth it never has (see `./data`).
 *
 * By the end, four unrelated rhythms are running at once and the field reads as
 * several clocks rather than one. The beat the section exists for lands late: a
 * standing order comes round and a track trips, nobody presses anything, and
 * the desk simply absorbs both.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is the name of a bench or the name of a piece of
 * work.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a half-built workshop.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame where
 * every bench is up, the queued piece is on the bench, the order has come
 * round, the track has tripped and the far bench is paired and idle. It
 * deliberately does NOT rewind: the still frame makes the whole argument at
 * once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns one
 * shared stage and sections inherit it.
 */

/** The true top of the loop: a dark desk and five empty places around it. */
const START_TICK = 0;

export default function HerWorkshopTheWorkshop() {
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

  // Reduced motion pins the assembled still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // floor instead of a half-wired one.
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

        {/* The illustration — five kinds of machinery, one desk.
            The floor the percent geometry is budgeted against (see ./layout);
            below it the benches crowd their own type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field scene={scene} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          {/* The light never stops here, even in the hold — a workshop that
              went still would be arguing the opposite of this section. */}
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
