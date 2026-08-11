"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { CYCLE, INITIAL_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 4, variant B — "The Decomposition" (sentence to work).
 *
 * Where variant A stages this inside a product screen, B makes the argument
 * STRUCTURALLY: one full-bleed field, one ordinary sentence at the top, and
 * the sentence coming apart into the work it implies.
 *
 * The story the deterministic clock tells, in order: you type one sentence in
 * your own words (the mic sits on the box the whole time — spoken and typed
 * take the identical path). Athena takes it and, phrase by phrase, the
 * sentence comes apart: a run of words lights inside the sentence, a thread
 * draws out of her, and a task card solidifies at the end of it — so every
 * task is visibly TRACEABLE to the words that produced it. What she has built
 * is a plan, not a queue: it sits there, one scope visibly changes, and
 * nothing runs until the start commits. Then all four run at once, each at its
 * own pace, and each answer draws a thread home to a single settled result —
 * which is the sentence's own last clause, answered. Loop.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is inside the art.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a sentence half-typed.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame where
 * the sentence is written, every phrase is accounted for, all four tasks are
 * done and the answer has settled. It deliberately does NOT rewind: the still
 * frame makes the whole argument at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty field and an empty request box. */
const START_TICK = 0;

export default function SentenceToWorkDecomposition() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { intro, status } = t.athenaPage.fleet;
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
  // answer instead of a half-drawn diagram.
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
            eyebrow={intro.eyebrow}
            heading={intro.heading}
            gradient={intro.gradient}
            className="mb-6 sm:mb-8"
          />
        </motion.div>

        {/* The illustration — one sentence, coming apart into the work it implies */}
        {/* The floor the percent geometry is budgeted against (see ./layout).
            Below it the field would shrink under its own type. */}
        <div className="relative min-h-[36rem] flex-1">
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
            {statusAt(phase, status)}
          </span>
          <span className={`truncate whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
            {statusShortAt(phase, status)}
          </span>
        </div>
      </section>
    </AthenaStage>
  );
}
