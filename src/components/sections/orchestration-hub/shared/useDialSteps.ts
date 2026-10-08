"use client";

import { useState } from "react";

/**
 * A cumulative step count that follows `active` around a ring by the shortest
 * way: 9 -> 0 is +1, not -9, so a dial or an orbit driven by `steps * 360/N`
 * never unwinds the long way. Prev-state pattern - no effect, no clock.
 */
export function useDialSteps(active: number, count: number): number {
  const [dial, setDial] = useState({ index: active, steps: active });
  if (dial.index !== active) {
    let d = (((active - dial.index) % count) + count) % count;
    if (d > count / 2) d -= count;
    const next = { index: active, steps: dial.steps + d };
    setDial(next);
    return next.steps;
  }
  return dial.steps;
}
