"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { COPY, ATTENTION_CHIPS } from "./data";
import { SILENCE_AT } from "./geometry";
import QuietStage from "./QuietStage";

/**
 * Athena hero — variant C, "The Quiet".
 *
 * Editorial statement of the two-surfaces doctrine: a field of UI noise
 * silences itself into the orb and the chat, and what remains is oversized
 * type and negative space. Reduced motion shows the finished composition.
 */
export default function AthenaHeroQuiet() {
  const reduced = useReducedMotion() ?? false;
  const enter = (delay: number) =>
    reduced ? { duration: 0 } : { delay, duration: 0.7, ease: "easeOut" as const };
  const from = reduced ? false : { opacity: 0, y: 24 };
  const quiet = SILENCE_AT; // typography lands as the stage falls silent

  return (
    <section
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-background"
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 60% at 70% 30%, ${tint("cyan", 6)}, transparent)`,
      }}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-8 lg:px-10">
        {/* Typographic zone — the art never enters this column */}
        <div className="max-w-xl">
          <motion.p
            className="text-xs font-mono uppercase tracking-[0.25em] text-muted-dark"
            initial={from}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.1)}
          >
            {COPY.eyebrow}
          </motion.p>

          <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <motion.span
              className="block"
              initial={from}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.3)}
            >
              {COPY.headlineLine1}
            </motion.span>
            <motion.span
              className="block"
              style={{ color: BRAND_VAR.cyan }}
              initial={from}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(quiet - 0.2)}
            >
              {COPY.headlineLine2}
            </motion.span>
          </h1>

          <motion.p
            className="mt-6 max-w-md text-base leading-relaxed text-foreground/75 sm:text-lg"
            initial={from}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(quiet + 0.15)}
          >
            {COPY.sub}
          </motion.p>

          {/* The six chips that replaced six stacked panels */}
          <motion.div
            initial={from}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(quiet + 0.4)}
            className="mt-8"
          >
            <div className="flex flex-wrap gap-2">
              {ATTENTION_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-glass px-3 py-1 text-xs font-mono text-foreground/70"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-dark">{COPY.chipsCaption}</p>
          </motion.div>

          <motion.p
            className="mt-6 flex items-center gap-2 text-sm text-foreground/70"
            initial={from}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(quiet + 0.55)}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              aria-hidden="true"
            />
            {COPY.nudgeNote}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={from}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(quiet + 0.7)}
          >
            <a
              href="#"
              className="rounded-xl px-6 py-3 text-sm font-semibold text-background"
              style={{
                backgroundColor: BRAND_VAR.cyan,
                boxShadow: `0 0 32px ${tint("cyan", 30)}`,
              }}
            >
              {COPY.ctaPrimary}
            </a>
            <a
              href="#"
              className="rounded-xl border border-glass px-6 py-3 text-sm font-medium text-foreground/80 transition-colors hover:border-glass-hover"
            >
              {COPY.ctaSecondary}
            </a>
          </motion.div>
        </div>

        {/* The art — noise silencing into two surfaces */}
        <QuietStage />
      </div>
    </section>
  );
}
