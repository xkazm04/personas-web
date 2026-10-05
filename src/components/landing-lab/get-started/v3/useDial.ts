"use client";

import { useRef, useState, type RefObject } from "react";
import { useMotionValueEvent, useTransform } from "framer-motion";
import { usePlay, useLoop } from "../shared/motion";
import { MIDNIGHT, REST, RUNS, hourAt, lapAt } from "./dialGeometry";

/**
 * The clock of V3. `p` plays the setup minutes once in view; then `loop` turns
 * the day (22 s a lap; stops off-screen, in a hidden tab, and under reduced
 * motion). `hour` is the time on the dial; `day` and `passed` (runs met this
 * lap) are state, updated from motion events, never from an effect body. Both
 * start at the resting frame (08:15, day two, every run done) - what the server
 * renders and what reduced motion keeps.
 */
export function useDial(ref: RefObject<HTMLDivElement | null>) {
  const { p, play, still } = usePlay(ref, 3.2);
  const [introDone, setIntroDone] = useState(true);
  const loop = useLoop(ref, 22, REST, introDone);
  const hour = useTransform([p, loop], ([pv, v]: number[]) => hourAt(pv, v));
  const [day, setDay] = useState(2);
  const [passed, setPassed] = useState(RUNS.length);
  const laps = useRef(0);
  const last = useRef(REST);

  useMotionValueEvent(p, "change", (pv) => {
    const done = pv >= 1;
    setIntroDone(done);
    if (!done) {
      laps.current = 0;
      last.current = 0;
      loop.set(0);
      setDay(1);
      setPassed(0);
    }
  });

  useMotionValueEvent(loop, "change", (v) => {
    if (v < last.current - 0.5) laps.current += 1;
    last.current = v;
    setDay(1 + laps.current + (v >= MIDNIGHT ? 1 : 0));
    setPassed(RUNS.filter((r) => v >= lapAt(r.h)).length);
  });

  return { p, hour, day, passed, play, still };
}
