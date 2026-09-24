"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { CalendarClock, Laptop, RotateCcw } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { STATE_COLORS, tint } from "@/lib/brand-theme";
import { AWAY_FROM, RUNS, SPAN, clockLabel, degOf, runsPassed } from "./CommandCenterIllustration.night-shift.data";
import NightShiftDial from "./CommandCenterIllustration.night-shift.dial";
import NightShiftLog from "./CommandCenterIllustration.night-shift.log";

/**
 * Hero illustration - "Night shift" (physical metaphor: a 24h dial).
 *
 * Claim: describe an agent once and it does its jobs for you, on your machine.
 * The dial carries four DISCRETE scheduled runs; the hand sweeps once from the
 * evening you left (21:30) to now (07:10), and each slot it passes turns from
 * scheduled into a finished run in the log. The 08:00 run is still ahead and
 * held for approval (the app's per-trigger "Require my approval" mode).
 *
 * Resting state (server markup, reduced motion, no script) is the finished
 * night: hand at now, three runs done, one scheduled. The sweep is armed on the
 * client once in view, plays once, and can be replayed; never under reduced motion.
 */

const SWEEP_SECONDS = 4.2;
const LABEL =
  "A 24-hour schedule on this machine. Four scheduled runs: 22:00 cost report, 02:00 backup digest and 06:30 inbox triage finished overnight; 08:00 standup notes is next and waits for your approval. It is now 07:10.";

export default function NightShiftIllustration(_props: { publicBetaLabel: string }) {
  const reduced = useStillMotion();
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.5 });
  const played = useRef(false);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  // One progress value drives everything: 0 = 21:30, 1 = now (07:10).
  const progress = useMotionValue(1);
  const rotate = useTransform(progress, (v) => degOf(AWAY_FROM) + v * SPAN * 15);
  const [elapsed, setElapsed] = useState(SPAN);
  const [armed, setArmed] = useState(false);

  useMotionValueEvent(progress, "change", (v) => {
    setElapsed(Math.round(v * SPAN * 6) / 6);
    if (v < 1) setArmed(true);
  });

  const play = useCallback(() => {
    controls.current?.stop();
    progress.set(0);
    controls.current = animate(progress, 1, { duration: SWEEP_SECONDS, ease: [0.45, 0, 0.25, 1] });
  }, [progress]);

  useEffect(() => {
    if (reduced) {
      controls.current?.stop();
      progress.set(1);
      return;
    }
    if (inView && !played.current) {
      played.current = true;
      play();
    }
  }, [inView, reduced, play, progress]);

  useEffect(() => () => controls.current?.stop(), []);

  const passed = runsPassed(elapsed);
  const clock = clockLabel(AWAY_FROM + elapsed);

  return (
    <figure ref={rootRef} aria-label={LABEL} className="flex h-[360px] w-[440px] max-w-full flex-col gap-3 text-left">
      {/* header: the app's schedule surface, reduced */}
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        <span className="text-sm font-bold text-foreground">Schedules</span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-xs text-foreground/80"
          style={{ backgroundColor: tint("emerald", 8), borderColor: tint("emerald", 22) }}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATE_COLORS.success }} />
          Engine on
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 font-mono text-xs text-muted">
          <Laptop className="h-3.5 w-3.5" aria-hidden="true" />
          This machine
        </span>
        {!reduced && (
          <button
            type="button"
            onClick={play}
            aria-label="Replay the night"
            title="Replay the night"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-glass text-muted transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* dial + overnight log */}
      <div className="grid min-h-0 flex-1 grid-cols-[208px_1fr] items-center gap-3">
        <NightShiftDial rotate={rotate} passed={passed} clock={clock} armed={armed} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-baseline justify-between font-mono text-xs text-muted-dark">
            <span className="uppercase tracking-wider">Overnight</span>
            <span className="tabular-nums">
              {passed} done · {RUNS.length - passed} scheduled
            </span>
          </div>
          <NightShiftLog passed={passed} />
        </div>
      </div>

      <figcaption className="border-t border-glass pt-2.5">
        <span className="block text-sm text-foreground/90">
          Four scheduled runs on your machine. Three finished while you were away.
        </span>
        <span className="mt-0.5 block text-xs text-muted-dark">
          Runs while Personas is open; a missed slot is offered for recovery at startup.
        </span>
      </figcaption>
    </figure>
  );
}
