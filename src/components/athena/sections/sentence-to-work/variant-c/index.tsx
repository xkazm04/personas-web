"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { staggerContainer } from "@/lib/animations";
import { AskPanel } from "./AskPanel";
import { Constellation } from "./Constellation";
import { Field } from "./Field";
import { SummaryPanel } from "./SummaryPanel";
import { AthenaKeeper, YouMark } from "./Presence";
import {
  COPY,
  CYCLE,
  INITIAL_TICK,
  TICK_MS,
  atStage,
  duskAt,
  goneAt,
  layoutFor,
  lightAt,
  sceneStateAt,
} from "./data";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 4, variant C — "You Left. It Kept Going."
 *
 * The other prototypes of this section stage the moment work begins. This one
 * is about the hours after it — the actual felt benefit of handing something
 * over, which is not that it starts, but that you get to leave.
 *
 * One full-bleed field, no window and no app. Late in the day you say a single
 * plain sentence into it; Athena offers a plan with your pencil already on it;
 * you say go — and only then does anything move. Then you walk off the field
 * and your mark goes with you, leaving a dashed outline where you stood.
 *
 * The work does not stop. Eight small lights come up in the sky and run on
 * their own while the field's own light drains warm, goes deep, and comes back
 * cool — a whole night told entirely in brand tints, with no clock face and no
 * literal sky anywhere. One light reaches something only you can answer, and it
 * does the one thing that earns trust: it waits. Steady amber, all night, never
 * failed and never guessed.
 *
 * You come back to a field already lifting, and to one composed answer rather
 * than a pile: three things finished in your own words, a count for the quiet
 * rest, and the single question that is still yours to settle — in the same
 * amber that has been holding out there since the middle of the night.
 *
 * The clock only runs while the section is on screen and rewinds to tick 0 on
 * every entry, so nobody joins this story after you have already left.
 *
 * Reduced motion pins tick 24: you are back, everything has resolved, the
 * answer is composed and the one question is on it — the whole night in one
 * still frame.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */
export default function SentenceToWorkNightfall() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(INITIAL_TICK);

  // Rewind to the top of the evening whenever the section (re-)enters view.
  // Render-time prev-state pattern — React 19 forbids sync setState in an
  // effect body.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(0);
  }

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Reduced motion pins the finished still outright rather than freezing the
  // clock, so flipping the preference mid-loop lands on the whole story rather
  // than on the middle of somebody's night.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const scene = sceneStateAt(phase);
  const layout = layoutFor(compact);
  const gone = goneAt(phase);

  return (
    <AthenaStage>
      <section ref={sectionRef} className="relative min-h-dvh overflow-hidden">
        <Field
          light={lightAt(phase)}
          dusk={duskAt(phase)}
          seamY={layout.seamY}
          reduced={reduced}
        >
          <Constellation
            stage={scene.stage.work}
            phase={phase}
            compact={compact}
            quiet={atStage(scene.stage.summary, "shell")}
            reduced={reduced}
          />
          <AskPanel
            rect={layout.ask}
            ask={scene.stage.ask}
            plan={scene.stage.plan}
            dim={gone}
            reduced={reduced}
          />
          <SummaryPanel rect={layout.summary} stage={scene.stage.summary} reduced={reduced} />
          <YouMark
            at={gone ? layout.away : layout.you}
            home={layout.you}
            gone={gone}
            reduced={reduced}
          />
          <AthenaKeeper at={layout.athena} mode={scene.athena} reduced={reduced} />

          {/* The one console line — inside the illustration, like every other
              word here except the title. */}
          <span
            className={`absolute inset-x-0 bottom-3 hidden text-center sm:block ${ANNOTATION_DIM}`}
          >
            {statusAt(phase)}
          </span>
          <span
            className={`absolute inset-x-0 bottom-3 text-center sm:hidden ${ANNOTATION_DIM}`}
          >
            {statusShortAt(phase)}
          </span>
        </Field>

        {/* Landing-style title trio — SectionIntro needs a motion parent
            driving hidden→visible for its fadeUp variants */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
          className="relative z-10 px-3 pt-10 sm:px-6 sm:pt-14"
        >
          <SectionIntro
            eyebrow={COPY.intro.eyebrow}
            heading={COPY.intro.heading}
            gradient={COPY.intro.gradient}
            className="mb-0"
          />
        </motion.div>
      </section>
    </AthenaStage>
  );
}
