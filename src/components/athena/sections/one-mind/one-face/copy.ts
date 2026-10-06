/**
 * What each window on the wall is: whose name it carries (the live section's
 * six conversations first - shipped in fourteen languages - then the lab's
 * extra project names), how you had it, and how lived-in it looks.
 *
 * Content 5 is "The outage" (spoken) and content 15 is "Invoices" (typed):
 * the two windows that come forward. Every window has a medium; not every
 * one has a name - a wall of conversations includes the ones you never named.
 */

import type { Medium } from "./shared/icons";

export interface TileContent {
  /** Index into [...live conversations, ...lab extras], or null. */
  name: number | null;
  medium: Medium;
  /** Authored message-bar widths, percent of the tile. */
  bars: readonly [number, number];
}

const T = (name: number | null, medium: Medium, a: number, b: number): TileContent => ({
  name,
  medium,
  bars: [a, b],
});

export const TILE_CONTENT: readonly TileContent[] = [
  T(6, "typed", 70, 44),
  T(0, "typed", 52, 78),
  T(null, "spoken", 64, 40),
  T(7, "typed", 48, 72),
  T(null, "typed", 76, 50),
  T(3, "spoken", 60, 36),
  T(8, "typed", 44, 68),
  T(9, "spoken", 72, 46),
  T(null, "typed", 50, 80),
  T(1, "spoken", 66, 42),
  T(null, "typed", 40, 70),
  T(2, "typed", 74, 52),
  T(null, "spoken", 58, 38),
  T(10, "typed", 46, 76),
  T(11, "typed", 68, 48),
  T(5, "typed", 54, 74),
  T(null, "spoken", 78, 44),
  T(4, "typed", 42, 66),
  T(12, "typed", 70, 40),
  T(null, "typed", 56, 82),
  T(13, "spoken", 62, 46),
];
