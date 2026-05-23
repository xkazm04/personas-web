"use client";

import { useEffect, useRef } from "react";
import type { TourStep } from "@/lib/tour-script";

interface UseTourAudioArgs {
  active: boolean;
  atBridge: boolean;
  playing: boolean;
  stepIndex: number;
  steps: TourStep[];
  /** Advance to the next step — called on the clip's `ended` event. */
  next: () => void;
}

/**
 * Plays a step's pre-generated narration audio (`step.audioSrc`) and advances
 * the tour when the clip ends, with the dwell timer as an error fallback.
 *
 * Two effects:
 *  - creation (keyed on step, NOT `playing`) so pause/resume doesn't restart
 *    the clip;
 *  - play/pause driven by the `playing` flag.
 *
 * Steps without `audioSrc` are ignored here — the dwell timer in TourContext
 * advances those instead.
 */
export function useTourAudio({
  active,
  atBridge,
  playing,
  stepIndex,
  steps,
  next,
}: UseTourAudioArgs): void {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!active || atBridge || steps.length === 0) return;
    const step = steps[stepIndex];
    if (!step.audioSrc) return;
    const audio = new Audio(step.audioSrc);
    audioRef.current = audio;
    let fallbackId = 0;
    const onEnded = () => next();
    const onError = () => {
      fallbackId = window.setTimeout(next, step.dwellMs);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      if (fallbackId) window.clearTimeout(fallbackId);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [active, atBridge, stepIndex, next, steps]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (active && playing && !atBridge) audio.play().catch(() => {});
    else audio.pause();
  }, [active, playing, atBridge, stepIndex, steps]);
}
