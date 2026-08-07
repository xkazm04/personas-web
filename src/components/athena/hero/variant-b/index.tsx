"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AthenaOrb from "@/components/sections/companion/AthenaOrb";
import { tint } from "@/lib/brand-theme";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { HERO_COPY, SPOKEN_SENTENCE, TERMINALS } from "./data";
import { phaseAtLeast, useConductorCycle } from "./useConductorCycle";
import WaveformStrip from "./WaveformStrip";
import FleetPlanCard from "./FleetPlanCard";
import TerminalGrid from "./TerminalGrid";

/**
 * Athena hero — variant B, "The Conductor". The hero IS a looping cinematic
 * sequence of Athena's signature moment: a spoken sentence becomes an
 * editable fleet plan becomes eight running terminals. Typography lives in
 * its own scrim column; the sequence stage is the argument.
 */

export default function AthenaHeroVariantB() {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const { phase, typedCount, litCount } = useConductorCycle(
    SPOKEN_SENTENCE.length,
    TERMINALS.length,
  );

  const listening = phase === "listen";
  const typedDone = typedCount >= SPOKEN_SENTENCE.length;
  const planVisible = phaseAtLeast(phase, "plan");
  const dispatched = phaseAtLeast(phase, "ignite");
  const railActive = listening ? 0 : phase === "plan" || phase === "edit" ? 1 : phase === "confirm" ? 2 : 3;

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background wash */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: `radial-gradient(60% 50% at 72% 18%, ${tint("cyan", 8)}, transparent 70%), radial-gradient(50% 45% at 15% 85%, ${tint("purple", 7)}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-24">
        {/* ── Scrim zone: typography ── */}
        <motion.div
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-xl"
        >
          <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-[0.25em] text-brand-cyan">
            {HERO_COPY.eyebrow}
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            {HERO_COPY.headlineTop}
            <br />
            <span className="text-brand-cyan">{HERO_COPY.headlineAccent}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-base leading-relaxed text-foreground/70 sm:text-lg">
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

        {/* ── Sequence stage: the art ── */}
        <div
          aria-hidden="true"
          className="force-dark relative rounded-3xl border border-glass bg-background/85 p-4 shadow-[0_0_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-6"
        >
          {/* Conduction beam behind the pipeline */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tint("cyan", 22)} />
                <stop offset="100%" stopColor={tint("cyan", 0)} />
              </linearGradient>
            </defs>
            <rect x="7%" y="0" width="1.5" height="100%" fill={`url(#${uid}-beam)`} />
          </svg>

          {/* Conductor row: orb + label + phase rail */}
          <div className="mb-4 flex items-center gap-3">
            <div className="w-16 shrink-0 sm:w-20">
              <AthenaOrb brand="cyan" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
                {HERO_COPY.orbLabel}
              </p>
              <p className="text-xs text-muted-dark">{HERO_COPY.orbSub}</p>
            </div>
            <div className="ml-auto hidden items-center gap-2.5 sm:flex">
              {HERO_COPY.phaseRail.map((label, i) => (
                <span
                  key={label}
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    i === railActive ? "text-brand-cyan" : "text-muted-dark"
                  }`}
                >
                  {label}
                </span>
              ))}
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
          />
          <FleetPlanCard
            visible={planVisible}
            edited={phaseAtLeast(phase, "edit")}
            confirming={phase === "confirm"}
            dispatched={dispatched}
          />
          <div
            className="mx-auto h-3 w-px"
            style={{ backgroundColor: tint("cyan", dispatched ? 45 : 15) }}
          />
          <TerminalGrid litCount={litCount} />
        </div>
      </div>
    </section>
  );
}
