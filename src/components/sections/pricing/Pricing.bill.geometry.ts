/**
 * Geometry for the "bill" pricing illustration: one agent run leaves Personas on
 * your computer, passes the Claude Code CLI and reaches Claude at Anthropic; the
 * only payment line runs from your Claude plan to Anthropic, never through the box
 * that holds Personas. Two layouts from plain numbers (no DOM measurement): WIDE
 * for the desktop stage, TALL for phones so labels stay legible.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Pt = [number, number];

export interface BillLayout {
  w: number;
  h: number;
  machine: Box;
  machineLegend: { at: Pt; anchor: "start" | "end" };
  tag: Box;
  personas: Box;
  cli: Box;
  chip: Box;
  cloud: Box;
  cloudLegend: Pt;
  claude: Box;
  /** The run's lane, from Personas to Claude. */
  lane: Pt[];
  /** The plan's payment line, from the wallet to Anthropic. */
  money: Pt[];
  wallet: Pt;
  planLabel: Pt;
  beats: Pt[];
  font: number;
}

export const WIDE: BillLayout = {
  w: 1000,
  h: 400,
  machine: { x: 16, y: 16, w: 548, h: 250 },
  machineLegend: { at: [540, 64], anchor: "end" },
  tag: { x: 48, y: 40, w: 200, h: 36 },
  personas: { x: 48, y: 96, w: 200, h: 80 },
  cli: { x: 316, y: 96, w: 224, h: 80 },
  chip: { x: 48, y: 192, w: 262, h: 62 },
  cloud: { x: 636, y: 16, w: 320, h: 250 },
  cloudLegend: [660, 64],
  claude: { x: 686, y: 96, w: 220, h: 80 },
  lane: [
    [248, 136],
    [686, 136],
  ],
  money: [
    [98, 330],
    [810, 330],
    [810, 272],
  ],
  wallet: [48, 312],
  planLabel: [112, 318],
  beats: [
    [16, 382],
    [266, 382],
    [516, 382],
    [766, 382],
  ],
  font: 18,
};

export const TALL: BillLayout = {
  w: 400,
  h: 880,
  machine: { x: 12, y: 12, w: 376, h: 380 },
  machineLegend: { at: [368, 56], anchor: "end" },
  tag: { x: 32, y: 32, w: 190, h: 34 },
  personas: { x: 32, y: 90, w: 336, h: 72 },
  cli: { x: 32, y: 196, w: 336, h: 72 },
  chip: { x: 32, y: 296, w: 262, h: 64 },
  cloud: { x: 12, y: 440, w: 376, h: 160 },
  cloudLegend: [32, 474],
  claude: { x: 32, y: 500, w: 336, h: 72 },
  lane: [
    [340, 162],
    [340, 500],
  ],
  money: [
    [82, 660],
    [200, 660],
    [200, 606],
  ],
  wallet: [32, 642],
  planLabel: [32, 716],
  beats: [
    [12, 766],
    [12, 796],
    [12, 826],
    [12, 856],
  ],
  font: 16,
};

/** Point at fraction f (0..1) of a polyline's length. */
export function along(pts: Pt[], f: number): Pt {
  const segs = pts.slice(1).map((b, i) => {
    const a = pts[i];
    return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  });
  const total = segs.reduce((s, g) => s + g.len, 0);
  let left = Math.min(1, Math.max(0, f)) * total;
  for (const g of segs) {
    if (left <= g.len) {
      const k = g.len ? left / g.len : 0;
      return [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k];
    }
    left -= g.len;
  }
  return pts[pts.length - 1];
}

export const pathD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Local progress of a beat window. */
export const beat = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

/**
 * Beats on one progress value p (0..1); p = 1 is the resting state.
 *   0.00-0.30  the run travels Personas -> Claude Code CLI -> Claude
 *   0.30-0.45  Claude works (a ring pulses)
 *   0.45-0.62  the result returns to Personas
 *   0.60-0.70  the cost chip appears: API price, included in your plan
 *   0.70-0.92  the plan's payment runs from the wallet to Anthropic
 *   0.90-1.00  the $0 tag on Personas settles
 */
export const BEAT_START = [0, 0.12, 0.3, 0.6];
