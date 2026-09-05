"use client";

import { useEffect, useRef, useState } from "react";
import type { TourStep } from "@/lib/tour-script";

/** Quiet beat between a step's clip ending and the next step starting. */
const INTER_STEP_PAUSE_MS = 2000;
/**
 * Grace added on top of a clip's own length before the stall watchdog gives up
 * on it. A clip that loads and starts playing but then stalls fires neither
 * `ended` nor `error`, so nothing else in the tour would ever advance that step
 * — the visitor is left under the scrim with no way forward. The ceiling is
 * derived from the media (its `duration` once known, with the step's `dwellMs`
 * as the floor) plus this slack, deliberately generous so a slow connection
 * re-buffering mid-sentence is never cut short.
 */
const STALL_SLACK_MS = 8000;

/**
 * Record the stall degradation without any user-derived data: numbers and an
 * in-repo constant string only. Checked against `src/lib/sentry-pii.ts` —
 * neither key is in SENSITIVE_FIELDS and neither value can carry a UUID, URL,
 * email or quoted name, so nothing here depends on the scrubber to be safe.
 */
function breadcrumbStall(stepIndex: number, ceilingMs: number): void {
  if (typeof window === "undefined") return;
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "tour",
        level: "warning",
        message: "tour narration stalled; advancing on the watchdog ceiling",
        data: { stepIndex, ceilingMs },
      });
    })
    .catch(() => {
      /* Sentry is optional — the watchdog still advances the tour. */
    });
}
/** Pause after the intro pop-up appears before Athena starts speaking. Kept
 *  generous so the homepage greeting doesn't autoplay the instant the tour
 *  starts — it should feel like a beat, not a jump-scare. The avatar countdown
 *  (AvatarCountdown) is driven by this same value so the two stay in sync. */
export const INTRO_START_DELAY_MS = 4000;

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
  /** Output level applied to the audio element in real time (0..1). */
  volume: number;
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
  volume,
  next,
}: UseTourAudioArgs): AnalyserNode | null {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Latest volume, read when creating each clip so a newly-created audio
  // element starts at the current level (not the browser default of 1.0).
  const volumeRef = useRef(volume);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!active || atBridge) return;
    // Intro plays the greeting (no auto-advance); steps play their own clip.
    const step = atIntro ? null : steps[stepIndex];
    const src = atIntro ? introSrc : step?.audioSrc;
    if (!src) return;
    const audio = new Audio(src);
    // Apply the current volume immediately so each new clip honours the slider.
    // Read from the ref (not `volume`) to keep it out of the creation deps, so
    // dragging the slider doesn't tear down and re-create the audio element.
    audio.volume = volumeRef.current;
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
    let advanceId = 0;
    let ceilingId = 0;
    const clearCeiling = () => {
      if (ceilingId) window.clearTimeout(ceilingId);
      ceilingId = 0;
    };
    // Stall backstop. `ended` is the only thing that advances an audio-bearing
    // step, and a clip that stalls mid-playback fires neither `ended` nor
    // `error` — so arm a ceiling derived from the clip's own length (falling
    // back to the step's dwell while `duration` is still unknown) and advance
    // if it expires. Re-armed on `loadedmetadata`/`durationchange` (the real
    // duration replaces the floor) and on `play` (a resumed clip gets a fresh
    // budget); cleared on `pause`, `ended` and `error`, so a paused tour never
    // advances behind the visitor's back and the happy path never sees it fire.
    const armCeiling = () => {
      if (atIntro || !step) return;
      clearCeiling();
      const clipMs = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
      const ceilingMs = Math.max(clipMs, step.dwellMs) + STALL_SLACK_MS;
      ceilingId = window.setTimeout(() => {
        ceilingId = 0;
        breadcrumbStall(stepIndex, ceilingMs);
        next();
      }, ceilingMs);
    };
    // The intro greeting just plays; only step clips auto-advance the tour.
    // Insert a short pause after the clip ends so the spotlight breathes
    // before jumping to the next step.
    const onEnded = () => {
      clearCeiling();
      if (!atIntro) advanceId = window.setTimeout(next, INTER_STEP_PAUSE_MS);
    };
    const onError = () => {
      clearCeiling();
      if (!atIntro && step) fallbackId = window.setTimeout(next, step.dwellMs);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("loadedmetadata", armCeiling);
    audio.addEventListener("durationchange", armCeiling);
    audio.addEventListener("play", armCeiling);
    audio.addEventListener("pause", clearCeiling);
    // Armed from creation rather than from `play`, so a clip whose autoplay the
    // browser refuses (no user gesture yet) is covered too — that path fires no
    // media event at all and would otherwise strand the tour just as hard.
    armCeiling();
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("loadedmetadata", armCeiling);
      audio.removeEventListener("durationchange", armCeiling);
      audio.removeEventListener("play", armCeiling);
      audio.removeEventListener("pause", clearCeiling);
      clearCeiling();
      audio.pause();
      try {
        source?.disconnect();
      } catch {
        /* already disconnected */
      }
      if (fallbackId) window.clearTimeout(fallbackId);
      if (advanceId) window.clearTimeout(advanceId);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [active, atIntro, atBridge, introSrc, stepIndex, next, steps]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!(active && playing && !atBridge)) {
      audio.pause();
      return;
    }
    // Let the intro pop-up settle before Athena speaks; steps play at once.
    if (atIntro) {
      const id = window.setTimeout(() => audio.play().catch(() => {}), INTRO_START_DELAY_MS);
      return () => window.clearTimeout(id);
    }
    audio.play().catch(() => {});
  }, [active, playing, atBridge, atIntro, stepIndex, steps]);

  // Apply slider changes to the live audio element in real time, and keep the
  // ref in sync so the next clip created starts at this level.
  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Close the Web Audio context on unmount. The per-clip cleanup only
  // disconnects the source node — without this, the lazily-created AudioContext
  // leaks, and repeated tour runs exhaust the browser's per-document context cap
  // (~6 in Chromium), silently killing narration and the companion's voice glow.
  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  return analyser;
}
