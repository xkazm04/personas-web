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
import { CYCLE, INITIAL_TICK, PARK_TICK, TICK_MS, sceneAt } from "./data";
import Field from "./Field";
import { layoutFor } from "./layout";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 6, variant C — "The Return" (one mind), and the last section of the
 * page.
 *
 * Every other section on this page moves outward: one avatar becomes a
 * workspace, one sentence becomes a team, one portfolio spreads across a
 * field. This one runs the other way. The conversations you have going sit
 * around the edge, she sits at the centre, and when you ask one of them
 * something none of its own history can answer, every OTHER conversation
 * gives up what it holds and the whole scene arrives at one point. The
 * answer comes back down a single thread, one line per beat, each line still
 * joined to the conversation it came from — and it stays joined, so the last
 * frame of the page is one you can trace claim by claim back to its source.
 *
 * Three of the conversations are the page's own earlier sections at watermark
 * scale (the workspace, the team, the portfolio), and those three are the ones
 * she answers from: everything you were shown, she was holding the whole time.
 *
 * The closing beats are what make this a closing rather than another
 * demonstration. At the one-voice beat every panel in the frame washes with
 * the same accent at the same instant, and the six lights that were blinking
 * out of step fall into step. Then six ticks of genuine stillness: nothing new
 * arrives, the beads stop, and the whole frame settles onto one shared 4.4s
 * breath. The page is allowed to end.
 *
 * Every word outside the illustration is the SectionIntro trio plus one mono
 * status line; everything else is a conversation's own name, your question, or
 * her answer.
 *
 * The clock only runs while the section is on screen (useInView, 40%), and
 * rewinds to tick 0 on every entry so nobody joins the gather half-drawn.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, a frame inside
 * the hold. It deliberately does NOT rewind, and the frame it pins is the same
 * one the moving version ends on, so both versions of the page end on the
 * identical last image.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the loop: a ring of outlines and nothing said yet. */
const START_TICK = 0;

export default function OneMindReturn() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { intro, status } = t.athenaPage.oneMind;
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
  // clock, so a visitor who flips the preference mid-loop lands on the ending
  // instead of a half-gathered scene.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const layout = layoutFor(compact);
  const scene = sceneAt(phase, layout.cards.length);

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

        {/* The illustration — everything she is holding, arriving at one point.
            The floor the percent geometry is budgeted against (see ./layout);
            below it the open conversation crowds its own type. */}
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
