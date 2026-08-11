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
 * Her workshop, variant C — "The Fence".
 *
 * Every other section on this page sells what she can do. This one sells what
 * she cannot, on the theory that to anyone who would actually hand real work
 * to an assistant, that is the more persuasive half.
 *
 * The scene is a yard. You draw a line, you name the places inside it, and she
 * stands in them. Then you turn a dial that is outside the line — the one
 * control in the frame, and it is not hers — and what is going on inside
 * multiplies: one piece of work, then three, then every slot in the yard at
 * once. The line is not redrawn at any point during that. It is the same path
 * in the same place, and it makes one bright pass end to end to say so.
 *
 * Then the beat the section exists for. A piece of work appears above the
 * line, outside the yard. She reaches for it and the reach stops dead at the
 * boundary, with empty space between where it ends and what it was reaching
 * for. Nothing on screen refuses her — there is no cross, no bar, no lock. She
 * simply stops, the line brightens where she touched it, and the work above it
 * picks up the only words it will ever have: waits for you. The dial is still
 * at its highest stop while that happens, which is the entire claim: how much
 * she does on her own and how far she may go are two different settings, and
 * only one of them is a dial.
 *
 * It ends on the line. The yard finishes what it started, the frame steps
 * back, and the boundary takes the last breath in the scene alone.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is the name of a place you opened, a chore, or
 * the dial's own setting.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins a yard that is already full
 * and misses who filled it.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the frame inside
 * the closing stillness where the line is drawn and named, every place is full
 * and finished, the dial is at its highest stop, and the work above the line is
 * still an outline with her mark stopped on the boundary beneath it. It
 * deliberately does NOT rewind: the still frame makes the whole argument at
 * once, and it is the same frame the moving version ends on.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns one
 * shared stage and sections inherit it.
 */

/** The true top of the loop: an empty field with the line not yet drawn. */
const START_TICK = 0;

export default function HerWorkshopFence() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { intro, status } = t.athenaPage.workshop;
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
  // argument instead of a half-drawn line.
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

        {/* The illustration — a yard, and the one thing that never moves.
            The floor the percent geometry is budgeted against (see ./layout);
            below it the places you opened crowd their own type. */}
        <div className="relative min-h-[36rem] flex-1">
          <Field scene={scene} layout={layout} reduced={reduced} />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2.5">
          {/* The console light stops blinking once the yard is finished — the
              status line is part of the frame, and the frame is settling. */}
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={{ opacity: reduced || scene.calm ? 1 : [1, 0.25, 1] }}
            transition={
              reduced || scene.calm
                ? { duration: 0.6 }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
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
