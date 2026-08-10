"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useIsMobile } from "@/hooks/useIsMobile";
import { staggerContainer } from "@/lib/animations";
import { AppWindow } from "./AppFrame";
import { AthenaGuide } from "./AthenaGuide";
import { DeskScene } from "./DeskScene";
import { LockBrackets, ProgressRail } from "./Overlays";
import {
  COPY,
  CYCLE,
  INITIAL_TICK,
  TICK_MS,
  layoutFor,
  lockedStopAt,
  orbAt,
  railAt,
  rectFor,
  sceneStateAt,
  travelingAt,
} from "./data";
import { statusAt, statusShortAt } from "./status";

/**
 * Section 4, variant A — "The Desk".
 *
 * A full-viewport stylized app screen where one plain sentence turns into work
 * that is already happening. It plays out in place, on a deterministic tick
 * clock, and every module COMPOSES in layers that interleave with Athena's
 * journey rather than popping in finished: a request bar frames up while she
 * crosses to it and the sentence WRITES ITSELF as she lands (a microphone and
 * its little waveform say a spoken request would take the identical path); she
 * carries it to a plan card that builds behind her, step by step, chip by
 * chip; she lands on one step and CHANGES IT — the value rolls over, a beat
 * washes the row, the step keeps an "edited" mark — because the plan is yours
 * to correct and nothing has run yet; the start control is the only thing in
 * the scene that makes anything happen, and it commits as a choreographed
 * moment; then five pieces of work ignite one after another, run beside each
 * other with their own labels and creeping bars, finish in the same staggered
 * order, and a compact summary lands.
 *
 * The only copy outside the illustration is the SectionIntro trio. Every other
 * word is an in-scene UI label, a <= 5-word caption beside her, or the mono
 * readout in the window footer.
 *
 * The clock only runs while the section is on screen (40% visible) and rewinds
 * to tick 0 on every entry, so nobody joins the story mid-sentence and nothing
 * ticks off screen.
 *
 * Reduced motion: no interval — the scene pins INITIAL_TICK, the last frame
 * that still has her in it and the first at which every module has reached its
 * final stage. It deliberately does NOT rewind: the still frame tells the
 * whole story at once.
 *
 * NOTE: the AthenaStage wrapper unwraps at assembly — the /athena page owns
 * one shared stage and sections inherit it.
 */

/** The true top of the arc: a canvas of ghosts, the window drawing itself
 *  around them, and Athena docked off the UI with nothing yet asked. */
const START_TICK = 0;

export default function SentenceToWorkDesk() {
  const reduced = useStillMotion();
  const compact = useIsMobile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(INITIAL_TICK);
  // Bumped on every (re-)entry so the chrome's compose — and the sentence
  // typing itself — replay on screen rather than off it.
  const [entries, setEntries] = useState(0);

  // Rewind whenever the section (re-)enters view. Render-time prev-state
  // pattern — React 19 forbids sync setState in a useEffect body.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) {
      setTick(START_TICK);
      setEntries((n) => n + 1);
    }
  }

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Reduced motion pins the finished still outright rather than freezing the
  // clock, so a visitor who flips the preference mid-loop lands on the whole
  // story instead of a half-built screen.
  const phase = (reduced ? INITIAL_TICK : tick) % CYCLE;
  const scene = sceneStateAt(phase);
  const locked = lockedStopAt(phase);
  const orb = orbAt(phase, compact);
  // One number that changes exactly when the window should reassemble itself:
  // at every loop top and every re-entry. Reduced motion pins it so the chrome
  // renders finished and never replays.
  const boot = reduced ? 0 : entries * CYCLE + Math.floor(tick / CYCLE);

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        className="relative flex min-h-dvh flex-col px-3 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14"
      >
        {/* Landing-style title trio — SectionIntro needs a motion parent
            driving hidden -> visible for its fadeUp variants */}
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

        <AppWindow
          boot={boot}
          reduced={reduced}
          footer={
            <>
              <ProgressRail rail={railAt(phase)} reduced={reduced} />
              <span className={`hidden shrink-0 whitespace-nowrap sm:block ${ANNOTATION_DIM}`}>
                {statusAt(phase)}
              </span>
              <span className={`shrink-0 whitespace-nowrap sm:hidden ${ANNOTATION_DIM}`}>
                {statusShortAt(phase)}
              </span>
            </>
          }
        >
          <DeskScene scene={scene} compact={compact} reduced={reduced} epoch={boot} />
          {locked && (
            <LockBrackets
              key={locked.id}
              rect={rectFor(locked.target, layoutFor(compact))}
              reduced={reduced}
            />
          )}
          <AthenaGuide
            x={orb.x}
            y={orb.y}
            caption={locked?.caption ?? null}
            captionSide={locked?.captionSide ?? "left"}
            locked={locked !== null}
            traveling={travelingAt(phase)}
            reduced={reduced}
          />
        </AppWindow>
      </section>
    </AthenaStage>
  );
}
