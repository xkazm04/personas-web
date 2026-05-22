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
import { TOUR_STEPS } from "@/lib/tour-script";

interface TourContextValue {
  /** Whether the tour overlay is mounted. */
  active: boolean;
  /** Index into TOUR_STEPS of the current step. */
  stepIndex: number;
  /** Whether auto-advance is running. */
  playing: boolean;
  start: () => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  togglePlay: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
    setPlaying(true);
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setPlaying(false);
  }, []);

  // Advancing past the final step ends the tour — so the dwell timer and the
  // manual "next" control share one terminal behaviour.
  const next = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      setActive(false);
      setPlaying(false);
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const goTo = useCallback((index: number) => {
    setStepIndex(Math.min(Math.max(0, index), TOUR_STEPS.length - 1));
  }, []);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  // Auto-advance. The timeout callback (not the effect body) is what mutates
  // state, so this stays clear of the React 19 "no setState in effect" rule.
  useEffect(() => {
    if (!active || !playing) return;
    const id = window.setTimeout(next, TOUR_STEPS[stepIndex].dwellMs);
    return () => window.clearTimeout(id);
  }, [active, playing, stepIndex, next]);

  // Centre the current step's spotlight target when the step changes. The
  // target lives inside a (possibly lazy) section, so if it isn't in the DOM
  // yet we scroll the always-present section wrapper into view to trigger
  // hydration, then retry until the real target can be centred.
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIndex];
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
  }, [active, stepIndex, prefersReducedMotion]);

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
    () => ({ active, stepIndex, playing, start, exit, next, prev, goTo, togglePlay }),
    [active, stepIndex, playing, start, exit, next, prev, goTo, togglePlay],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}
