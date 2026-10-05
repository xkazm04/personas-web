"use client";

import { useEffect, useState, type RefObject } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useLoopGate } from "@/hooks/useLoopGate";
import { RUNS, stepAt } from "./runs";

const HOLD_MS = 2600;

/**
 * The player of V2. `t` (0..1) walks the open run's trace in real time; at the
 * end it holds on the run's highlight, then opens the next run. Pressing a step
 * pins it (and stops the walk - the "user" decider of the loop gate); picking a
 * run replays it. Off-screen, in a hidden tab and under reduced motion it
 * stops; reduced motion rests on the first run, complete, on its highlight.
 */
export function useRunPlayer(ref: RefObject<Element | null>) {
  const [run, setRun] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const { run: go, still } = useLoopGate(ref, { userStopped: pinned !== null });
  const t = useMotionValue(1);
  const [auto, setAuto] = useState(RUNS[0].highlight);

  useMotionValueEvent(t, "change", (v) => setAuto(stepAt(RUNS[run], v)));

  useEffect(() => {
    if (still) {
      t.set(1);
      return;
    }
    if (!go) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (t.get() >= 1) t.set(0);
    const total = RUNS[run].total;
    const ctl = animate(t, 1, {
      duration: (1 - t.get()) * total,
      ease: "linear",
      onComplete: () => {
        timer = setTimeout(() => {
          t.set(1);
          setRun((r) => (r + 1) % RUNS.length);
        }, HOLD_MS);
      },
    });
    return () => {
      ctl.stop();
      if (timer) clearTimeout(timer);
    };
  }, [go, still, run, nonce, t]);

  const open = (i: number) => {
    t.set(1);
    setPinned(null);
    setAuto(RUNS[i].highlight);
    setRun(i);
    setNonce((n) => n + 1);
  };
  const pin = (i: number) => setPinned((prev) => (prev === i ? null : i));
  const focus = pinned ?? auto;

  return { run, t, focus, pinned, open, pin, unpin: () => setPinned(null), still };
}
