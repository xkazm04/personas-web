"use client";

import { motion, useReducedMotion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import {
  ANNOTATION, ANNOTATION_DIM, HEADLINE, REPLAY, SPRING_POP, SUBLINE,
} from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import { VIEW_W, VIEW_H } from "./geometry";
import { EditorWindow, PresenceGlow, HeldCounter } from "./parts";
import { NotificationFlights } from "./flights";

/**
 * Section 2, variant A — "Focus, kept" (round 2, benefit-first).
 *
 * The illustration is the visitor's own screen during deep work. Seven
 * interruptions erupt over it with kp spring physics, then every one lifts
 * off and streams along a thin traced arc into one calm glow at the
 * screen's edge. The work visibly heals — the editor re-expands, a line
 * types itself, the caret blinks again — and a small counter proves the
 * point: nothing was lost, it was held.
 *
 * AthenaStage wraps this prototype for standalone preview; it unwraps at
 * page assembly (the page owns one background wholesale).
 *
 * Reduced motion renders the healed end-state — pristine screen, bright
 * glow, counter visible — by gating `animate`/`whileInView` props only;
 * no element is ever dropped.
 */
export default function AttentionFocusKept() {
  const reduced = useReducedMotion() ?? false;

  /** Spring pop-in with a slight settle-rotation; replays on re-entry. */
  const pop = (delay: number, rotate = -2) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.96, rotate },
          whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <AthenaStage>
      <section className="relative flex min-h-[90vh] items-center px-6 py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Copy zone — the story: what the visitor gains */}
          <div className="max-w-xl">
            <motion.p {...pop(0.05, 2)} className={ANNOTATION_DIM}>
              {COPY.eyebrow}
            </motion.p>
            <motion.h2 {...pop(0.14)} className={`mt-4 ${HEADLINE}`}>
              {COPY.headline}
            </motion.h2>
            <motion.p {...pop(0.24, 1)} className={`mt-5 ${SUBLINE}`}>
              {COPY.subline}
            </motion.p>
            {/* The one annotation garnish */}
            <motion.p {...pop(0.34, -1)} className={`mt-8 ${ANNOTATION}`}>
              {COPY.garnish}
            </motion.p>
          </div>

          {/* The visitor's screen — chaos erupts, streams away, work heals */}
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.97 },
                  whileInView: { opacity: 1, scale: 1 },
                  viewport: REPLAY,
                  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
                })}
            className="relative w-full"
          >
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="h-auto w-full"
              role="img"
              aria-label={COPY.sceneAria}
            >
              <EditorWindow reduced={reduced} />
              <NotificationFlights reduced={reduced} />
              <PresenceGlow reduced={reduced} />
              <HeldCounter reduced={reduced} />
            </svg>
          </motion.div>
        </div>
      </section>
    </AthenaStage>
  );
}
