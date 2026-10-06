/**
 * Scene geometry for "One Face" (lab v3) - percent of the art slot.
 *
 * The wall is a grid of windows that fills the whole field. Her portrait is
 * mapped across the WHOLE wall, and every window shows only its own piece of
 * it: each one carries a full-wall-sized layer offset by its own position
 * (portraitLayer), so the pieces line up exactly when the windows are true
 * and visibly do not while they are out of register.
 *
 * Two windows come forward. Each opens into a card on its own side of the
 * wall, over the edge of the face rather than across it, so the face stays
 * the subject while a conversation is open in front of it.
 */

import type { CSSProperties } from "react";
import type { Rect } from "../shared/types";

export interface WallLayout {
  cols: number;
  rows: number;
  tiles: readonly Rect[];
  /** Tile index -> TILE_CONTENT index. */
  order: readonly number[];
  portrait: { size: string; pos: string; mask: string };
  /** The two windows that come forward, and the card each opens into. */
  forward: readonly { tile: number; card: Rect }[];
}

function grid(cols: number, rows: number, gx: number, gy: number): Rect[] {
  const cw = 100 / cols;
  const rh = 100 / rows;
  return Array.from({ length: cols * rows }, (_, i) => ({
    x: (i % cols) * cw + gx / 2,
    y: Math.floor(i / cols) * rh + gy / 2,
    w: cw - gx,
    h: rh - gy,
  }));
}

export const WIDE: WallLayout = {
  cols: 7,
  rows: 3,
  tiles: grid(7, 3, 0.8, 2.6),
  order: Array.from({ length: 21 }, (_, i) => i),
  portrait: {
    size: "auto 128%",
    pos: "50% 40%",
    mask: "radial-gradient(ellipse 25% 64% at 50% 46%, black 52%, transparent 100%)",
  },
  forward: [
    { tile: 5, card: { x: 63, y: 7, w: 36, h: 86 } },
    { tile: 15, card: { x: 1, y: 7, w: 36, h: 86 } },
  ],
};

export const COMPACT: WallLayout = {
  cols: 3,
  rows: 6,
  tiles: grid(3, 6, 1.6, 1.2),
  order: [0, 1, 5, 3, 4, 2, 6, 7, 8, 9, 10, 11, 15, 13, 14, 12, 16, 17],
  portrait: {
    size: "auto 60%",
    pos: "50% 18%",
    mask: "radial-gradient(ellipse 62% 30% at 50% 26%, black 55%, transparent 100%)",
  },
  forward: [
    { tile: 2, card: { x: 2, y: 52, w: 96, h: 44 } },
    { tile: 12, card: { x: 2, y: 4, w: 96, h: 44 } },
  ],
};

export const layoutFor = (compact: boolean): WallLayout => (compact ? COMPACT : WIDE);

/** The full-wall layer inside one tile, offset so its piece lines up. */
export function portraitLayer(t: Rect): CSSProperties {
  return {
    left: `${(-t.x / t.w) * 100}%`,
    top: `${(-t.y / t.h) * 100}%`,
    width: `${(100 / t.w) * 100}%`,
    height: `${(100 / t.h) * 100}%`,
  };
}

/** Out of register: an authored offset per tile (percent of the tile, deg). */
export function jitter(i: number) {
  return {
    x: `${(((i * 37) % 7) - 3) * 2.4}%`,
    y: `${(((i * 53) % 5) - 2) * 3.2}%`,
    rotate: (((i * 29) % 7) - 3) * 0.9,
    scale: 0.9,
  };
}

/** FLIP: the transform that puts a card exactly over its tile. */
export function fromTile(tile: Rect, card: Rect) {
  return {
    x: `${((tile.x + tile.w / 2 - (card.x + card.w / 2)) / card.w) * 100}%`,
    y: `${((tile.y + tile.h / 2 - (card.y + card.h / 2)) / card.h) * 100}%`,
    scaleX: tile.w / card.w,
    scaleY: tile.h / card.h,
  };
}

const FACE = "url(/athena/athena_baseline.jpg)";

/**
 * The portrait as its own luminance mask (black drops out, light stays),
 * intersected with the soft vignette that fades it into the wall.
 */
export function faceMask(p: WallLayout["portrait"]): CSSProperties {
  return {
    maskImage: `${FACE}, ${p.mask}`,
    maskSize: `${p.size}, 100% 100%`,
    maskPosition: `${p.pos}, 0 0`,
    maskRepeat: "no-repeat",
    maskMode: "luminance, alpha",
    maskComposite: "intersect",
  };
}
