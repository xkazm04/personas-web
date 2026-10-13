"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import type { TourStep } from "@/lib/tour-script";
import { INTRO_AUDIO_SRC } from "@/lib/tour-audio";
import { useTourAudio } from "@/hooks/useTourAudio";
import { useTourScroll } from "@/hooks/useTourScroll";
import { useTourVolume } from "@/hooks/useTourVolume";
import { useTourNavigation } from "@/hooks/useTourNavigation";
import { useTourSpotlightSequence } from "@/hooks/useTourSpotlightSequence";
import { useTourCueClock } from "@/hooks/useTourCueClock";
import { useTourKeyboard } from "@/hooks/useTourKeyboard";
import type { TourBridgeStrings, TourContextValue, TourStartOptions } from "./tourTypes";

export type { TourBridgeStrings } from "./tourTypes";

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bridgeHref, setBridgeHref] = useState<string | null>(null);
  const [bridge, setBridge] = useState<TourBridgeStrings | null>(null);
  const [atBridge, setAtBridge] = useState(false);
  const [atIntro, setAtIntro] = useState(false);
  const [volume, setVolume] = useTourVolume();
  const prefersReducedMotion = useStillMotion();

  const start = useCallback((nextSteps: TourStep[], options?: TourStartOptions) => {
    setSteps(nextSteps);
    setStepIndex(0);
    setBridgeHref(options?.bridgeHref ?? null);
    setBridge(options?.bridge ?? null);
    setAtBridge(false);
    setAtIntro(options?.intro ?? false);
    setActive(true);
    setPlaying(true);
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setPlaying(false);
    setAtBridge(false);
    setAtIntro(false);
  }, []);

  const beginTour = useCallback(() => setAtIntro(false), []);

  // Past the last step: show the bridge prompt if a href is set, else exit.
  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      if (bridgeHref) {
        setPlaying(false);
        setAtBridge(true);
      } else {
        setActive(false);
        setPlaying(false);
      }
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps.length, bridgeHref]);

  const confirmBridge = useCallback(() => {
    const href = bridgeHref;
    setActive(false);
    setAtBridge(false);
    // Full navigation so the destination's `?tour=1` autostart fires cleanly.
    if (href && typeof window !== "undefined") window.location.href = href;
  }, [bridgeHref]);

  const dismissBridge = useCallback(() => {
    setActive(false);
    setAtBridge(false);
  }, []);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const goTo = useCallback((index: number) => {
    setStepIndex((current) => {
      if (steps.length === 0) return current;
      return Math.min(Math.max(0, index), steps.length - 1);
    });
  }, [steps.length]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  // Dwell-timer auto-advance for steps without audio (audio uses `ended`).
  useEffect(() => {
    if (!active || !playing || atBridge || atIntro || steps.length === 0) return;
    if (steps[stepIndex].audioSrc) return;
    const id = window.setTimeout(next, steps[stepIndex].dwellMs);
    return () => window.clearTimeout(id);
  }, [active, playing, atBridge, atIntro, stepIndex, next, steps]);

  // Live narration element: its currentTime is the step clock the cues run on.
  const narrationRef = useRef<HTMLAudioElement | null>(null);

  // Narration audio + AnalyserNode for the Athena companion's reactivity.
  const audioAnalyser = useTourAudio({
    active,
    atIntro,
    atBridge,
    introSrc: INTRO_AUDIO_SRC,
    playing,
    stepIndex,
    steps,
    volume,
    next,
    clockRef: narrationRef,
  });

  // Timed in-step manipulations: each action's `run` fires when the step's
  // narration clock (audio currentTime, or a virtual clock on silent steps)
  // passes its `atMs`. The clock freezes while paused, so a pause stops the
  // diagram too; it is re-armed from zero on step change / exit.
  const stepActions = steps[stepIndex]?.actions;
  const actionCues = useMemo(
    () => stepActions?.map((a) => ({ atMs: a.atMs, fire: a.run })),
    [stepActions],
  );
  useTourCueClock(active && !atIntro && steps.length > 0, playing, stepIndex, narrationRef, actionCues);

  // Navigate cross-page steps, resolve the live spotlight target (which follows
  // in-step sweeps), and scroll it into view (all paused during the intro).
  useTourNavigation(active, stepIndex, steps);
  const activeSpotlight = useTourSpotlightSequence(active, atIntro, playing, stepIndex, steps, narrationRef);
  useTourScroll(active && !atIntro, activeSpotlight, steps[stepIndex]?.scrollTarget ?? null, prefersReducedMotion);

  useTourKeyboard(active, { exit, next, prev });

  const value = useMemo<TourContextValue>(
    () => ({ active, steps, stepIndex, activeSpotlight, playing, atBridge, atIntro, audioAnalyser, volume, setVolume, bridge, start, exit, next, prev, goTo, togglePlay, beginTour, confirmBridge, dismissBridge }),
    [active, steps, stepIndex, activeSpotlight, playing, atBridge, atIntro, audioAnalyser, volume, setVolume, bridge, start, exit, next, prev, goTo, togglePlay, beginTour, confirmBridge, dismissBridge],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}
