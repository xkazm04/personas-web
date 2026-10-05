"use client";

import { useEffect, useReducer, useState, type RefObject } from "react";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { CASES } from "./catalog";
import { initialCycle, isDocked, isFinale, reduceCycle, stageCase, type Phase } from "./cycle";

/** Milliseconds per beat: NEED, CONSIDER, SCAN, CHOOSE, DOCK. */
export type Beats = readonly [number, number, number, number, number];

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const ARM_RATIO = 0.35;

/**
 * Drives the cycle (cycle.ts) for one variant. Ticks only while the block is
 * at least a third on screen and the tab is foregrounded; arms itself once on
 * first sight unless the visitor prefers reduced motion. A reduced-motion
 * visitor rests on one composed case and can still step or press Play.
 */
export function useCaseCycle(rootRef: RefObject<HTMLElement | null>, still: boolean, beats: Beats, finaleMs = 2800) {
  const [s, dispatch] = useReducer(reduceCycle, CASES.length, initialCycle);
  const [inView, setInView] = useState(false);
  const hidden = usePageVisibility();

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const seen = entry.intersectionRatio >= ARM_RATIO;
        setInView(seen);
        if (seen && !window.matchMedia(REDUCE_QUERY).matches) dispatch({ type: "ARM" });
      },
      { threshold: [0, ARM_RATIO, 0.7] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

  const ticking = s.mode === "playing" && inView && !hidden && (!still || s.userPlayed);
  const ms = isFinale(s) ? finaleMs : beats[s.phase];

  useEffect(() => {
    if (!ticking) return;
    const id = window.setTimeout(() => dispatch({ type: "TICK" }), ms);
    return () => window.clearTimeout(id);
  }, [ticking, ms, s.caseIdx, s.phase, s.run]);

  const active = stageCase(s);
  return {
    state: s,
    /** The case on stage and its beat; during the finale, the last case at DOCK. */
    active,
    phase: (isFinale(s) ? 4 : s.phase) as Phase,
    finale: isFinale(s),
    docked: CASES.map((_, i) => isDocked(s, i)),
    playing: s.mode === "playing",
    /** The loop is actually advancing (visible, foregrounded, allowed). */
    ticking,
    /** Animate transitions (false = jump, for reduced motion without a visitor's Play). */
    moving: !still || s.userPlayed,
    run: s.run,
    toggle: () => dispatch({ type: s.mode === "playing" ? "PAUSE" : "PLAY" }),
    replay: () => dispatch({ type: "REPLAY" }),
    next: () => dispatch({ type: "NEXT" }),
    prev: () => dispatch({ type: "PREV" }),
  };
}

export type CaseCycle = ReturnType<typeof useCaseCycle>;
