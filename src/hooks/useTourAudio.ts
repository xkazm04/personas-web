"use client";

import { useEffect, useRef, useState } from "react";
import type { TourStep } from "@/lib/tour-script";

interface UseTourAudioArgs {
  active: boolean;
  /** Intro phase — plays the greeting clip and does NOT auto-advance. */
  atIntro: boolean;
  atBridge: boolean;
  /** Greeting clip played during the intro phase. */
  introSrc: string;
  playing: boolean;
  stepIndex: number;
  steps: TourStep[];
  /** Advance to the next step — called on a step clip's `ended` event. */
  next: () => void;
}

/**
 * Plays the tour's pre-generated narration. During the intro phase it plays
 * Athena's greeting (`introSrc`) and does NOT advance; once stepping, it plays
 * each `step.audioSrc` and advances the tour when the clip ends, with the
 * dwell timer as an error fallback.
 *
 * Also routes each clip through a Web Audio `AnalyserNode` and returns it, so
 * the Athena companion can drive its glow / mouth from the live voice level.
 * Steps without `audioSrc` are ignored here — the dwell timer in TourContext
 * advances those instead.
 */
export function useTourAudio({
  active,
  atIntro,
  atBridge,
  introSrc,
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
    if (!active || atBridge) return;
    // Intro plays the greeting (no auto-advance); steps play their own clip.
    const step = atIntro ? null : steps[stepIndex];
    const src = atIntro ? introSrc : step?.audioSrc;
    if (!src) return;
    const audio = new Audio(src);
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
    // The intro greeting just plays; only step clips auto-advance the tour.
    const onEnded = () => {
      if (!atIntro) next();
    };
    const onError = () => {
      if (!atIntro && step) fallbackId = window.setTimeout(next, step.dwellMs);
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
  }, [active, atIntro, atBridge, introSrc, stepIndex, next, steps]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (active && playing && !atBridge) audio.play().catch(() => {});
    else audio.pause();
  }, [active, playing, atBridge, atIntro, stepIndex, steps]);

  return analyser;
}
