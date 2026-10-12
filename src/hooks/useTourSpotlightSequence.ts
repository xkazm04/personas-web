"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import type { TourStep } from "@/lib/tour-script";
import { useTourCueClock } from "@/hooks/useTourCueClock";

/**
 * Resolves the spotlight target *currently* in focus.
 *
 * Most steps just spotlight `step.spotlightTarget`. A step with a
 * `spotlightSequence` (the dashboard home sweep) instead walks several targets
 * on one continuous narration clip: each cue fires on the step's narration
 * clock (so a pause, a slow audio start or a re-buffer cannot pull the picture
 * away from the voice), and the hook returns whichever target is active,
 * starting from `spotlightTarget` until the first cue fires. The override is
 * reset whenever the step changes, so each step starts clean.
 */
export function useTourSpotlightSequence(
  active: boolean,
  atIntro: boolean,
  playing: boolean,
  stepIndex: number,
  steps: TourStep[],
  audioRef: RefObject<HTMLAudioElement | null>,
): string | null {
  const [override, setOverride] = useState<string | null>(null);

  useEffect(() => {
    if (!active || atIntro || steps.length === 0) return;
    // Reset to the step's base target on entry. Deferred out of the effect
    // body to satisfy React 19's "no synchronous setState in effect" rule.
    queueMicrotask(() => setOverride(null));
  }, [active, atIntro, stepIndex, steps]);

  const sequence = steps[stepIndex]?.spotlightSequence;
  const cues = useMemo(
    () => sequence?.map((cue) => ({ atMs: cue.atMs, fire: () => setOverride(cue.target) })),
    [sequence],
  );
  useTourCueClock(active && !atIntro && steps.length > 0, playing, stepIndex, audioRef, cues);

  if (steps.length === 0) return null;
  return override ?? steps[stepIndex]?.spotlightTarget ?? null;
}
