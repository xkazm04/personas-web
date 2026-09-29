"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useStillMotion } from "@/hooks/useStillMotion";
import { LAST } from "./frames";

const TICK_MS = 1150;

/**
 * Drives the week timeline. Autoplays once while the deck is on screen in a
 * foreground tab; any manual input ends the autoplay. Reduced motion never ticks:
 * it rests on the finished frame and Play jumps straight there.
 */
export function useRunsPlayer(ref: RefObject<HTMLElement | null>) {
  const still = useStillMotion();
  const inView = useIsVisible(ref, { threshold: 0.45 });
  const [frame, setFrame] = useState(0);
  const [mode, setMode] = useState<"auto" | "play" | "pause">("auto");

  const [touched, setTouched] = useState(false);
  const current = still && !touched ? LAST : frame;
  const running = !still && inView && (mode === "auto" || mode === "play") && frame < LAST;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setFrame((f) => Math.min(f + 1, LAST));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  const seek = useCallback((f: number) => {
    setMode("pause");
    setTouched(true);
    setFrame(Math.max(0, Math.min(LAST, f)));
  }, []);

  const toggle = useCallback(() => {
    if (still) {
      setTouched(true);
      setFrame(LAST);
      return;
    }
    if (typeof document !== "undefined" && document.hidden) return;
    if (running) setMode("pause");
    else {
      if (frame >= LAST) setFrame(0);
      setMode("play");
    }
  }, [still, running, frame]);

  return { frame: current, running, seek, toggle };
}
