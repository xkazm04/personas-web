"use client";

import { useCallback, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import {
  COL_BOTTOM,
  COL_W,
  COL_X,
  COL_Y,
  DURATION,
  GRAINS_PER_RUN,
  INNER_W,
  INNER_X,
  RECALLED,
  RUN_CARDS,
  STRATA,
  VB_H,
  VB_W,
} from "./MemoryLayers.sediment.model";
import {
  FallingGrain,
  Labels,
  RecallBracket,
  RecalledGrain,
  RunCard,
  Stratum,
} from "./MemoryLayers.sediment.parts";

/**
 * Sediment: each run pours coloured grains into a glass column, where they settle
 * into four category strata that thicken run by run; the most important grain of
 * each stratum then rises to the top edge, where the recall bracket closes on it.
 * Rest state = end state, so the server render and reduced motion show it whole.
 */
export default function SedimentArt() {
  const still = useStillMotion();
  const progress = useMotionValue(1);
  const [playing, setPlaying] = useState(false);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const glowId = `sed-glow-${uid}`;
  const glassId = `sed-glass-${uid}`;
  const clipId = `sed-clip-${uid}`;

  const play = useCallback(() => {
    controls.current?.stop();
    if (still) {
      progress.set(1);
      setPlaying(false);
      return;
    }
    progress.set(0);
    setPlaying(true);
    controls.current = animate(progress, 1, {
      duration: DURATION,
      ease: "linear",
      onComplete: () => setPlaying(false),
    });
  }, [still, progress]);

  return (
    <motion.figure
      data-illustrate-art
      data-tour-diagram="memory"
      aria-label="Each run drops coloured memories that settle into four layers in a glass column; the most important ones rise to the top for recall."
      onViewportEnter={play}
      viewport={{ once: true, amount: 0.35 }}
      className="relative mx-auto mt-10 w-full max-w-3xl rounded-3xl border border-glass bg-white/[0.02] p-3 sm:p-8"
    >
      <button
        type="button"
        onClick={play}
        aria-label="Replay the animation"
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-glass bg-white/[0.03] text-foreground/70 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
      </button>

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full text-foreground" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
        <defs>
          <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.07" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.015" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.06" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={INNER_X} y={COL_Y} width={INNER_W} height={COL_BOTTOM - COL_Y} rx={14} />
          </clipPath>
        </defs>

        <g aria-hidden>
          {RUN_CARDS.map((_, k) => (
            <RunCard key={k} k={k} progress={progress} />
          ))}
          <rect
            x={COL_X}
            y={COL_Y}
            width={COL_W}
            height={COL_BOTTOM - COL_Y + 6}
            rx={20}
            fill={`url(#${glassId})`}
            stroke="currentColor"
            strokeOpacity={0.22}
            strokeWidth={1.5}
          />
          <g clipPath={`url(#${clipId})`}>
            {STRATA.map((s, i) => (
              <Stratum key={s.key} i={i} progress={progress} />
            ))}
          </g>
          <rect x={COL_X + 10} y={COL_Y + 16} width={4} height={COL_BOTTOM - COL_Y - 40} rx={2} fill="currentColor" opacity={0.08} />
          {playing &&
            RUN_CARDS.map((_, run) =>
              Array.from({ length: GRAINS_PER_RUN }, (_, j) => (
                <FallingGrain key={`${run}-${j}`} run={run} j={j} progress={progress} />
              )),
            )}
        </g>

        <RecallBracket progress={progress} />
        <g aria-hidden>
          {RECALLED.map((_, i) => (
            <RecalledGrain key={i} i={i} progress={progress} filterId={glowId} />
          ))}
        </g>

        <Labels />
      </svg>
    </motion.figure>
  );
}
