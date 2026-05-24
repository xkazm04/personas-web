"use client";

import { useEffect, useState } from "react";
import type { TourStep } from "@/lib/tour-script";

/**
 * Resolves the spotlight target *currently* in focus.
 *
 * Most steps just spotlight `step.spotlightTarget`. A step with a
 * `spotlightSequence` (the dashboard home sweep) instead walks several targets
 * on one continuous narration clip: this schedules a timer per cue and returns
 * whichever target is active, starting from `spotlightTarget` until the first
 * cue fires. Timers are cleared and the override reset whenever the step
 * changes, so each step starts clean.
 */
export function useTourSpotlightSequence(
  active: boolean,
  atIntro: boolean,
  stepIndex: number,
  steps: TourStep[],
): string | null {
  const [override, setOverride] = useState<string | null>(null);

  useEffect(() => {
    if (!active || atIntro || steps.length === 0) return;
    // Reset to the step's base target on entry. Deferred out of the effect
    // body to satisfy React 19's "no synchronous setState in effect" rule.
    queueMicrotask(() => setOverride(null));
    const cues = steps[stepIndex]?.spotlightSequence;
    if (!cues || cues.length === 0) return;
    const ids = cues.map((cue) =>
      window.setTimeout(() => setOverride(cue.target), cue.atMs),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [active, atIntro, stepIndex, steps]);

  if (steps.length === 0) return null;
  return override ?? steps[stepIndex]?.spotlightTarget ?? null;
}
