/** V1 "Lit stack" geometry, in design units of the art box. */

export const W = 1320;
export const H = 600;

/** The rail of layer buttons on the left. */
export const RAIL_W = 200;

/** Slabs: one shared x range; stacked bottom (Run) to top (Monitor). */
export const SLAB_X = 236;
export const SLAB_W = W - SLAB_X;
export const SLAB_H = 120;
const SLAB_GAP = 40;

/** Pressed together (spread = 0), each slab shows a sliver above the last. */
const COMPRESSED_STEP = 16;

/** Top of slab `i` (0 = Run, bottom) at a spread of `s` (0..1). */
export function slabTop(i: number, s: number): number {
  const base = H - SLAB_H;
  const expanded = base - i * (SLAB_H + SLAB_GAP);
  const compressed = base - i * COMPRESSED_STEP;
  return compressed + (expanded - compressed) * s;
}

/** The spine runs through the icon chips: its x, in design units. */
export const CHIP_X = 26;
export const CHIP = 68;
export const SPINE_X = SLAB_X + CHIP_X + CHIP / 2;

/** Slab-local columns. */
export const TEXT_X = 116;
export const ART_X = 620;
export const ART_W = 420;
export const ART_H = 92;

/** One beat of the request rising through the stack (ms). */
export const BEAT_MS = 1700;
