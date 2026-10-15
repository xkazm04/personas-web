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
import { usePageVisibility } from "@/hooks/usePageVisibility";
import type { TourStep } from "@/lib/tour-script";
import { INTRO_AUDIO_SRC } from "@/lib/tour-audio";
import { onTourSignal } from "@/lib/tourSignals";
import {
  NO_TALLY,
  actionsRunOnClock,
  armStepDwell,
  armStepSignal,
  clipAdvances,
  outcomeOf,
  tallySignal,
  type ShiftTally,
} from "@/lib/tour-progress";
import { navigateDashboard } from "@/components/dashboard/spa/navigate";
import { useTourAudio } from "@/hooks/useTourAudio";
import { useTourScroll } from "@/hooks/useTourScroll";
import { useTourVolume } from "@/hooks/useTourVolume";
import { useTourNavigation } from "@/hooks/useTourNavigation";
import { useTourSpotlightSequence } from "@/hooks/useTourSpotlightSequence";
import { useTourCueClock } from "@/hooks/useTourCueClock";
import { useTourKeyboard } from "@/hooks/useTourKeyboard";

/** Translated copy for the end-of-tour bridge prompt. */
export interface TourBridgeStrings {
  prompt: string;
  confirm: string;
  dismiss: string;
}

/** Options for a tour run. */
export interface TourStartOptions {
  /** Finishing the last step navigates here (e.g. "/features?tour=1"). */
  bridgeHref?: string;
  /** Per-tour bridge copy; falls back to t.tour defaults when unset. */
  bridge?: TourBridgeStrings;
  /** Show the welcome intro pop-up before the first step. */
  intro?: boolean;
}

/** The end of a tour the visitor finished by acting: what they did, and where it led. */
export interface TourRecap extends ShiftTally {
  /** The tour opened the run the visitor's last action was about. */
  openedRun: boolean;
}

interface TourContextValue {
  /** Whether the tour overlay is mounted. */
  active: boolean;
  /** Steps array of the currently-running script. */
  steps: TourStep[];
  /** Index into `steps` of the current step. */
  stepIndex: number;
  /** Selector the spotlight is currently tracking (follows in-step sweeps). */
  activeSpotlight: string | null;
  /** Whether auto-advance is running. */
  playing: boolean;
  /** Whether the end-of-tour bridge prompt is showing. */
  atBridge: boolean;
  /** Whether the welcome intro pop-up is showing (before step 0). */
  atIntro: boolean;
  /** The recap of a tour the visitor finished by acting; null otherwise. */
  recap: TourRecap | null;
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
  /** Play the current step's demonstration (its `actions`) instead of doing it yourself. */
  showMe: () => void;
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
  const [recap, setRecap] = useState<TourRecap | null>(null);
  // "Show me" presses: the step they were for, and a count so a second press replays.
  const [shown, setShown] = useState<{ step: number; n: number }>({ step: -1, n: 0 });
  const [volume, setVolume] = useTourVolume();
  const prefersReducedMotion = useStillMotion();
  const hidden = usePageVisibility();
  // What the visitor did this run, counted from the signals the tour saw.
  const tallyRef = useRef<ShiftTally>(NO_TALLY);

  const start = useCallback((nextSteps: TourStep[], options?: TourStartOptions) => {
    setSteps(nextSteps);
    setStepIndex(0);
    setBridgeHref(options?.bridgeHref ?? null);
    setBridge(options?.bridge ?? null);
    setAtBridge(false);
    setAtIntro(options?.intro ?? false);
    setRecap(null);
    setShown({ step: -1, n: 0 });
    tallyRef.current = NO_TALLY;
    setActive(true);
    setPlaying(true);
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setPlaying(false);
    setAtBridge(false);
    setAtIntro(false);
    setRecap(null);
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

  // A user-started demonstration: refused while the tab is hidden (nobody is
  // watching it), and it un-pauses the tour so its clock runs.
  const showMe = useCallback(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    setShown((s) => ({ step: stepIndex, n: s.n + 1 }));
    setPlaying(true);
  }, [stepIndex]);

  // A new step forgets the last step's "Show me" (prev-state reset, React 19).
  const [shownStepIndex, setShownStepIndex] = useState(stepIndex);
  if (stepIndex !== shownStepIndex) {
    setShownStepIndex(stepIndex);
    setShown((s) => ({ step: -1, n: s.n }));
  }

  const stepping = active && !atBridge && !atIntro && !recap && steps.length > 0;
  const step = steps[stepIndex];

  // Count what the visitor does for the whole run (the recap's numbers).
  useEffect(() => {
    if (!active) return;
    return onTourSignal((signal) => {
      tallyRef.current = tallySignal(tallyRef.current, signal);
    });
  }, [active]);

  // The step's own exit: the visitor's action. Armed while stepping, paused or
  // not (an action is explicit), re-armed on step change.
  useEffect(() => {
    if (!stepping || !step) return;
    const last = stepIndex >= steps.length - 1;
    return armStepSignal(step, (signal) => {
      const outcome = outcomeOf(step, last, signal);
      if (outcome.type === "next") {
        next();
        return;
      }
      // The visitor finished the tour by acting: say what they did, and take
      // them where their action leads (the run behind their verdict).
      setPlaying(false);
      setRecap({ ...tallyRef.current, openedRun: outcome.href !== null });
      if (outcome.href) navigateDashboard(outcome.href);
    });
  }, [stepping, step, stepIndex, steps.length, next]);

  // Dwell-timer fallback (audio steps advance on `ended`; a step that waits
  // for its signal never dwells). Held while paused or the tab is hidden.
  useEffect(() => {
    if (!stepping || !playing || hidden || !step) return;
    return armStepDwell(step, next);
  }, [stepping, playing, hidden, step, next]);

  // A clip's end advances the step, unless the step waits for the visitor.
  const advanceAfterClip = useCallback(() => {
    if (clipAdvances(steps[stepIndex])) next();
  }, [steps, stepIndex, next]);

  // Live narration element: its currentTime is the step clock the cues run on.
  const narrationRef = useRef<HTMLAudioElement | null>(null);

  // Narration audio + AnalyserNode for the Athena companion's reactivity.
  const audioAnalyser = useTourAudio({
    active: active && !recap,
    atIntro,
    atBridge,
    introSrc: INTRO_AUDIO_SRC,
    playing,
    stepIndex,
    steps,
    volume,
    next: advanceAfterClip,
    clockRef: narrationRef,
  });

  // Timed in-step manipulations: each action's `run` fires when the step's
  // narration clock (audio currentTime, or a virtual clock on silent steps)
  // passes its `atMs`. The clock freezes while paused, so a pause stops the
  // diagram too; it is re-armed from zero on step change / exit. A step the
  // visitor does (`advanceOn`) plays its actions only on "Show me", re-armed
  // from zero on each press.
  const stepActions = step?.actions;
  const actionCues = useMemo(
    () => stepActions?.map((a) => ({ atMs: a.atMs, fire: a.run })),
    [stepActions],
  );
  const shownHere = shown.step === stepIndex;
  const actionsArmed = actionsRunOnClock(step) || shownHere;
  useTourCueClock(stepping && actionsArmed, playing, `${stepIndex}:${shownHere ? shown.n : 0}`, narrationRef, actionCues);

  // Navigate cross-page steps, resolve the live spotlight target (which follows
  // in-step sweeps), and scroll it into view (all paused during the intro). Not
  // after a recap: the tour has handed the visitor to where their action led.
  useTourNavigation(active && !recap, stepIndex, steps);
  const activeSpotlight = useTourSpotlightSequence(active, atIntro, playing, stepIndex, steps, narrationRef);
  useTourScroll(active && !atIntro && !recap, activeSpotlight, step?.scrollTarget ?? null, prefersReducedMotion);

  useTourKeyboard(active, { exit, next, prev });

  const value = useMemo<TourContextValue>(
    () => ({ active, steps, stepIndex, activeSpotlight, playing, atBridge, atIntro, recap, audioAnalyser, volume, setVolume, bridge, start, exit, next, prev, goTo, togglePlay, beginTour, confirmBridge, dismissBridge, showMe }),
    [active, steps, stepIndex, activeSpotlight, playing, atBridge, atIntro, recap, audioAnalyser, volume, setVolume, bridge, start, exit, next, prev, goTo, togglePlay, beginTour, confirmBridge, dismissBridge, showMe],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}
