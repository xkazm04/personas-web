/**
 * B2 "Hive" - geometry of the honeycomb floor, in the plane's own units
 * (viewBox VB_W x VB_H; row 0 is the far edge at the horizon). Pointy-top
 * hexagons in odd-row offset layout. Everything here is static data, so the
 * lattice is one <path> painted once.
 */

export const VB_W = 2600;
export const VB_H = 840;
export const R = 34;
const W = Math.sqrt(3) * R;
const COLS = Math.ceil(VB_W / W) + 1;
const ROWS = Math.ceil(VB_H / (1.5 * R)) + 1;

export type Cell = readonly [col: number, row: number];

export function cellCenter([c, r]: Cell): [number, number] {
  return [c * W + (r % 2) * (W / 2) + W / 2, r * 1.5 * R + R];
}

export function hexPoints(cx: number, cy: number, rad = R): string {
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = ((-90 + k * 60) * Math.PI) / 180;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Every cell outline, as one path. */
export const LATTICE_PATH: string = (() => {
  const parts: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [cx, cy] = cellCenter([c, r]);
      parts.push(`M${hexPoints(cx, cy, R - 3).replaceAll(" ", "L")}Z`);
    }
  }
  return parts.join("");
})();

/** A plane point as CSS percentages, for HTML layered on the plane. */
export function pct([x, y]: [number, number]): { left: string; top: string } {
  return { left: `${((x / VB_W) * 100).toFixed(3)}%`, top: `${((y / VB_H) * 100).toFixed(3)}%` };
}

export interface Scenario {
  /** Index into the event / done copy arrays. */
  copy: number;
  hue: string;
  /** Seconds into the 9s cycle this scenario starts. */
  offset: number;
  /** Neighbouring cells: the event lands on the first, the work leaves from the last. */
  cells: readonly Cell[];
}

export const CYCLE_S = 9;
export const STEP_S = 0.36;

export const SCENARIOS: readonly Scenario[] = [
  { copy: 0, hue: "var(--brand-cyan)", offset: 0.3, cells: [[15, 4], [15, 5], [16, 5], [16, 6], [16, 7], [17, 7]] },
  { copy: 1, hue: "var(--brand-purple)", offset: 3.3, cells: [[27, 5], [27, 6], [26, 7], [26, 8], [25, 8], [25, 9]] },
  { copy: 2, hue: "var(--brand-emerald)", offset: 6.3, cells: [[19, 8], [20, 8], [20, 9], [21, 9], [21, 10], [22, 10]] },
];

/** Idle cells that glow now and then: the hive is never fully asleep. */
export const TWINKLES: readonly Cell[] = [
  [10, 3], [13, 9], [19, 2], [24, 6], [26, 10], [33, 3], [35, 8], [12, 6], [20, 7], [31, 11], [8, 8], [37, 5], [18, 12], [27, 1],
];
