/**
 * The dense field itself — which project sits on which row, what every quiet
 * reading looks like, and the drift the opened one has been doing.
 *
 * Pure index arithmetic, no DOM, no React, and above all no rolling: a field
 * of ninety-nine readings still has to render identically on the server, on
 * the client, and on every tick of the loop, so the "organic" variation in the
 * calm majority comes out of the cell's own coordinates.
 *
 * Calm is a STATE here, not an absence. A fine reading is a fully drawn,
 * fully themed mark that simply has nothing to say — which is the only way the
 * few that do have something to say can read as louder rather than as the only
 * ones that finished loading.
 */

import { COMPACT_ROWS, FINDINGS, PROJECTS } from "./copy";
import type { FieldLayout } from "./layout";

/** The projects on screen, top to bottom, at this breakpoint. */
export function rowsFor(L: FieldLayout): readonly number[] {
  return L.compact ? COMPACT_ROWS : PROJECTS.map((_, i) => i);
}

/** Which row a project is on — how a finding knows the cell it came out of. */
export function rowOf(L: FieldLayout, project: number): number {
  return rowsFor(L).indexOf(project);
}

/** Every finding's row at this breakpoint, in `FINDINGS` order. */
export function findingRows(L: FieldLayout): number[] {
  return FINDINGS.map((f) => rowOf(L, f.project));
}

export const TOTAL = (L: FieldLayout) => L.rows * L.cols;

/**
 * Weight of one calm reading, 0…1. Six authored steps walked by a coprime
 * stride so no two neighbours match and no column ever stripes — texture that
 * looks unplanned and is completely determined.
 */
const TONES = [0.72, 1, 0.55, 0.86, 0.63, 0.95] as const;
export function calmTone(row: number, col: number): number {
  return TONES[(row * 5 + col * 3) % TONES.length];
}

/**
 * The opened reading's history: ten samples that sit quietly under the line
 * everyone agreed was fine, and then do not. Drawn, not labelled — "how long
 * it has been drifting" is a shape long before it is a number.
 */
export const DRIFT = [0.12, 0.16, 0.11, 0.19, 0.15, 0.23, 0.31, 0.46, 0.63, 0.88] as const;
/** Where fine stopped. */
export const DRIFT_SAFE = 0.5;
