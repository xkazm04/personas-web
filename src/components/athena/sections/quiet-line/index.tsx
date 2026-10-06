"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { EASE_CURVE } from "@/lib/animations";
import { tint } from "@/lib/brand-theme";
import Shell from "./Shell";
import { useQuietClock } from "./useQuietClock";
import { CYCLE, INITIAL_TICK, TICK_MS, eventsAt, momentAt } from "./data";
import Stream from "./Stream";
import Voice from "./Voice";
import River from "./River";

/** Where the line sits in the slot, and how tall her voice may rise. */
const ART_VARS = { "--line-y": "60%", "--wave-h": "clamp(5rem, 40cqh, 28rem)" } as CSSProperties;

/**
 * /athena section 2 - "Quiet until it matters" (the hero lab's v3, "The
 * Quiet Line", promoted to a section of its own).
 *
 * One long line of light crosses the whole screen, and your day streams along
 * it, right to left, through a single bright point at its centre: her. Most
 * of it she lets pass - a newsletter, a green build, a calendar sync - and
 * the line stays flat. Three times a loop something matters: it arrives
 * amber, she takes it in, and the line itself swells into her voice for one
 * short sentence, then lies flat again. The status line keeps the score:
 * events in a day against the times she spoke.
 *
 * Words: the SectionIntro trio, the event chips on the line, her one
 * sentence, the status line. No calls to action - the hero carries those.
 *
 * Fit: the slot is a size container that takes the stage's leftover height;
 * the line runs full-bleed (past the content column, to the screen's edges)
 * and the voice height, river spread and type all scale with `cqh`.
 *
 * Reduced motion pins INITIAL_TICK: mid-sentence, voice held at rest height,
 * the passing events caught on the line, no drift.
 */
export default function AthenaQuietLine() {
  const q = useTranslation().t.athenaSections.quiet;
  const { ref, phase, live, reduced } = useQuietClock({ cycle: CYCLE, tickMs: TICK_MS, initial: INITIAL_TICK });
  const mo = momentAt(phase);
  const fill = (s: string) => s.replace("{events}", eventsAt(phase).toLocaleString()).replace("{spoken}", String(mo.spoken));

  return (
    <Shell sectionRef={ref} status={{ full: fill(q.status), short: fill(q.statusShort) }} live={live}>
      <motion.div
        className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
        style={ART_VARS}
        initial={reduced ? false : { opacity: 0, scaleX: 0.6 }}
        whileInView={reduced ? undefined : { opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease: EASE_CURVE }}
      >
        {/* Horizon light, and the river of small things she lets pass */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 46% 30% at 50% var(--line-y), ${tint("cyan", 14)}, transparent 70%)`,
          }}
        />
        <River speaking={mo.speaking} live={live} />
        <Stream phase={phase} live={live} reduced={reduced} hushed={mo.speaking} />
        <Voice phase={phase} live={live} reduced={reduced} />
      </motion.div>
    </Shell>
  );
}
