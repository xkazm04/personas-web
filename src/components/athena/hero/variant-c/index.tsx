"use client";

import { motion, useReducedMotion } from "framer-motion";
import AthenaStage from "../../stage/AthenaStage";
import { ANNOTATION, ANNOTATION_DIM, REPLAY, SPRING_POP } from "../../stage/athena-tokens";
import { BRAND_VAR, brandShadow } from "@/lib/brand-theme";
import { COPY, HEARD_SENTENCE } from "./data";
import { useSummonGesture } from "./useSummonGesture";
import SummonOrb from "./SummonOrb";
import SummonReadout from "./SummonReadout";
import ReplyCard from "./ReplyCard";

/**
 * Athena hero — variant C, "The Summons".
 *
 * The hero IS the product's real gesture grammar, playable. The visitor
 * doesn't watch Athena — they summon her, performing the exact desktop
 * gesture: press and hold the orb (the real 220 ms threshold), speak
 * (simulated), release, and she answers with a reply card and real
 * quick-reply chips. Unlike variant A (passive cinematic presence) and
 * variant B (autoplaying voice-to-fleet sequence), nothing happens here
 * until the visitor performs the gesture themselves.
 *
 * State machine lives in useSummonGesture; the scene renders on the
 * shared AthenaStage canvas and never paints its own background.
 */

export default function AthenaSummonsHero() {
  const reduced = useReducedMotion() ?? false;
  const { phase, tooQuick, heardCount, reset, bind } = useSummonGesture(HEARD_SENTENCE.length);

  /** Springy staggered entrance with slight rotation; a no-op under reduced motion. */
  const enter = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16, rotate: i % 2 ? 0.6 : -0.6 },
          whileInView: { opacity: 1, y: 0, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay: i * 0.07 },
        };

  return (
    <AthenaStage className="min-h-dvh">
      <section className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        {/* ── Typography scrim zone — the art never fights it ── */}
        <div className="max-w-2xl text-center">
          <motion.p {...enter(0)} className={ANNOTATION}>
            {COPY.eyebrow}
          </motion.p>
          <motion.h1
            {...enter(1)}
            className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
          >
            {COPY.headline}
          </motion.h1>
          <motion.p {...enter(2)} className="mt-4 text-base text-foreground/75 sm:text-lg">
            {COPY.sub}
          </motion.p>
          <motion.div
            {...enter(3)}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 32, 28) }}
            >
              {COPY.ctaPrimary}
            </a>
            <a
              href="#"
              className="rounded-full border border-glass px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-glass-hover"
            >
              {COPY.ctaSecondary}
            </a>
          </motion.div>
        </div>

        {/* ── The playable scene: orb, readout, her answer ── */}
        <div className="mt-8 flex w-full flex-1 flex-col items-center justify-center gap-5 sm:mt-10">
          <SummonOrb phase={phase} bind={bind} />
          <div className="flex min-h-[210px] w-full flex-col items-center gap-4">
            <SummonReadout phase={phase} tooQuick={tooQuick} heardCount={heardCount} />
            {phase === "answered" && <ReplyCard onReset={reset} />}
          </div>
        </div>

        <p className={`${ANNOTATION_DIM} mt-6 text-center`}>{COPY.statWhisper}</p>
      </section>
    </AthenaStage>
  );
}
