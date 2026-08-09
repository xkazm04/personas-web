"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION, ANNOTATION_DIM, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import SurfaceScene from "./parts/SurfaceScene";

/**
 * Section 2 — "Two surfaces. Nothing else." · variant B, "Never Neither".
 *
 * The doctrine's engineering consequence made playable: one pending
 * decision, two complementary homes. The visitor's toy is a real
 * chat-open/chat-closed switch — flip it and the decision springs out of
 * the chat and docks at the orb (shared-layout hop + trace pulse), flip
 * back and it returns. The condition logic reads like source in the mono
 * annotation voice; the invariant is the headline.
 *
 * AthenaStage wraps the section for standalone preview only — the
 * wrapper unwraps at page assembly (the page owns one stage).
 *
 * Reduced motion gates `animate`/transition props, never markup: reveals
 * render static, the hop becomes an instant swap, the toggle still works.
 */
export default function TwoSurfacesNeverNeither() {
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState(true);
  const [hopTick, setHopTick] = useState(0);

  const flip = () => {
    setOpen((o) => !o);
    setHopTick((t) => t + 1);
  };

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
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto w-full max-w-4xl">
          {/* Typography zone — the art never fights this block */}
          <div className="text-center">
            <motion.p {...pop(0.05, 2)} className={ANNOTATION_DIM}>
              {COPY.eyebrow}
            </motion.p>
            <motion.h2 {...pop(0.12)} className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              {COPY.headline}
            </motion.h2>
            <motion.p {...pop(0.2, 1)} className="mx-auto mt-4 max-w-xl text-base text-foreground/80 sm:text-lg">
              {COPY.sub}
            </motion.p>
          </div>

          {/* The toy — a real switch; its state IS the demo's condition */}
          <motion.div {...pop(0.28, -1)} className="mt-10 flex justify-center">
            <button
              type="button"
              role="switch"
              aria-checked={open}
              aria-label={COPY.toggleAria}
              onClick={flip}
              className="flex items-center gap-3 rounded-full border border-glass bg-surface/60 px-4 py-2 transition-colors hover:border-glass-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
            >
              <span className={open ? ANNOTATION : ANNOTATION_DIM}>{COPY.toggleOpen}</span>
              <span
                className="relative h-5 w-10 rounded-full transition-colors"
                style={{ background: open ? tint("cyan", 30) : tint("cyan", 12) }}
                aria-hidden="true"
              >
                <motion.span
                  className="absolute top-0.5 h-4 w-4 rounded-full"
                  style={{ background: BRAND_VAR.cyan }}
                  animate={{ left: open ? 2 : 22 }}
                  transition={reduced ? { duration: 0 } : SPRING_POP}
                />
              </span>
              <span className={open ? ANNOTATION_DIM : ANNOTATION}>{COPY.toggleClosed}</span>
            </button>
          </motion.div>
          <span className="sr-only" aria-live="polite">
            {open ? COPY.liveChat : COPY.liveOrb}
          </span>

          {/* The scene — two homes, one decision, never neither */}
          <motion.div {...pop(0.36, 1)} className="mt-10">
            <SurfaceScene open={open} hopTick={hopTick} />
          </motion.div>

          {/* The condition logic, read like source; invariant stays lit */}
          <motion.p {...pop(0.44, -1)} className="mt-12 text-center">
            <span className={open ? ANNOTATION : ANNOTATION_DIM}>{COPY.logic.chatBranch}</span>
            <span className={`${ANNOTATION_DIM} mx-2`}>{COPY.logic.sep}</span>
            <span className={open ? ANNOTATION_DIM : ANNOTATION}>{COPY.logic.orbBranch}</span>
            <span className={`${ANNOTATION_DIM} mx-2`}>{COPY.logic.sep}</span>
            <span className={ANNOTATION}>{COPY.logic.invariant}</span>
          </motion.p>

          {/* Quiet counter beat — the queue itself has no off switch */}
          <motion.p
            {...pop(0.52, 1)}
            className={`mt-4 text-center ${ANNOTATION_DIM} normal-case tracking-wide text-[11px]`}
          >
            {COPY.counterBeat}
          </motion.p>
        </div>
      </section>
    </AthenaStage>
  );
}
