import type { LabCase, ToolKey } from "../shared/catalog";

/**
 * Reel strip maths for V2. Each reel's strip repeats its candidates REPEAT
 * times plus a three-cell tail, so both the resting frame and the stopping
 * frame have neighbours above and below the payline. The window shows ROWS
 * cells with the payline on the middle one.
 */

export const ROWS = 5;
export const PAYLINE_ROW = 2;
const REPEAT = 4;
const TAIL = 3;

export function stripOf(c: LabCase): ToolKey[] {
  const n = c.candidates.length;
  return Array.from({ length: REPEAT * n + TAIL }, (_, i) => c.candidates[i % n]);
}

/** Strip index on the payline before the spin (never the chosen tool) and after it (the chosen tool, last lap). */
export function stops(c: LabCase) {
  const n = c.candidates.length;
  const pos = c.candidates.indexOf(c.chosen);
  return { start: n + ((pos + 2) % n), end: (REPEAT - 1) * n + pos };
}

/** translateY (percent of the strip's own height) that puts strip index `idx` on the payline. */
export function yFor(idx: number, length: number): string {
  return `${-(((idx - PAYLINE_ROW) / length) * 100).toFixed(3)}%`;
}
