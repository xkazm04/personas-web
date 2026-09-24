"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { ScreenFrame, glass } from "./VisionGrid.real-surfaces.chrome";
import {
  STAGES,
  STAGE_STARTS,
  TRACE_TOTAL_MS,
  formatMs,
  type Stage,
  type StageTone,
} from "./VisionGrid.real-surfaces.data";

/**
 * Monitoring: the execution-trace waterfall of one run over the app's seven
 * real pipeline stages. Mechanism beat: ONE progress value (0 → 1 over the
 * run's time axis) sweeps a cursor across and each stage's bar fills as the
 * cursor passes it, once, when the trace scrolls into view. Resting and
 * reduced-motion state is the completed waterfall (progress = 1), which still
 * shows the order and the time axis.
 */

const TONE: Record<StageTone, BrandKey> = { frontend: "blue", record: "emerald", engine: "purple" };
const RUN_SECONDS = 2.8;

function StageRow({ stage, start, progress }: { stage: Stage; start: number; progress: MotionValue<number> }) {
  const end = start + stage.ms;
  const fill = useTransform(progress, (v) => Math.min(1, Math.max(0, (v * TRACE_TOTAL_MS - start) / stage.ms)));
  const shown = useTransform(progress, (v) => (v * TRACE_TOTAL_MS >= end - 0.5 ? 1 : 0));
  const tone = TONE[stage.tone];
  return (
    <>
      <span className="truncate text-xs leading-5 text-foreground">{stage.label}</span>
      <span className="relative h-5">
        <span aria-hidden className="absolute inset-x-0 top-1 bottom-1 rounded" style={{ backgroundColor: glass(0.03) }} />
        <span
          aria-hidden
          className="absolute top-[5px] bottom-[5px] overflow-hidden rounded-full"
          style={{
            left: `${(start / TRACE_TOTAL_MS) * 100}%`,
            width: `${(stage.ms / TRACE_TOTAL_MS) * 100}%`,
            minWidth: 3,
          }}
        >
          <motion.span
            className="block h-full w-full origin-left rounded-full"
            style={{
              scaleX: fill,
              background: `linear-gradient(90deg, ${tint(tone, 85)}, ${tint(tone, 55)})`,
            }}
          />
        </span>
      </span>
      <motion.span style={{ opacity: shown }} className="text-right font-mono text-xs leading-5 tabular-nums text-muted">
        {formatMs(stage.ms)}
      </motion.span>
    </>
  );
}

export function TraceScreen() {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  // Server and first paint: the completed trace. Armed only on the client.
  const progress = useMotionValue(1);
  const armed = useRef(false);
  const [done, setDone] = useState(true);
  const [runs, setRuns] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setDone(v >= 1));

  useEffect(() => {
    if (still) {
      progress.set(1);
      return;
    }
    if (!inView) {
      if (!armed.current) progress.set(0);
      return;
    }
    armed.current = true;
    if (progress.get() >= 1 && runs === 0) return;
    const controls = animate(progress, 1, { duration: RUN_SECONDS, ease: [0.3, 0.1, 0.5, 1], delay: 0.25 });
    return () => controls.stop();
  }, [still, inView, progress, runs]);

  const cursorX = useTransform(progress, (v) => `${v * 100}%`);
  const cursorOpacity = useTransform(progress, [0, 0.01, 0.97, 1], [0, 1, 1, 0]);

  const replay = () => {
    progress.set(0);
    setRuns((n) => n + 1);
  };

  const meta = (
    <>
      <span
        className="flex items-center gap-1 rounded-md border px-1.5 py-0.5"
        style={{
          color: done ? BRAND_VAR.emerald : BRAND_VAR.cyan,
          backgroundColor: done ? tint("emerald", 8) : tint("cyan", 8),
          borderColor: done ? tint("emerald", 22) : tint("cyan", 22),
        }}
      >
        {done && <CheckCircle2 aria-hidden className="h-3 w-3" />}
        {done ? "Completed" : "Running"}
      </span>
      {!still && (
        <button
          type="button"
          onClick={replay}
          aria-label="Replay the run"
          className="rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </>
  );

  return (
    <ScreenFrame title="Execution trace" meta={meta}>
      <div ref={ref} className="relative grid grid-cols-[116px_1fr_40px] gap-x-2">
        {STAGES.map((s, i) => (
          <StageRow key={s.label} stage={s} start={STAGE_STARTS[i]} progress={progress} />
        ))}
        {/* The run's time axis: 0 to total, under the bar column. */}
        <span />
        <span className="mt-1 flex justify-between border-t border-glass pt-1 font-mono text-xs tabular-nums text-muted">
          <span>0</span>
          <span>{formatMs(TRACE_TOTAL_MS)}</span>
        </span>
        <span />
        {/* Decorative cursor: sweeps the bar column while the run plays. */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[124px] right-[48px]">
          <motion.span className="absolute inset-y-0 left-0 w-full" style={{ x: cursorX, opacity: cursorOpacity }}>
            <span className="absolute inset-y-0 left-0 w-px" style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: `0 0 6px ${tint("cyan", 60)}` }} />
          </motion.span>
        </span>
      </div>
    </ScreenFrame>
  );
}
