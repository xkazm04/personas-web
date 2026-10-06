"use client";

import { useEffect, useRef, useState } from "react";
import { useLoopGate } from "@/hooks/useLoopGate";
import { HOLD_MS, STEP_MS } from "./geometry";

/**
 * The dial's clock, shared by the wide and the phone drawing: the stop (0-3)
 * advances while the loop gate runs (on screen, foreground tab, no reduced
 * motion, not paused by the visitor); reduced motion rests on year 1. Picking
 * a stop pauses; play from year 1 starts again from day 1.
 */
export function useGrowth() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const { run, still } = useLoopGate(boxRef, { userStopped: userPaused });
  const [stage, setStage] = useState(() => (still ? 3 : 0));
  const [prevStill, setPrevStill] = useState(still);
  if (still !== prevStill) {
    setPrevStill(still);
    if (still) setStage(3);
  }

  useEffect(() => {
    if (!run) return;
    const id = setTimeout(() => setStage((s) => (s + 1) % 4), stage === 3 ? HOLD_MS : STEP_MS);
    return () => clearTimeout(id);
  }, [run, stage]);

  const choose = (s: number) => {
    setUserPaused(true);
    setStage(s);
  };
  const toggle = () => {
    if (run) setUserPaused(true);
    else {
      setUserPaused(false);
      if (stage === 3) setStage(0);
    }
  };
  return { boxRef, stage, run, still, playing: run, choose, toggle };
}
