/**
 * Geometry for "The Line You Set" (workshop lab v3) - viewBox units.
 *
 * WIDE: the field of work takes the left two-thirds; your side of the frame
 * holds two tallies - what she did on her own (with her face beside it) and
 * what waits for you, with the named pieces of it. COMPACT stacks the same
 * three things: the field, then her tally, then yours.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface V3Layout {
  W: number;
  H: number;
  field: Box;
  /** Named chips sit right of their dot unless the dot is past this x. */
  flipAt: number;
  her: { panel: Box; face: { x: number; y: number; size: number }; label: { x: number; y: number }; count: { x: number; y: number } };
  you: { panel: Box; label: { x: number; y: number }; count: { x: number; y: number }; list: Box; row: number };
}

/** Base frame of the wide layout; `wide(k)` stretches it vertically by k to
 *  fill a tall stage slot (shared/useStretch): the field and your panel grow,
 *  her tally keeps its size. */
export const WIDE_W = 1320;
export const WIDE_H = 560;

export function wide(k: number): V3Layout {
  const bottom = Math.round(540 * k);
  return {
    W: WIDE_W,
    H: Math.round(WIDE_H * k),
    field: { x: 40, y: 20, w: 890, h: bottom - 20 },
    flipAt: 0.62,
    her: {
      panel: { x: 966, y: 20, w: 334, h: 168 },
      face: { x: 1036, y: 104, size: 92 },
      label: { x: 1100, y: 56 },
      count: { x: 1100, y: 84 },
    },
    you: {
      panel: { x: 966, y: 206, w: 334, h: bottom - 206 },
      label: { x: 990, y: 228 },
      count: { x: 990, y: 254 },
      list: { x: 990, y: 336, w: 286, h: bottom - 354 },
      row: 56,
    },
  };
}

export const COMPACT: V3Layout = {
  W: 400,
  H: 900,
  field: { x: 8, y: 8, w: 384, h: 520 },
  flipAt: 0.5,
  her: {
    panel: { x: 8, y: 548, w: 384, h: 104 },
    face: { x: 56, y: 600, size: 64 },
    label: { x: 104, y: 566 },
    count: { x: 104, y: 590 },
  },
  you: {
    panel: { x: 8, y: 668, w: 384, h: 224 },
    label: { x: 24, y: 684 },
    count: { x: 240, y: 676 },
    list: { x: 24, y: 730, w: 352, h: 150 },
    row: 46,
  },
};

export const layoutFor = (compact: boolean, k: number): V3Layout => (compact ? COMPACT : wide(k));
