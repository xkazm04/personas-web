"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import {
  BOTTOM_Y,
  FAILS,
  GOAL_X,
  MEM_Y,
  RUN1_CHUNKS,
  START_X,
  TOP_Y,
  VIEW_H,
  VIEW_W,
  run1At,
} from "./MemoryLayers.run-twice.geometry";
import { FailCross, Flag, MemoryChip, Run1Piece, beat, easeOut, r1Of, r2Of } from "./MemoryLayers.run-twice.parts";

/*
 * /illustrate 1.1.0, variant "run-twice" (transformation).
 * The same task twice: run 1 wanders, fails twice and loops back; each failure
 * drops a memory chip onto run 12's track, and run 12 goes straight to the goal.
 *
 * One progress value p (0..1) drives every beat:
 *   A 0.00-0.50  run 1 draws along its wandering path; red crosses at the loops
 *   B 0.50-0.64  each cross releases a category-coloured chip that drops to run 12
 *   C 0.64-0.88  run 12 draws straight and fast, lighting each chip as it passes
 *   D 0.88-1.00  run 12's goal rings
 * Server render and reduced motion sit at p = 1: the finished comparison.
 */

const DURATION = 2.8;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function RunTwiceArt() {
  const still = useStillMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.4 });
  const p = useMotionValue(1);
  const playing = useRef<AnimationPlaybackControls | null>(null);

  const play = useCallback(() => {
    playing.current?.stop();
    p.set(0);
    playing.current = animate(p, 1, { duration: DURATION, ease: "linear" });
  }, [p]);

  useEffect(() => {
    if (still) {
      playing.current?.stop();
      p.set(1);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p]);

  useEffect(() => () => playing.current?.stop(), []);

  // Travellers
  const t1x = useTransform(p, (v) => run1At(r1Of(v)).x);
  const t1y = useTransform(p, (v) => run1At(r1Of(v)).y);
  const t2x = useTransform(p, (v) => START_X + (GOAL_X - START_X) * r2Of(v));
  const run2Scale = useTransform(p, (v) => r2Of(v));
  const ring = useTransform(p, (v) => easeOut(beat(v, 0.88, 1)));
  const ringScale = useTransform(ring, (v) => 0.4 + 0.6 * v);
  const ringOpacity = useTransform(ring, (v) => 0.45 * v);

  return (
    <div
      ref={rootRef}
      data-illustrate-art
      data-tour-diagram="memory"
      role="img"
      aria-label="Run 1 wanders, fails twice and loops back; each failure is kept as a memory, and run 12 goes straight to the goal."
      className="relative mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-glass bg-white/[0.02] sm:mt-10"
    >
      <div className="relative w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
          fill="none"
        >
          <defs>
            <linearGradient id="run-twice-12" gradientUnits="userSpaceOnUse" x1={START_X} x2={GOAL_X} y1={0} y2={0}>
              <stop offset="0%" stopColor={BRAND_VAR.cyan} />
              <stop offset="100%" stopColor={BRAND_VAR.emerald} />
            </linearGradient>
          </defs>

          {/* Lane backdrops: two tracks, same start, same goal */}
          <rect x={30} y={40} width={940} height={170} rx={20} fill="currentColor" className="text-foreground" opacity={0.025} />
          <rect x={30} y={270} width={940} height={130} rx={20} fill={tint("cyan", 5)} />
          <line x1={START_X} x2={START_X} y1={TOP_Y} y2={BOTTOM_Y} stroke="currentColor" className="text-foreground" strokeWidth={1} strokeDasharray="2 6" opacity={0.25} />
          <line x1={GOAL_X} x2={GOAL_X} y1={TOP_Y} y2={BOTTOM_Y} stroke="currentColor" className="text-foreground" strokeWidth={1} strokeDasharray="2 6" opacity={0.25} />

          {/* Run 1: the wandering path, drawn piece by piece */}
          <g className="text-foreground" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.42}>
            {RUN1_CHUNKS.map((d, i) => (
              <Run1Piece key={i} p={p} i={i} d={d} />
            ))}
          </g>
          {FAILS.map((_, i) => (
            <FailCross key={i} p={p} index={i} />
          ))}

          {/* Run 12: the straight path */}
          <line x1={START_X} x2={GOAL_X} y1={BOTTOM_Y} y2={BOTTOM_Y} stroke="currentColor" className="text-foreground" strokeWidth={2} opacity={0.08} />
          <motion.g style={{ scaleX: run2Scale, originX: 0, transformBox: "fill-box" }}>
            <line x1={START_X} x2={GOAL_X} y1={BOTTOM_Y} y2={BOTTOM_Y} stroke="url(#run-twice-12)" strokeWidth={5} strokeLinecap="round" />
          </motion.g>

          {/* What was kept: failures become chips on run 12's track */}
          {FAILS.map((_, i) => (
            <MemoryChip key={i} p={p} index={i} />
          ))}

          {/* Memory band: the two tethers joined between the lanes */}
          <path
            d={`M${FAILS[0].x} ${MEM_Y} H${(FAILS[0].x + FAILS[1].x) / 2 - 66} M${(FAILS[0].x + FAILS[1].x) / 2 + 66} ${MEM_Y} H${FAILS[1].x}`}
            stroke="currentColor"
            className="text-foreground"
            strokeWidth={1.5}
            strokeDasharray="3 6"
            opacity={0.35}
          />

          {/* Starts and goals */}
          <circle cx={START_X} cy={TOP_Y} r={8} stroke="currentColor" className="text-foreground" strokeWidth={2.5} opacity={0.5} />
          <circle cx={START_X} cy={BOTTOM_Y} r={8} stroke={BRAND_VAR.cyan} strokeWidth={2.5} />
          <g className="text-foreground">
            <Flag x={GOAL_X} y={TOP_Y} color="currentColor" dim />
          </g>
          <Flag x={GOAL_X} y={BOTTOM_Y} color={BRAND_VAR.emerald} />
          <motion.circle
            cx={GOAL_X}
            cy={BOTTOM_Y}
            r={26}
            stroke={BRAND_VAR.emerald}
            strokeWidth={2}
            style={{ scale: ringScale, opacity: ringOpacity, transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
          />

          {/* Travellers */}
          <motion.circle r={7} className="text-foreground" fill="currentColor" opacity={0.7} style={{ x: t1x, y: t1y }} />
          <motion.circle r={8} fill={BRAND_VAR.cyan} style={{ x: t2x, y: BOTTOM_Y }} />
        </svg>

        {/* Labels: the only words in the picture */}
        <span
          className="absolute -translate-y-1/2 text-xs font-semibold tracking-wide text-foreground/60 sm:text-sm"
          style={{ left: pct(44, VIEW_W), top: pct(66, VIEW_H) }}
        >
          Run 1
        </span>
        <span
          className="absolute -translate-y-1/2 text-xs font-semibold tracking-wide sm:text-sm"
          style={{ left: pct(44, VIEW_W), top: pct(292, VIEW_H), color: BRAND_VAR.cyan }}
        >
          Run 12
        </span>
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-medium tracking-wide text-foreground/70 sm:text-sm"
          style={{ left: pct((FAILS[0].x + FAILS[1].x) / 2, VIEW_W), top: pct(MEM_Y, VIEW_H) }}
        >
          Memory
        </span>

        <button
          type="button"
          onClick={play}
          disabled={still}
          aria-label="Replay the animation"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-glass bg-white/[0.03] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-40 sm:right-3 sm:top-3"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

