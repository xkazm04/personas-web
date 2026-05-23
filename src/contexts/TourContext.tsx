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
import type { TourStep } from "@/lib/tour-script";

/** Options for a tour run. */
interface TourStartOptions {
  /**
   * If set, finishing the last step shows a "continue?" bridge prompt instead
   * of exiting; confirming navigates here (e.g. "/features?tour=1").
   */
  bridgeHref?: string;
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
  start: (steps: TourStep[], options?: TourStartOptions) => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  togglePlay: () => void;
  /** Accept the bridge prompt — navigates to the bridge href. */
  confirmBridge: () => void;
  /** Decline the bridge prompt — ends the tour. */
  dismissBridge: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bridgeHref, setBridgeHref] = useState<string | null>(null);
  const [atBridge, setAtBridge] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const start = useCallback((nextSteps: TourStep[], options?: TourStartOptions) => {
    setSteps(nextSteps);
    setStepIndex(0);
    setBridgeHref(options?.bridgeHref ?? null);
    setAtBridge(false);
    setActive(true);
    setPlaying(true);
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setPlaying(false);
    setAtBridge(false);
  }, []);

  // Advancing past the final step ends the tour — unless a bridge href is set,
  // in which case we show the "continue?" prompt instead. The dwell timer and
  // the manual "next" control share this terminal behaviour.
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

  // Auto-advance. The timeout callback (not the effect body) mutates state,
  // so this stays clear of the React 19 "no setState in effect" rule.
  useEffect(() => {
    if (!active || !playing || atBridge || steps.length === 0) return;
    const id = window.setTimeout(next, steps[stepIndex].dwellMs);
    return () => window.clearTimeout(id);
  }, [active, playing, atBridge, stepIndex, next, steps]);

  // Timed in-step manipulations: fire each action's `run` on its own timer,
  // relative to the moment the step becomes active. Re-armed on every step
  // entry; all pending timers cleared on step change / exit. Keyed on
  // stepIndex (not playing) so a manipulation fires once per entry.
  useEffect(() => {
    if (!active || steps.length === 0) return;
    const actions = steps[stepIndex].actions;
    if (!actions || actions.length === 0) return;
    const ids = actions.map((a) => window.setTimeout(a.run, a.atMs));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [active, stepIndex, steps]);

  // Centre the current step's spotlight target when the step changes. The
  // target lives inside a (possibly lazy) section, so if it isn't in the DOM
  // yet we scroll the always-present section wrapper into view to trigger
  // hydration, then retry until the real target can be centred.
  useEffect(() => {
    if (!active || steps.length === 0) return;
    const step = steps[stepIndex];
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const center = () => {
      const spot = document.querySelector<HTMLElement>(step.spotlightTarget);
      if (spot) {
        spot.scrollIntoView({ behavior, block: "center" });
        return true;
      }
      document
        .querySelector<HTMLElement>(step.scrollTarget)
        ?.scrollIntoView({ behavior, block: "center" });
      return false;
    };

    if (center()) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (center() || tries > 12) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, [active, stepIndex, prefersReducedMotion, steps]);

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
    () => ({
      active, steps, stepIndex, playing, atBridge,
      start, exit, next, prev, goTo, togglePlay, confirmBridge, dismissBridge,
    }),
    [active, steps, stepIndex, playing, atBridge,
     start, exit, next, prev, goTo, togglePlay, confirmBridge, dismissBridge],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}
