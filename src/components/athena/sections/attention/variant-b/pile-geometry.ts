/*
 * Deterministic scatter for the 47-notification pile (left / before beat).
 * Precomputed at module scope — no impure calls in render (React 19 rule);
 * Math.sin over the index is a stable pseudo-random, identical every load.
 */

export const PILE_VIEWBOX = { w: 320, h: 340 } as const;

export const CARD = { w: 198, h: 24, step: 6 } as const;

/** How many cards tall the pile is, and which one is the buried decision. */
export const PILE_COUNT = 47;
export const BURIED_INDEX = 24;

export interface PileCard {
  /** 0 = bottom of the pile. */
  i: number;
  x: number;
  y: number;
  rotate: number;
  buried: boolean;
}

function jitter(i: number, seed: number, spread: number): number {
  // Teeter grows toward the top of the pile.
  const wobble = 0.4 + (i / PILE_COUNT) * 0.6;
  return Math.sin(i * seed) * spread * wobble;
}

export const PILE_CARDS: readonly PileCard[] = Array.from(
  { length: PILE_COUNT },
  (_, i) => ({
    i,
    x: PILE_VIEWBOX.w / 2 - CARD.w / 2 + jitter(i, 12.9898, 20),
    y: PILE_VIEWBOX.h - 16 - CARD.h - i * CARD.step,
    rotate: jitter(i, 78.233, 5),
    buried: i === BURIED_INDEX,
  }),
);
