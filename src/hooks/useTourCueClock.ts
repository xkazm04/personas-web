"use client";

import { useEffect, useRef, type RefObject } from "react";
import { TourCueClock, type TourCue } from "@/lib/tour-cue-clock";

/**
 * Fires `cues` on the step's narration clock (see `TourCueClock`). Re-armed
 * from zero whenever `stepKey` changes or `enabled` flips; a pause freezes the
 * clock instead of resetting it, so cues resume exactly where they stopped.
 *
 * `audioRef` is the live narration element: while it holds a healthy clip its
 * `currentTime` is the clock; otherwise a virtual clock drives silent steps.
 */
export function useTourCueClock(
  enabled: boolean,
  playing: boolean,
  stepKey: string | number,
  audioRef: RefObject<HTMLAudioElement | null>,
  cues: readonly TourCue[] | undefined,
): void {
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!enabled || !cues || cues.length === 0) return;
    const clock = new TourCueClock(cues);
    let raf = 0;
    const frame = (nowMs: number) => {
      const audio = audioRef.current;
      const hasClip = audio !== null && !audio.error;
      clock.tick({
        playing: playingRef.current,
        nowMs,
        audioMs: hasClip ? audio.currentTime * 1000 : null,
      });
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
    // `cues` is derived from the step; `stepKey` is its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, stepKey, audioRef]);
}
