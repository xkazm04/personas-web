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
import { TOTAL } from "./readings";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 5, variant B — "Worst First" (she holds your whole portfolio).
 *
 * The argument is that attention is a RANKING problem. Somebody watching a
 * hundred things for you is worth very little if the hundredth thing they
 * mention is the one that was about to take the site down; the value is in the
 * order, and in her being willing to say which one is first.
 *
 * So the deterministic clock tells it as a narrowing, and the narrowing is the
 * motion: a lattice of every check on every project you own composes, dense
 * enough that reading it yourself is visibly not a plan; she rides down it and
 * the field fills in CHECKED behind her, one project per beat; the few that are
 * not fine flag where they sit and then lift out of the plane; they land in a
 * short list in the order she happened to find them, which is worth nothing,
 * and then physically overtake each other into the order that will cost you
 * most; the top one grows open — what it is, the shape of how long it has been
 * sliding, and the one sentence she actually found — with the rest of the list
 * still under it; and it closes on the one step that resolves it.
 *
 * Many → few → ordered → one. Every word outside the illustration is the
 * SectionIntro trio plus one mono status line.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a field half-surveyed.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame where
 * the lattice is checked end to end, four readings are ranked, the worst is
 * open and the one step has committed. It deliberately does NOT rewind: the
 * still frame makes the whole argument at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: an empty field and nothing checked. */
const START_TICK = 0;

export default function WholePortfolioWorstFirst() {
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
  // clock, so a visitor who flips the preference mid-loop lands on the ranked
  // answer instead of a half-read field.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const layout = layoutFor(compact);
  const scene = sceneAt(phase, layout.rows);
  const total = TOTAL(layout);

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

        {/* The illustration — a hundred readings narrowing to the one that
            deserves you. The floor the percent geometry is budgeted against
            (see ./layout); below it the lattice would shrink under its own
            type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field L={layout} scene={scene} reduced={reduced} />
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
            {statusAt(phase, layout.rows, total)}
          </span>
          <span className={`truncate whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
            {statusShortAt(phase, layout.rows, total)}
          </span>
        </div>
      </section>
    </AthenaStage>
  );
}
