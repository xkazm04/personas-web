/**
 * Scene geometry for the memory lab, v1 - "Every night, a little more",
 * evolved from the live lasting-memory section (variant E).
 *
 * One coordinate system: percent of the field, for everything. What changed
 * from the live section is that the field is now ASPECT-LOCKED (see
 * `../shared/LabShell`), so a percent here is a fixed share of a fixed shape:
 * the composition cannot stretch with the viewport, the stage fit is exact,
 * and type sized in `cqw` grows with the art on a big monitor.
 *
 * The shape is still a STRETCH OF DAYS running left to right, read top to
 * bottom as the flow runs:
 *
 *   each day's talk       a column per day, turns stacking up to the line
 *                         marked "enough to sleep on".
 *   she sleeps on it      a night band, one moon per gap between two days.
 *   what she keeps        a lit ledge. On wide screens each night puts ONE
 *                         card on it, and the card carries the sentence she
 *                         wrote - the kept thing and what it says are one
 *                         object, read at a size that does not compete with
 *                         anything else in the frame.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** How many days the stretch shows. */
export const DAYS = 5;

/** Width / height of the art box on wide screens and on phones. */
export const WIDE_AR = 2.4;
export const COMPACT_AR = 0.5;
/** Design width the art's type is authored against (`../shared/frame`). */
export const ART_W = 1200;

export interface FieldLayout {
  band: { x: number; w: number };
  /** How much of a day column is talk; the remainder is the night gap. */
  talkFrac: number;
  readerDayY: number;
  readerNightY: number;
  /** How close to the field's edge her avatar may travel. */
  readerPad: number;
  /** The line a day's talk has to reach, and where the talk stands. */
  railY: number;
  baseY: number;
  /** Turns per tick of talk. A full day is three ticks. */
  rowsPerStep: number;
  nightY: number;
  nightH: number;
  /** The rail the recalled thing travels along, and how far up into a later
   *  day's talk it lands. */
  recallY: number;
  recallTopY: number;
  shelf: Rect;
  chipsPerPass: number;
  /** "cards": each night's sentence is written ON the thing she keeps (wide).
   *  "stack": chips on the shelf, sentences stacked under it (phones). */
  notesMode: "cards" | "stack";
  notesY: number;
  notesH: number;
  /** The lit lip the kept things stand on: its top edge and depth. */
  ledgeY: number;
  ledgeH: number;
  /** Legend column on wide fields; inline labels on narrow ones. */
  legendX: number | null;
  legendW: number;
  labelTalkY: number;
  labelNightY: number | null;
  labelShelfY: number;
  labelRailY: number | null;
}

export const colW = (L: FieldLayout): number => L.band.w / DAYS;
export const talkW = (L: FieldLayout): number => colW(L) * L.talkFrac;
export const colX = (L: FieldLayout, day: number): number => L.band.x + colW(L) * day;
export const talkCenterX = (L: FieldLayout, day: number): number => colX(L, day) + talkW(L) / 2;

/** The middle of the night AFTER a day - the gap between two columns. */
export const nightX = (L: FieldLayout, day: number): number =>
  colX(L, day) + talkW(L) + (colW(L) - talkW(L)) / 2;

/** A day's talk, as a box: a full day fills it exactly to the line. */
export function pileRect(L: FieldLayout, day: number): Rect {
  return { x: colX(L, day), y: L.railY, w: talkW(L), h: L.baseY - L.railY };
}

const CHIP_PAD = 0.6;
const CHIP_GAP = 1;
const CHIP_INSET = 1.2;

/** Where one kept thing sits - under the day it came from, never anywhere
 *  else, so the night that produced nothing leaves a visible hole. */
export function chipRect(L: FieldLayout, day: number, k: number): Rect {
  // A card carries a sentence, so it takes its whole column, gap included.
  if (L.notesMode === "cards") {
    return { x: colX(L, day) + 0.3, y: L.shelf.y + CHIP_INSET, w: colW(L) - 1.3, h: L.shelf.h - CHIP_INSET * 2 };
  }
  const w = (talkW(L) - CHIP_PAD * 2 - CHIP_GAP * (L.chipsPerPass - 1)) / L.chipsPerPass;
  return {
    x: colX(L, day) + CHIP_PAD + k * (w + CHIP_GAP),
    y: L.shelf.y + CHIP_INSET,
    w,
    h: L.shelf.h - CHIP_INSET * 2,
  };
}

/** How far above its slot a kept thing starts, as a share of its own height -
 *  so the descent is a pure transform from the talk it came out of. */
export function dropFrom(L: FieldLayout): string {
  const chip = chipRect(L, 0, 0);
  return `${(-(chip.y - L.baseY) / chip.h) * 100}%`;
}

/** The stacked sentences' block (phones only) - one box the notes flow in, so
 *  a sentence that wraps in a long locale pushes the rest rather than
 *  overlapping them. */
export function notesRect(L: FieldLayout): Rect {
  return { x: L.band.x, y: L.notesY, w: L.band.w, h: L.notesH };
}

export const WIDE: FieldLayout = {
  band: { x: 19, w: 79 },
  talkFrac: 0.84,
  readerDayY: 9.5,
  readerNightY: 58.3,
  readerPad: 3.2,
  railY: 20,
  baseY: 50,
  rowsPerStep: 3,
  nightY: 54.5,
  nightH: 7.6,
  recallY: 65.4,
  recallTopY: 33,
  shelf: { x: 19, y: 67.5, w: 79, h: 22.5 },
  chipsPerPass: 1,
  notesMode: "cards",
  notesY: 0,
  notesH: 0,
  ledgeY: 90,
  ledgeH: 3.2,
  legendX: 1.5,
  legendW: 16,
  labelTalkY: 37,
  labelNightY: 58.3,
  labelShelfY: 78.7,
  labelRailY: 20,
};

/**
 * Phones: a taller field (COMPACT_AR) so the talk band - the part that has to
 * read as conversation - gets a third of it, one kept thing per night stands
 * on the ledge with its night's moon on it, and the four sentences get the
 * bottom of the frame at reading size.
 */
export const COMPACT: FieldLayout = {
  band: { x: 2, w: 96 },
  talkFrac: 0.82,
  readerDayY: 5.2,
  readerNightY: 49.8,
  readerPad: 8,
  railY: 14,
  baseY: 45,
  rowsPerStep: 3,
  nightY: 47.6,
  nightH: 4.4,
  recallY: 57.7,
  recallTopY: 29,
  shelf: { x: 2, y: 59, w: 96, h: 7.6 },
  chipsPerPass: 1,
  notesMode: "stack",
  notesY: 70.5,
  notesH: 28.5,
  ledgeY: 66.6,
  ledgeH: 1.1,
  legendX: null,
  legendW: 0,
  labelTalkY: 11.2,
  labelNightY: null,
  labelShelfY: 55,
  labelRailY: null,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
