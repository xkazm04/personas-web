"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { REPLAY } from "@/components/athena/stage/athena-tokens";

/** How long the cramped six-panel stack holds before the collapse fires. */
export const STACK_HOLD_MS = 1600;

/**
 * Two-beat timeline for "The Collapse", replaying on every viewport
 * re-entry (shared REPLAY config): on entry the stack towers for
 * STACK_HOLD_MS, then `collapsed` flips true; leaving the viewport
 * resets it so the scene replays. Reduced motion pins the collapsed
 * end-state permanently — chip peeks still work, nothing animates.
 *
 * setState only ever runs inside a setTimeout (async), never in the
 * effect body — React 19 compiler-safe.
 */
export function useCollapsePhase<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  reduced: boolean;
  inView: boolean;
  collapsed: boolean;
} {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(ref, { once: REPLAY.once, amount: REPLAY.amount });
  const [collapsedState, setCollapsedState] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setCollapsedState(inView), inView ? STACK_HOLD_MS : 0);
    return () => clearTimeout(t);
  }, [inView, reduced]);

  return {
    ref,
    reduced,
    inView: reduced ? true : inView,
    collapsed: reduced || collapsedState,
  };
}
