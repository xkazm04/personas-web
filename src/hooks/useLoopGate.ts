"use client";

import { useEffect, type RefObject } from "react";
import { resolveLoop, resolveTicker, type LoopDecider } from "@/lib/motion/loop-gate";
import { useIsVisible } from "./useIsVisible";
import { usePageVisibility } from "./usePageVisibility";
import { useStillMotion } from "./useStillMotion";

interface UseLoopGateOptions {
  /** The visitor stopped this loop with a control (the "user" decider). */
  userStopped?: boolean;
  /** Passed to `useIsVisible` - e.g. "200px" to wake a loop just before it scrolls in. */
  rootMargin?: string;
}

export interface LoopGate {
  /** A decorative loop may run: no decider objects. */
  run: boolean;
  /** A data feed may tick: as `run`, but reduced motion abstains. */
  tick: boolean;
  /** Reduced motion is preferred - for one-shot entrances, which are not loops. */
  still: boolean;
  /** Which deciders stopped `run`, for "why is this still?". */
  vetoedBy: LoopDecider[];
}

/**
 * The loop gate for one surface: `resolveLoop` (src/lib/motion/loop-gate.ts)
 * fed from the live primitives, per consumer - no provider, no shared store.
 *
 * In-view comes from `useIsVisible`, which already merges in-view with tab
 * visibility; the tab state is read again from `usePageVisibility` (one
 * module-scoped subscription) only to tell the two deciders apart. While the
 * tab is hidden the in-view answer is unknowable from that merged value, so
 * in-view abstains and "foreground" carries the veto.
 */
export function useLoopGate<T extends Element>(
  ref: RefObject<T | null>,
  { userStopped = false, rootMargin }: UseLoopGateOptions = {},
): LoopGate {
  const stillPreferred = useStillMotion();
  const tabHidden = usePageVisibility();
  const visible = useIsVisible(ref, rootMargin === undefined ? {} : { rootMargin });
  const inputs = { stillPreferred, tabHidden, inView: tabHidden ? null : visible, userStopped };
  const loop = resolveLoop(inputs);
  return {
    run: loop.run,
    tick: resolveTicker(inputs).run,
    still: stillPreferred,
    vetoedBy: loop.vetoedBy,
  };
}

/**
 * SMIL (`<animate repeatCount="indefinite">`) is the one engine neither framer
 * nor the global CSS reset / `.page-hidden` projection reaches, so a loop gate
 * verdict has to be carried to it by hand: pause the SVG's own timeline while
 * `run` is false, resume it when it turns true.
 */
export function useSvgTimelineGate(ref: RefObject<SVGSVGElement | null>, run: boolean): void {
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (run) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [ref, run]);
}
