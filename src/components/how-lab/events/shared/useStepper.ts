"use client";

import { useEffect, useState } from "react";

/**
 * A choreography clock: steps through `durations` (ms per step) and wraps,
 * only while `run` holds (the loop gate: reduced motion, a hidden tab or an
 * off-screen stage all stop it). Changing `resetKey` restarts at step 0, via
 * the prev-state pattern rather than a setState inside an effect.
 */
export function useStepper(run: boolean, durations: readonly number[], resetKey = ""): number {
  const [state, setState] = useState({ key: resetKey, step: 0 });
  let step = state.step;
  if (state.key !== resetKey) {
    setState({ key: resetKey, step: 0 });
    step = 0;
  }

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(
      () => setState((s) => ({ key: s.key, step: (s.step + 1) % durations.length })),
      durations[step] ?? 1000,
    );
    return () => window.clearTimeout(id);
  }, [run, step, durations]);

  return step;
}
