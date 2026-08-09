"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ANNOTATION, PANEL } from "@/components/athena/stage/athena-tokens";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { HERO_COPY } from "./data";

/**
 * WaveformStrip — phase 1 of the Conductor sequence. A voice waveform
 * animates while the spoken sentence types out beside it; once the plan
 * lands, the bars settle into a dim static readout of the same request.
 * Bar heights are deterministic (sin-based) — no impure calls in render.
 */

const BAR_COUNT = 28;
const BARS = Array.from(
  { length: BAR_COUNT },
  (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + 0.6)),
);

interface Props {
  /** Waveform is live and the sentence is still typing. */
  listening: boolean;
  /** The typed portion of the sentence. */
  typed: string;
  /** Sentence fully typed (hides the caret). */
  done: boolean;
}

export default function WaveformStrip({ listening, typed, done }: Props) {
  const reduced = useReducedMotion() ?? false;
  const live = listening && !reduced;

  return (
    <div className={`${PANEL} flex items-center gap-3 px-4 py-3`}>
      {/* Mic dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        {live && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: tint("cyan", 40) }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan }}
        />
      </span>

      {/* Waveform bars */}
      <div className="flex h-8 shrink-0 items-center gap-[3px]" aria-hidden="true">
        {BARS.map((h, i) =>
          live ? (
            <motion.span
              key={i}
              className="block w-[3px] origin-center rounded-full"
              style={{ backgroundColor: tint("cyan", 70), height: "100%" }}
              animate={{ scaleY: [0.25, h, 0.35, h * 0.75, 0.25] }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.045,
              }}
            />
          ) : (
            <span
              key={i}
              className="block w-[3px] rounded-full"
              style={{
                backgroundColor: tint("cyan", done ? 32 : 55),
                height: `${(h * 100).toFixed(1)}%`,
              }}
            />
          ),
        )}
      </div>

      {/* Typed sentence */}
      <p className="min-w-0 flex-1 truncate font-mono text-sm text-foreground/80">
        <span className="text-muted-dark">&gt; </span>
        {typed}
        {!done && (
          <motion.span
            className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 rounded-[1px]"
            style={{ backgroundColor: tint("cyan", 80) }}
            animate={reduced ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
      </p>

      {listening && (
        <span className={`${ANNOTATION} hidden shrink-0 sm:inline`}>
          {HERO_COPY.listeningLabel}
        </span>
      )}
    </div>
  );
}
