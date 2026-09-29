"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useSequencer, type Step } from "./useSequencer";

/**
 * What a figure's script can do. `add` switches a named state on (the figure's
 * root gets the `ln-st-<name>` class, which the figure's CSS animates); `reset`
 * and `finish` jump to the empty or the finished frame without transitions.
 */
export interface FigureApi<S extends string> {
  add: (state: S) => void;
  reset: () => void;
  finish: () => void;
}

interface Options<S extends string> {
  /** Every state, in the order the finished frame has them switched on. */
  all: readonly S[];
  /** Builds the steps for one playback. Runs at play time, never in render. */
  script: (api: FigureApi<S>) => Step[];
  /** Hooks for figure-local state (typed text, lamps): empty and finished frames. */
  onReset?: () => void;
  onFinish?: () => void;
}

export interface ConceptFigureState<S extends string> {
  ref: RefObject<HTMLElement | null>;
  states: readonly S[];
  /** Start the sequence from the empty frame (the Replay button). */
  play: () => void;
  /** True while a sequence is running. */
  playing: boolean;
  /** Ambient loops (blinking lamps) run only while true. */
  live: boolean;
  /** True under reduced motion: the finished frame is shown and Replay is inert. */
  still: boolean;
  /** True for one frame around a reset/finish so CSS can skip transitions. */
  snapping: boolean;
}

/**
 * Lifecycle for one concept illustration.
 *
 * - The first render is the FINISHED frame (matches the server render, and is
 *   what reduced-motion visitors keep).
 * - When the figure first scrolls into view (tab visible, motion allowed) it
 *   resets and plays once. Replay plays it again on demand; it refuses to start
 *   in a hidden tab.
 */
export function useConceptFigure<S extends string>({
  all,
  script,
  onReset,
  onFinish,
}: Options<S>): ConceptFigureState<S> {
  const ref = useRef<HTMLElement | null>(null);
  const still = useStillMotion();
  const visible = useIsVisible(ref, { threshold: 0.35 });
  const { run, cancel } = useSequencer();
  const [states, setStates] = useState<readonly S[]>(all);
  const [playing, setPlaying] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const started = useRef(false);

  const snap = useCallback((fn: () => void) => {
    setSnapping(true);
    fn();
    // Two frames: one to commit the jump without transitions, one to release.
    requestAnimationFrame(() => requestAnimationFrame(() => setSnapping(false)));
  }, []);

  const api: FigureApi<S> = {
    add: (state) => setStates((cur) => (cur.includes(state) ? cur : [...cur, state])),
    reset: () => snap(() => { setStates([]); onReset?.(); }),
    finish: () => snap(() => { setStates(all); onFinish?.(); }),
  };

  const play = useCallback(() => {
    if (still || typeof document === "undefined" || document.hidden) return;
    cancel();
    api.reset();
    setPlaying(true);
    run([...script(api), () => setPlaying(false)]);
    // `api` closes over stable setters only; `script` is the caller's contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still, cancel, run, script]);

  // First arrival on screen: play once.
  useEffect(() => {
    if (!visible || started.current || still) return;
    started.current = true;
    play();
  }, [visible, still, play]);

  return { ref, states, play, playing, live: visible && !still, still, snapping };
}
