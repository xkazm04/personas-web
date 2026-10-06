/**
 * Geometry for "Vital signs" (lab v3): every project as a heartbeat over the
 * last two weeks, and one that has gone flat.
 *
 * Two spaces, both pure:
 *
 *   SLOT   percent of the art slot - where the HTML (names, your week, the
 *          watcher, the finding) sits.
 *   TRACE  the waveform SVG's own 1150 x (lanes x 100) viewBox. 0..1000 on x
 *          is the last 14 days up to today; 1000..1150 is the next two, where
 *          a project that has been mended starts beating again.
 *
 * Every beat is authored from the lane's own index - spacing, phase and
 * height vary per project, so the wall reads as many living things, not one
 * pattern repeated - and nothing is ever rolled.
 */

export const DAYS = 14;
export const TODAY = 1000;
export const SPAN = 1150;

/** Projects on the wall, top to bottom (indices into the translated list).
 *  Payments API (7) sits second so its opened detail has room below it. */
export const LANES = [0, 7, 2, 1, 5, 3, 8, 4] as const;
/** On phones the wall keeps the first six. */
export const LANES_COMPACT = 6;
export const WORST_LANE = 1;
export const ATTENTION_LANES = [2, 4] as const;

/** The day it went quiet - 11 days before today. */
export const QUIET_DAY = 3;

/** Slot layout, in percent. Wide: names in a left column, your week in a
 *  row of day-aligned blocks. Phone: names ride on their own lane (top-left,
 *  on a scrim), your week is a label over a row of chips. */
export interface WallLayout {
  compact: boolean;
  /** Lanes on the wall. */
  n: number;
  nameW: number;
  x0: number;
  x1: number;
  you: { y: number; h: number };
  /** Centre line of "2 weeks ago ... today". */
  axis: number;
  lanes: { y: number; h: number };
  /** Where her playhead knob rides, under the wall. */
  knob: number;
}

const WIDE: WallLayout = {
  compact: false,
  n: LANES.length,
  nameW: 18,
  x0: 20,
  x1: 97,
  you: { y: 0.5, h: 8.5 },
  axis: 12.5,
  lanes: { y: 16.5, h: 72.5 },
  knob: 94,
};

const PHONE: WallLayout = {
  compact: true,
  n: LANES_COMPACT,
  nameW: 0,
  x0: 1,
  x1: 99,
  you: { y: 0, h: 12 },
  axis: 15.5,
  lanes: { y: 19, h: 70 },
  knob: 94,
};

export const wallLayout = (compact: boolean): WallLayout => (compact ? PHONE : WIDE);

/** Slot x (percent) of a trace x (0..SPAN). */
export const sx = (L: WallLayout, tx: number) => L.x0 + ((L.x1 - L.x0) * tx) / SPAN;
/** Slot x (percent) of a day (0..14, 14 = today). */
export const dayX = (L: WallLayout, d: number) => sx(L, (d / DAYS) * TODAY);
export const todayX = (L: WallLayout) => sx(L, TODAY);

export const laneH = (L: WallLayout) => L.lanes.h / L.n;
export const laneTop = (L: WallLayout, j: number) => L.lanes.y + j * laneH(L);
export const laneMid = (L: WallLayout, j: number) => laneTop(L, j) + laneH(L) / 2;

/** Your week: what you were doing while the wall kept watch (day ranges). */
export const BUSY = [
  [0.2, 3.4],
  [3.7, 6.6],
  [6.9, 10.4],
  [10.7, 12.9],
] as const;

/** How strongly lane j beats at trace x. 0 = flat. */
function amp(j: number, x: number, k: number): number {
  const base = 0.72 + ((k * 7 + j * 3) % 5) * 0.07;
  const quiet = (QUIET_DAY / DAYS) * TODAY;
  if (j === WORST_LANE) {
    if (x < quiet) return base;
    return Math.max(0, base * (1 - (x - quiet) / 80));
  }
  if (j === 2 && x > 760) return 0.38;
  if (j === 4 && x > 560 && x < 760) return 0;
  return base;
}

/** One lane's waveform between `from` and `to`, as SVG polyline points. */
export function wave(j: number, from: number, to: number, ampOf = amp): string {
  const mid = j * 100 + 50;
  const spacing = 52 + ((j * 13) % 28);
  const offset = 8 + ((j * 37) % 40);
  const pts: string[] = [`${from},${mid}`];
  for (let k = 0, t = from + offset; t < to - 30; k++, t += spacing + ((k * 11 + j) % 3) * 6) {
    const a = ampOf(j, t, k);
    if (a <= 0.02) continue;
    pts.push(
      `${t - 8},${mid}`,
      `${t - 4},${mid + 6 * a}`,
      `${t},${mid - 38 * a}`,
      `${t + 4},${mid + 16 * a}`,
      `${t + 9},${mid}`,
      `${t + 17},${mid - 6 * a}`,
      `${t + 25},${mid}`,
    );
  }
  pts.push(`${to},${mid}`);
  return pts.join(" ");
}

/** The beat that comes back once the fix is in - steady and full. */
export const revived = (j: number) => wave(j, TODAY, SPAN, () => 0.9);
