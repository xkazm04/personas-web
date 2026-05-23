"use client";

import { useEffect, useRef, useState } from "react";
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
 * Also routes each clip through a Web Audio `AnalyserNode` and returns it, so
 * the Athena companion can drive its glow / mouth from the live voice level.
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
}: UseTourAudioArgs): AnalyserNode | null {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!active || atBridge || steps.length === 0) return;
    const step = steps[stepIndex];
    if (!step.audioSrc) return;
    const audio = new Audio(step.audioSrc);
    audioRef.current = audio;

    // Lazy Web Audio graph (source → analyser → destination) so the companion
    // can read the voice envelope. Wrapped in try/catch: if Web Audio is
    // unavailable the clip still plays through the element directly.
    let source: MediaElementAudioSourceNode | null = null;
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctor();
        const node = ctx.createAnalyser();
        node.fftSize = 256;
        node.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = node;
        // Defer out of the effect body (React 19 "no setState in effect").
        queueMicrotask(() => setAnalyser(node));
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      source = ctx.createMediaElementSource(audio);
      source.connect(analyserRef.current as AnalyserNode);
    } catch {
      /* no Web Audio — element playback still works */
    }

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
      try {
        source?.disconnect();
      } catch {
        /* already disconnected */
      }
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

  return analyser;
}
