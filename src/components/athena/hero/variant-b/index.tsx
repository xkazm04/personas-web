"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import AthenaOrb from "@/components/sections/companion/AthenaOrb";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION, REPLAY } from "@/components/athena/stage/athena-tokens";
import { tint } from "@/lib/brand-theme";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { HERO_COPY, SPOKEN_SENTENCE, TERMINALS } from "./data";
import { phaseAtLeast, useConductorCycle } from "./useConductorCycle";
import WaveformStrip from "./WaveformStrip";
import FleetPlanCard from "./FleetPlanCard";
import TerminalGrid from "./TerminalGrid";
import CaptionRail from "./CaptionRail";

/**
 * Athena hero — variant B, "The Conductor" (round 2). The hero IS a looping
 * cinematic sequence of Athena's signature moment: a spoken sentence becomes
 * an editable fleet plan becomes eight running terminals — except the Confirm
 * beat now belongs to the visitor (participatory hero, kp lesson): the loop
 * pauses and the visitor's click ignites the fleet, auto-confirming after a
 * grace so it never stalls. Renders on the shared AthenaStage canvas; the
 * sequence replays every time it scrolls back into view.
 */

export default function AthenaHeroVariantB() {
  const reduced = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, REPLAY);
  const { phase, typedCount, litCount, confirm } = useConductorCycle(
    SPOKEN_SENTENCE.length,
    TERMINALS.length,
    inView,
  );

  const listening = phase === "listen";
  const typedDone = typedCount >= SPOKEN_SENTENCE.length;
  const planVisible = phaseAtLeast(phase, "plan");
  const dispatched = phaseAtLeast(phase, "ignite");
  const captionActive = listening ? 0 : phase === "plan" || phase === "edit" ? 1 : phase === "confirm" ? 2 : 3;

  return (
    <AthenaStage className="min-h-screen">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-24">
        {/* ── Scrim zone: typography ── */}
        <motion.div
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-xl"
        >
          <motion.p variants={fadeUp} className={ANNOTATION}>
            {HERO_COPY.eyebrow}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl"
          >
            {HERO_COPY.headlineTop}
            <br />
            <span className="text-brand-cyan">{HERO_COPY.headlineAccent}</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-base leading-relaxed text-foreground/70 sm:text-lg"
          >
            {HERO_COPY.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="rounded-xl border px-5 py-2.5 text-sm font-medium text-foreground transition-colors"
              style={{ backgroundColor: tint("cyan", 14), borderColor: tint("cyan", 40) }}
            >
              {HERO_COPY.ctaPrimary}
            </a>
            <a
              href="#"
              className="rounded-xl border border-glass px-5 py-2.5 text-sm text-foreground/80 transition-colors hover:border-glass-hover"
            >
              {HERO_COPY.ctaSecondary}
            </a>
          </motion.div>
          <motion.blockquote
            variants={fadeUp}
            className="mt-10 border-l-2 pl-4"
            style={{ borderColor: tint("cyan", 40) }}
          >
            <p className="text-sm italic leading-relaxed text-foreground/70">
              &ldquo;{HERO_COPY.quote}&rdquo;
            </p>
            <footer className="mt-1.5 font-mono text-xs text-muted-dark">
              — {HERO_COPY.quoteSource}
            </footer>
          </motion.blockquote>
        </motion.div>

        {/* ── Sequence stage: the art (NOT aria-hidden — Confirm is real UI) ── */}
        <div
          ref={stageRef}
          className="force-dark relative rounded-3xl border border-glass bg-background/85 p-4 shadow-[0_0_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-6"
        >
          {/* Conductor row: orb + label */}
          <div className="mb-4 flex items-center gap-3" aria-hidden="true">
            <div className="w-16 shrink-0 sm:w-20">
              <AthenaOrb brand="cyan" />
            </div>
            <div className="min-w-0">
              <p className={ANNOTATION}>{HERO_COPY.orbLabel}</p>
              <p className="text-xs text-muted-dark">{HERO_COPY.orbSub}</p>
            </div>
          </div>

          <WaveformStrip
            listening={listening}
            typed={SPOKEN_SENTENCE.slice(0, typedCount)}
            done={typedDone}
          />
          <div
            className="mx-auto h-3 w-px"
            style={{ backgroundColor: tint("cyan", planVisible ? 45 : 15) }}
            aria-hidden="true"
          />
          <FleetPlanCard
            visible={planVisible}
            edited={phaseAtLeast(phase, "edit")}
            confirming={phase === "confirm"}
            dispatched={dispatched}
            onConfirm={confirm}
          />
          <div
            className="mx-auto h-3 w-px"
            style={{ backgroundColor: tint("cyan", dispatched ? 45 : 15) }}
            aria-hidden="true"
          />
          <TerminalGrid litCount={litCount} />

          <CaptionRail active={captionActive} />
        </div>
      </section>
    </AthenaStage>
  );
}
