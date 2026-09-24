"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { tools } from "./data";

/**
 * Playback for the persona-card variant: one progress value, `attached.length`,
 * walks 0 -> 8 once. Each beat connects the next real tool to the same persona.
 *
 * Resting state (server render, reduced motion, finished, paused-by-choice):
 * every tool attached, the first one focused. Playback is armed on the client
 * only, from IntersectionObserver callbacks, and never under reduced motion.
 */

export const BEAT_MS = 1700;
export const FIRST_BEAT_MS = 900;
const ALL_IDS = tools.map((tl) => tl.id);
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

type Mode = "rest" | "playing" | "paused";

interface State {
  mode: Mode;
  attached: string[];
  focus: string | null;
  /** A visitor has chosen a tool; arming must not undo their choice. */
  touched: boolean;
}

const RESTING: State = { mode: "rest", attached: ALL_IDS, focus: ALL_IDS[0], touched: false };

export function usePersonaPlayback(rootRef: RefObject<HTMLElement | null>, still: boolean) {
  const [state, setState] = useState<State>(RESTING);
  const [inView, setInView] = useState(false);
  const armedRef = useRef(false);

  // Arm once: reset to an empty card just before the box scrolls in, then tick
  // only while at least a third of it is visible.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || still) return;
    const reduce = () => window.matchMedia(REDUCE_QUERY).matches;
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || armedRef.current || reduce()) return;
        armedRef.current = true;
        setState((s) => (s.touched ? s : { ...s, mode: "playing", attached: [], focus: null }));
        approach.disconnect();
      },
      { rootMargin: "0px 0px 240px 0px" },
    );
    const visible = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.3), {
      threshold: [0, 0.3, 0.6],
    });
    approach.observe(el);
    visible.observe(el);
    return () => {
      approach.disconnect();
      visible.disconnect();
    };
  }, [rootRef, still]);

  const ticking = state.mode === "playing" && inView && !still;
  const step = state.attached.length;

  useEffect(() => {
    if (!ticking) return;
    const id = window.setTimeout(
      () => {
        setState((s) => {
          if (s.mode !== "playing") return s;
          const next = ALL_IDS.find((id) => !s.attached.includes(id));
          if (!next) return { ...s, mode: "rest" };
          const attached = [...s.attached, next];
          return { ...s, mode: attached.length === ALL_IDS.length ? "rest" : "playing", attached, focus: next };
        });
      },
      step === 0 ? FIRST_BEAT_MS : BEAT_MS,
    );
    return () => window.clearTimeout(id);
  }, [ticking, step]);

  /** A visitor picks a tool: stop playback, connect it if needed, focus it. */
  const choose = useCallback((id: string) => {
    setState((s) => ({
      mode: s.mode === "rest" ? "rest" : "paused",
      attached: s.attached.includes(id) ? s.attached : [...s.attached, id],
      focus: id,
      touched: true,
    }));
  }, []);

  /** Pause, resume, or (when finished) replay from an empty card. */
  const toggle = useCallback(() => {
    setState((s) => {
      if (s.mode === "playing") return { ...s, mode: "paused" };
      if (s.attached.length < ALL_IDS.length) return { ...s, mode: "playing" };
      return { ...s, mode: "playing", attached: [], focus: null };
    });
  }, []);

  return {
    attached: state.attached,
    focus: state.focus,
    playing: state.mode === "playing",
    ticking,
    step,
    complete: state.attached.length === ALL_IDS.length,
    choose,
    toggle,
  };
}
