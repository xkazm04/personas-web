"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { CATEGORY_META } from "./memoryShared";
import {
  CLUSTERS,
  DURATION,
  H,
  HUB,
  RECALL,
  RUNS,
  RUN_LEN,
  SEEDS,
  SEED_LINKS,
  W,
  color,
  runStart,
  wash,
} from "./MemoryLayers.constellation.data";
import { Dot, Hub, Link, RecallComet, RecallHalo, RecallSegment, Spark } from "./MemoryLayers.constellation.parts";

/* Rewind the single progress value and play every beat once. */
function start(p: MotionValue<number>, controls: RefObject<AnimationPlaybackControls | null>) {
  controls.current?.stop();
  p.set(0);
  controls.current = animate(p, 1, { duration: DURATION, ease: "linear" });
  return controls.current;
}

export default function ConstellationArt() {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  // The resting value is the end state: server render and reduced motion show the grown, recalled map.
  const p = useMotionValue(1);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const play = () => start(p, controls);

  useEffect(() => {
    if (still) {
      controls.current?.stop();
      p.set(1);
      return;
    }
    if (!inView) return;
    const run = start(p, controls);
    return () => run.stop();
  }, [inView, still, p]);

  return (
    <div
      ref={ref}
      data-illustrate-art
      data-tour-diagram="memory"
      role="figure"
      aria-label="Memories in four categories form a linked map that grows with every run, and a recall path lights up across it back to the agent."
      className="relative mx-auto w-full max-w-4xl rounded-3xl border border-glass bg-white/[0.02] text-foreground"
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {CLUSTERS.map((c) => (
          <circle key={c.cat} cx={c.cx} cy={c.cy} r={112} fill={wash(c.cat, 7)} />
        ))}

        {SEED_LINKS.map(([a, b]) => (
          <Link key={`${a}-${b}`} a={a} b={b} p={p} />
        ))}
        {RUNS.map((run, k) =>
          run.links.map((to) => (
            <Link key={`${run.node.id}-${to}`} a={run.node.id} b={to} p={p} from={runStart(k) + RUN_LEN * 0.5} />
          )),
        )}
        {RECALL.slice(0, -1).map((id, i) => (
          <RecallSegment key={id} i={i} p={p} />
        ))}

        {SEEDS.map((n) => (
          <Dot key={n.id} n={n} p={p} />
        ))}
        {RUNS.map((run, k) => (
          <Dot key={run.node.id} n={run.node} p={p} from={runStart(k) + RUN_LEN * 0.35} />
        ))}
        {RECALL.slice(0, -1).map((id, i) => (
          <RecallHalo key={id} i={i} p={p} />
        ))}
        {RUNS.map((run, k) => (
          <Spark key={run.node.id} target={run.node} p={p} from={runStart(k)} />
        ))}

        <Hub p={p} />
        <RecallComet p={p} />
      </svg>

      {/* Labels are DOM text so they stay legible at phone width. */}
      {CLUSTERS.map((c) => (
        <span
          key={c.cat}
          className="absolute text-xs font-medium tracking-wide sm:text-sm"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            transform: c.end ? "translateX(-100%)" : undefined,
            color: color(c.cat),
          }}
        >
          {CATEGORY_META[c.cat].label}
        </span>
      ))}
      <span
        className="absolute -translate-x-1/2 text-xs font-medium text-foreground/80 sm:text-sm"
        style={{ left: `${(HUB.x / W) * 100}%`, top: `${((HUB.y + HUB.r + 18) / H) * 100}%` }}
      >
        Agent
      </span>

      <button
        type="button"
        onClick={play}
        disabled={still}
        aria-label="Replay the animation"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-glass bg-white/[0.03] p-2 text-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
