"use client";

import { useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { EASE_CURVE } from "@/lib/animations";
import { tint } from "@/lib/brand-theme";
import HeroFrame from "./shared/HeroFrame";
import { useHeroClock } from "./shared/useHeroClock";
import { CYCLE, INITIAL_TICK, TICK_MS, eventsAt, momentAt } from "./data";
import Stream from "./Stream";
import Voice from "./Voice";
import River from "./River";

/** Where the line sits in the art band, and how tall her voice may rise. */
const ART_VARS = { "--line-y": "61%", "--wave-h": "clamp(5rem, 38cqh, 26rem)" } as CSSProperties;

/**
 * Athena lab - hero v3, "The Quiet Line".
 *
 * One long line of light crosses the whole screen, and your day streams along
 * it, right to left, through a single bright point at its centre: her. Most
 * of it she lets pass - a newsletter, a green build, a calendar sync - and
 * the line stays flat. Three times a loop something matters: it arrives
 * amber, she takes it in, and the line itself swells into her voice for one
 * short sentence, then lies flat again. The tagline, drawn as a line.
 *
 * Where v2 is space (an eye that sees everything at once), this is time: a
 * day passing, and the few moments worth a word. The point is a real button -
 * press it and she answers you.
 *
 * Reduced motion pins INITIAL_TICK: mid-sentence, voice held at rest height,
 * the passing events caught on the line, no drift.
 */
export default function AthenaLabHeroV3() {
  const { t } = useTranslation();
  const lab = t.athenaSections.hero;
  const sectionRef = useRef<HTMLElement>(null);
  const { phase, live, reduced } = useHeroClock(sectionRef, { cycle: CYCLE, tickMs: TICK_MS, initial: INITIAL_TICK });

  const status = lab.quiet.status
    .replace("{events}", eventsAt(phase).toLocaleString())
    .replace("{spoken}", String(momentAt(phase).spoken));

  return (
    <HeroFrame sectionRef={sectionRef} status={status}>
      <div className="relative h-[52svh] min-h-[20rem] stage:h-full stage:min-h-0">
        <motion.div
          role="group"
          aria-label={lab.quiet.aria}
          className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
          style={ART_VARS}
          {...(reduced
            ? {}
            : { initial: { opacity: 0, scaleX: 0.6 }, animate: { opacity: 1, scaleX: 1 }, transition: { duration: 1.4, ease: EASE_CURVE } })}
        >
          {/* Horizon light, and the river of small things she lets pass */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 46% 26% at 50% var(--line-y), ${tint("cyan", 16)}, transparent 70%)`,
            }}
          />
          <River speaking={momentAt(phase).speaking} live={live} />
          <Stream phase={phase} live={live} reduced={reduced} hushed={momentAt(phase).speaking} />
          <Voice phase={phase} live={live} reduced={reduced} />
        </motion.div>
      </div>
    </HeroFrame>
  );
}
