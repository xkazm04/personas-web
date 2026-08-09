"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM } from "../../stage/athena-tokens";
import { COPY, HEARD_SENTENCE } from "./data";
import type { SummonPhase } from "./useSummonGesture";

/**
 * The annotation line under the orb — the scene's narrator. Idle: a
 * pulsing "press and hold" invitation (or the static reduced-motion
 * line). Early release: the real "too quick" correction. Listening:
 * a live waveform plus the heard sentence typing out. Thinking: three
 * quiet dots while she composes the answer.
 */

/** Deterministic bar heights — no Math.random anywhere near render. */
const BARS = Array.from({ length: 22 }, (_, i) => 0.3 + 0.55 * Math.abs(Math.sin(i * 1.9 + 0.6)));

export default function SummonReadout({
  phase,
  tooQuick,
  heardCount,
}: {
  phase: SummonPhase;
  tooQuick: boolean;
  heardCount: number;
}) {
  const reduced = useReducedMotion() ?? false;

  if (phase === "answered") return null;

  if (phase === "listening" || phase === "thinking") {
    return (
      <div className="flex min-h-16 flex-col items-center gap-3">
        {phase === "listening" ? (
          <div className="flex h-8 items-center gap-[3px]" aria-hidden="true">
            {BARS.map((h, i) => (
              <motion.span
                key={i}
                className="h-8 w-[3px] rounded-full"
                style={{ background: BRAND_VAR.cyan, transformOrigin: "center" }}
                initial={false}
                animate={reduced ? { scaleY: h * 0.7 } : { scaleY: [h * 0.3, h, h * 0.45] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.045 }
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex h-8 items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: BRAND_VAR.cyan, opacity: 0.7 }}
                animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
        <p className={phase === "listening" ? ANNOTATION : ANNOTATION_DIM}>
          {phase === "listening" ? (
            <>&ldquo;{HEARD_SENTENCE.slice(0, heardCount)}&rdquo;</>
          ) : (
            COPY.promptThinking
          )}
        </p>
      </div>
    );
  }

  // idle / arming — the invitation, the correction, or the static line
  return (
    <div className="flex min-h-16 flex-col items-center justify-center">
      {reduced ? (
        <p className={ANNOTATION_DIM}>{COPY.promptReducedStatic}</p>
      ) : tooQuick ? (
        <p className={ANNOTATION} style={{ color: BRAND_VAR.amber }}>
          {COPY.promptTooQuick}
        </p>
      ) : (
        <motion.p
          className={ANNOTATION}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {COPY.promptIdle}
        </motion.p>
      )}
    </div>
  );
}
