"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { frameAt, nextBoundary, type Frame, type RunScript } from "./frameAt";

export type RunStatus = "idle" | "running" | "done";

interface Options {
  /** Virtual ms per real ms. Changing it retimes a live run without a jump. */
  rate?: number;
  /** Freezes the virtual clock (hidden tab, off-screen); resumes where it stopped. */
  paused?: boolean;
}

/**
 * Owns the one timer of a scripted run. Virtual time lives in a ref; the timer
 * sleeps until the next beat boundary and lands on it exactly, so there is no
 * drift and no per-beat callback chain. The rendered `t` only changes at
 * boundaries, which keeps re-renders at the beat rate.
 */
export function useRunClock(script: RunScript, { rate = 1, paused = false }: Options = {}) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [t, setT] = useState(0);
  const pos = useRef(0); // authoritative virtual time at the last anchor
  const advancing = status === "running" && !paused;

  useEffect(() => {
    if (!advancing) return;
    const anchorWall = performance.now();
    const anchorT = pos.current;
    const next = nextBoundary(script, anchorT);
    if (next === null) {
      const id = setTimeout(() => setStatus("done"), 0);
      return () => clearTimeout(id);
    }
    let fired = false;
    const id = setTimeout(() => {
      fired = true;
      pos.current = next;
      setT(next);
    }, Math.max(0, (next - anchorT) / rate));
    return () => {
      clearTimeout(id);
      if (fired) return;
      // Pause / retime / re-arm: bank the virtual time that really elapsed.
      pos.current = Math.min(next, anchorT + (performance.now() - anchorWall) * rate);
    };
  }, [advancing, script, rate, t]);

  const start = useCallback(() => {
    pos.current = 0;
    setT(0);
    setStatus("running");
  }, []);
  const reset = useCallback(() => {
    pos.current = 0;
    setT(0);
    setStatus("idle");
  }, []);
  /** Jump to virtual time `to` (works while running or paused). */
  const seek = useCallback((to: number) => {
    pos.current = to;
    setT(to);
  }, []);

  const frame: Frame = useMemo(() => frameAt(script, t), [script, t]);
  return { status, t, frame, start, reset, seek };
}
