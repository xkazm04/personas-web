/**
 * Geometry for V2, "All At Once", in the scene's design px (FitBox zooms it).
 *
 * Wide: what you said on the left, the dial owning the centre, the team and
 * the answer on the right - read in the order it happens. Compact: the same
 * four blocks stacked.
 *
 * The dial is drawn in its own fixed 400x400 viewBox (`DIAL`) and placed as
 * one box, so the rings, the travelling teammates and the outer track never
 * drift apart whatever size the box is drawn at.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const DIAL = {
  size: 400,
  c: 200,
  /** The faint outer track - the same work done one task at a time. */
  serialR: 186,
  /** One ring per teammate, outermost first. */
  rings: [158, 130, 102, 74] as const,
  stroke: 18,
};

export interface SceneLayout {
  w: number;
  h: number;
  sentence: Rect;
  start: Rect;
  dial: Rect;
  roster: Rect;
  answer: Rect;
}

export const WIDE: SceneLayout = {
  w: 1000,
  h: 400,
  sentence: { x: 0, y: 24, w: 290, h: 262 },
  start: { x: 0, y: 300, w: 290, h: 52 },
  dial: { x: 306, y: 8, w: 384, h: 384 },
  roster: { x: 704, y: 0, w: 296, h: 220 },
  answer: { x: 704, y: 234, w: 296, h: 166 },
};

export const COMPACT: SceneLayout = {
  w: 360,
  h: 1064,
  sentence: { x: 0, y: 0, w: 360, h: 226 },
  start: { x: 0, y: 232, w: 360, h: 50 },
  dial: { x: 8, y: 312, w: 344, h: 344 },
  roster: { x: 0, y: 664, w: 360, h: 220 },
  answer: { x: 0, y: 898, w: 360, h: 166 },
};

export const layoutFor = (narrow: boolean): SceneLayout => (narrow ? COMPACT : WIDE);

export const box = (r: Rect) => ({ left: r.x, top: r.y, width: r.w, height: r.h });
