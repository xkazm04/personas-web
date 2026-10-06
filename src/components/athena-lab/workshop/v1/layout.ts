/**
 * Geometry for "The Fence", evolved - viewBox units, one uniform scale.
 *
 * WIDE (the desktop stage): the yard takes the left two-thirds, and the line's
 * right edge is the border between hers and yours. Everything that is yours -
 * the dial that says how much she does on her own, and the one piece of work
 * she never touches - stands across it. The live section floated that work
 * above the top edge; a stage-high frame is short and wide, so it moved to
 * your side of the right edge, level with her, which makes her reach a single
 * straight run to the line.
 *
 * COMPACT (phones): the same yard turned upright, two places instead of three
 * (fewer things, never smaller type), the waiting work above the top edge and
 * the dial lying beneath the yard.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DialGeo {
  cx: number;
  cy: number;
  r: number;
  /** The panel the dial sits on. */
  panel: Box;
  /** Where its name and its current setting are written. */
  title: Box;
  value: Box;
}

export interface V1Layout {
  W: number;
  H: number;
  fence: Box;
  plate: { x: number; y: number };
  her: { x: number; y: number; size: number };
  reach: string;
  stop: { x: number; y: number };
  /** Which way the line runs where she touches it. */
  stopAxis: "x" | "y";
  outside: Box;
  beds: readonly Box[];
  /** Places stack their two jobs (narrow) or set them side by side (wide). */
  stack: boolean;
  dial: DialGeo;
}

/** Base frame of the wide layout; `wide(k)` stretches it vertically by k to
 *  fill a tall stage slot (shared/useStretch). Round things keep their size. */
export const WIDE_W = 1320;
export const WIDE_H = 560;

export function wide(k: number): V1Layout {
  const y = (v: number) => Math.round(v * k);
  return {
    W: WIDE_W,
    H: y(WIDE_H),
    fence: { x: 20, y: y(30), w: 880, h: y(520) },
    plate: { x: 56, y: y(30) },
    her: { x: 132, y: y(106), size: 96 },
    reach: `M 186 ${y(106)} C 420 ${y(106) - 26}, 690 ${y(106) + 26}, 900 ${y(106)}`,
    stop: { x: 900, y: y(106) },
    stopAxis: "y",
    outside: { x: 950, y: y(106) - 56, w: 350, h: 112 },
    beds: [180, 304, 428].map((top) => ({ x: 50, y: y(top), w: 820, h: y(112) })),
    stack: false,
    dial: {
      cx: 1125,
      cy: y(368),
      r: 86,
      panel: { x: 950, y: y(192), w: 350, h: y(358) },
      title: { x: 966, y: y(206), w: 318, h: 48 },
      value: { x: 960, y: y(486), w: 330, h: 48 },
    },
  };
}

export const COMPACT: V1Layout = {
  W: 400,
  H: 780,
  fence: { x: 8, y: 132, w: 384, h: 456 },
  plate: { x: 24, y: 588 },
  her: { x: 66, y: 194, size: 74 },
  reach: "M 104 180 C 160 150, 250 165, 270 132",
  stop: { x: 270, y: 132 },
  stopAxis: "x",
  outside: { x: 36, y: 8, w: 328, h: 92 },
  beds: [
    { x: 24, y: 252, w: 352, h: 150 },
    { x: 24, y: 416, w: 352, h: 150 },
  ],
  stack: true,
  dial: {
    cx: 92,
    cy: 692,
    r: 54,
    panel: { x: 8, y: 616, w: 384, h: 158 },
    title: { x: 176, y: 636, w: 204, h: 56 },
    value: { x: 176, y: 702, w: 204, h: 50 },
  },
};

export const layoutFor = (compact: boolean, k: number): V1Layout => (compact ? COMPACT : wide(k));
