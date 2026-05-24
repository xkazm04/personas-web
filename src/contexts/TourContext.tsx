"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { INTRO_AUDIO_SRC, type TourStep } from "@/lib/tour-script";
import { useTourAudio } from "@/hooks/useTourAudio";
import { useTourScroll } from "@/hooks/useTourScroll";
import { useTourVolume } from "@/hooks/useTourVolume";

/** Translated copy for the end-of-tour bridge prompt. */
export interface TourBridgeStrings {
  prompt: string;
  confirm: string;
  dismiss: string;
}

/** Options for a tour run. */
interface TourStartOptions {
  /** Finishing the last step navigates here (e.g. "/features?tour=1"). */
  bridgeHref?: string;
  /** Per-tour bridge copy; falls back to t.tour defaults when unset. */
  bridge?: TourBridgeStrings;
  /** Show the welcome intro pop-up before the first step. */
  intro?: boolean;
}

interface TourContextValue {
  /** Whether the tour overlay is mounted. */
  active: boolean;
  /** Steps array of the currently-running script. */
  steps: TourStep[];
  /** Index into `steps` of the current step. */
  stepIndex: number;
  /** Whether auto-advance is running. */
  playing: boolean;
  /** Whether the end-of-tour bridge prompt is showing. */
  atBridge: boolean;
  /** Whether the welcome intro pop-up is showing (before step 0). */
  atIntro: boolean;
  audioAnalyser: AnalyserNode | null;
  /** Narration output level (0..1). Persists via localStorage. */
  volume: number;
  setVolume: (value: number) => void;
  /** Per-tour bridge copy override; null = use the t.tour defaults. */
  bridge: TourBridgeStrings | null;
  start: (steps: TourStep[], options?: TourStartOptions) => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  togglePlay: () => void;
  beginTour: () => void;
  confirmBridge: () => void;
  dismissBridge: () => void;
}

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
  const prefersReducedMotion = useReducedMotion();

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
  });

  // Timed in-step manipulations: fire each action's `run` on its own timer
  // relative to step entry; all pending timers cleared on step change / exit.
  useEffect(() => {
    if (!active || atIntro || steps.length === 0) return;
    const actions = steps[stepIndex].actions;
    if (!actions || actions.length === 0) return;
    const ids = actions.map((a) => window.setTimeout(a.run, a.atMs));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [active, atIntro, stepIndex, steps]);

  // Scroll the current step's spotlight target into view (paused during intro).
  useTourScroll(active && !atIntro, stepIndex, steps, prefersReducedMotion);

  // Keyboard control: Escape exits, arrows step.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit, next, prev]);

  const value = useMemo<TourContextValue>(
    () => ({ active, steps, stepIndex, playing, atBridge, atIntro, audioAnalyser, volume, setVolume, bridge, start, exit, next, prev, goTo, togglePlay, beginTour, confirmBridge, dismissBridge }),
    [active, steps, stepIndex, playing, atBridge, atIntro, audioAnalyser, volume, setVolume, bridge, start, exit, next, prev, goTo, togglePlay, beginTour, confirmBridge, dismissBridge],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}
