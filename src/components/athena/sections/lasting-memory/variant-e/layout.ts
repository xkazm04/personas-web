/**
 * Scene geometry for "Every night, a little more" — the lasting-memory
 * section, variant E.
 *
 * One coordinate system, deliberately: percent of the field, for everything.
 * Nothing is projected, there is no camera, and the only things that travel
 * are Athena and the few things she keeps — so type can sit in the art at its
 * authored size, at every viewport, with nothing to keep in sync.
 *
 * The shape is a STRETCH OF DAYS running left to right, and it is read
 * vertically as much as horizontally:
 *
 *   ── each day's talk ────  a column per day. Turns stack up from the
 *                            baseline toward a line marked "enough to sleep
 *                            on". Every full day reaches it; the quiet one
 *                            does not, and that is the whole reason she skips
 *                            a night.
 *   ── she sleeps on it ───  a thin band between the days, marked once per
 *                            NIGHT (the gap between two columns) rather than
 *                            once per day.
 *   ── what she keeps ─────  a shelf. Things land under the day they came
 *                            from, joined to it by a hairline that runs back
 *                            up through the night. The shelf only ever grows.
 *
 * So the composition itself is the argument: the top row rises and falls to
 * the same height over and over and fades as it recedes, and the bottom row
 * never falls and never fades. Elapsed time is carried by that light — nothing
 * in this scene is a clock, a date, or a counter.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** How many days the stretch shows. Enough to feel like a habit rather than
 *  an incident, few enough that a column still holds legible texture at
 *  390px. */
export const DAYS = 5;

export interface FieldLayout {
  /** Horizontal extent of the whole stretch. */
  band: { x: number; w: number };
  /** How much of a day column is talk; the remainder is the night gap. */
  talkFrac: number;
  /** Where she rides while a day is being worked, and where she settles to
   *  while she is sleeping on one. */
  readerDayY: number;
  readerNightY: number;
  /** How close to the field's edge she is allowed to travel. The last night of
   *  the stretch sits at the far end of the band, and on a narrow field her
   *  avatar is wide enough to hang off it — so her track is clamped rather
   *  than the composition being bent around one frame. */
  readerPad: number;
  /** The line a day's talk has to reach — the top of the talk band. */
  railY: number;
  /** Where the talk stands. Turns stack upward from here. */
  baseY: number;
  /** Turns per tick of talk. A full day is three ticks. */
  rowsPerStep: number;
  nightY: number;
  nightH: number;
  /** The rail the one recalled thing travels along on its way back into a
   *  later day. Below the shelf's sources, above the shelf itself. */
  recallY: number;
  /** How far up into a later day's talk the recall lands. */
  recallTopY: number;
  shelf: Rect;
  chipsPerPass: number;
  /** Where the written accounts live, and how they are arranged: under the
   *  day that produced them where there is width for it, stacked in arrival
   *  order where there is not. */
  notesY: number;
  notesH: number;
  notesMode: "columns" | "stack";
  /**
   * Where the three stages are named. On a wide field they are a LEGEND: a
   * reserved column to the left of the stretch with one row per band, so all
   * three stages are named at once, permanently, and no label can ever land on
   * top of the thing it names. On a narrow field there is no width for a
   * legend column, so two of them sit inline above their band and the other
   * two are dropped — her own descent and the status line carry the night.
   */
  legendX: number | null;
  legendW: number;
  labelTalkY: number;
  labelNightY: number | null;
  labelShelfY: number;
  /** The line's own label, sitting in the legend beside the rail it names. */
  labelRailY: number | null;
}

export const colW = (L: FieldLayout): number => L.band.w / DAYS;
export const talkW = (L: FieldLayout): number => colW(L) * L.talkFrac;
export const colX = (L: FieldLayout, day: number): number => L.band.x + colW(L) * day;
export const talkCenterX = (L: FieldLayout, day: number): number => colX(L, day) + talkW(L) / 2;

/** The middle of the night AFTER a day — the gap between two columns. */
export const nightX = (L: FieldLayout, day: number): number =>
  colX(L, day) + talkW(L) + (colW(L) - talkW(L)) / 2;

/** A day's talk, as a box: turns stack inside it from the bottom up, and a
 *  full day fills it exactly to the line. */
export function pileRect(L: FieldLayout, day: number): Rect {
  return { x: colX(L, day), y: L.railY, w: talkW(L), h: L.baseY - L.railY };
}

const CHIP_PAD = 0.8;
const CHIP_GAP = 1;
const CHIP_INSET = 1.4;

/** Where one kept thing sits — under the day it came from, never anywhere
 *  else, so the shelf accumulates left to right for the same reason the days
 *  do, and the night that produced nothing leaves a visible hole. */
export function chipRect(L: FieldLayout, day: number, k: number): Rect {
  const w = (talkW(L) - CHIP_PAD * 2 - CHIP_GAP * (L.chipsPerPass - 1)) / L.chipsPerPass;
  return {
    x: colX(L, day) + CHIP_PAD + k * (w + CHIP_GAP),
    y: L.shelf.y + CHIP_INSET,
    w,
    h: L.shelf.h - CHIP_INSET * 2,
  };
}

/** How far above its shelf slot a kept thing starts, as a share of its own
 *  height — so the descent is a pure transform from the talk it came out of. */
export function dropFrom(L: FieldLayout): string {
  const chip = chipRect(L, 0, 0);
  return `${(-(chip.y - L.baseY) / chip.h) * 100}%`;
}

/** One written account. Under its own day where the field is wide enough for
 *  a sentence to sit in a column; otherwise a stacked run in arrival order. */
export function noteRect(L: FieldLayout, pass: number, day: number): Rect {
  if (L.notesMode === "columns") {
    return { x: colX(L, day), y: L.notesY, w: talkW(L), h: L.notesH };
  }
  const row = L.notesH / 4;
  return { x: L.band.x, y: L.notesY + row * pass, w: L.band.w, h: row };
}

/** md+ — a legend column, then five days with room above them for her to
 *  travel the stretch, and every account sitting under the day that produced
 *  it, so the row of sentences at the bottom is itself a record of the days.
 *
 *  Percentages are budgeted against the field's FLOOR height (36rem, set by
 *  the section shell): a percent box shrinks with the viewport while the type
 *  inside it does not. */
export const WIDE: FieldLayout = {
  band: { x: 21, w: 76 },
  talkFrac: 0.82,
  readerDayY: 11,
  readerNightY: 54,
  readerPad: 3.2,
  railY: 20,
  baseY: 47,
  rowsPerStep: 3,
  nightY: 50.5,
  nightH: 7,
  recallY: 62,
  recallTopY: 32,
  shelf: { x: 21, y: 64, w: 76, h: 10.5 },
  chipsPerPass: 2,
  notesY: 78.5,
  notesH: 20,
  notesMode: "columns",
  legendX: 3,
  legendW: 16.5,
  labelTalkY: 30,
  labelNightY: 52,
  labelShelfY: 66.5,
  labelRailY: 16.3,
};

/** <md — the same five days and the same three bands, with fewer turns per day
 *  and the accounts stacked full-width in the order she wrote them. Fewer
 *  lines of scenery, never smaller type. */
export const COMPACT: FieldLayout = {
  band: { x: 2, w: 96 },
  talkFrac: 0.82,
  readerDayY: 9,
  readerNightY: 50.7,
  readerPad: 8,
  railY: 19,
  baseY: 44,
  rowsPerStep: 2,
  nightY: 47.5,
  nightH: 6.5,
  recallY: 59.6,
  recallTopY: 29,
  shelf: { x: 2, y: 61.5, w: 96, h: 6.6 },
  chipsPerPass: 2,
  notesY: 72,
  notesH: 26,
  notesMode: "stack",
  legendX: null,
  legendW: 0,
  labelTalkY: 15,
  labelNightY: null,
  labelShelfY: 56.5,
  labelRailY: null,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
