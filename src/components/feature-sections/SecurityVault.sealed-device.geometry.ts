import { useTransform, easeInOut, type MotionValue } from "framer-motion";

/** Geometry and timing for the "sealed-device" Security variant (900 x 400 viewBox). */

export const VIEW_W = 900;
export const VIEW_H = 400;

/** Device (the sealed boundary): the laptop screen. */
export const SCREEN = { x: 130, y: 20, w: 520, h: 300, r: 22 };
export const EDGE_X = SCREEN.x + SCREEN.w; // 650
/** The OS vault tray inside the device. */
export const TRAY = { x: 190, y: 82, w: 370, h: 206, r: 18 };
/** Lock centres (x) and the row's y. */
export const LOCK_X = [275, 375, 475];
export const LOCK_Y = 182;
/** Locks are drawn at unit size and placed with this scale. */
export const LOCK_SCALE = 1.4;
/** Where each key starts, relative to its lock in lock units (pre-scale), and its tilt. */
export const KEY_FROM = [
  { dx: -64, dy: -88, rot: -28 },
  { dx: 32, dy: -96, rot: 18 },
  { dx: 84, dy: -80, rot: 34 },
];
/** When each key lands (progress). */
export const KEY_LAND = [0.26, 0.4, 0.54];
export const KEY_TRAVEL = 0.2;
/** The escape attempt and its failure. */
export const LEAK = { start: 0.6, hit: 0.72 };
export const CLOUD = { cx: 790, cy: 186, grey: [0.8, 0.9] as const, strike: [0.84, 0.95] as const };
export const LINE_Y = LOCK_Y + 3;

export function useSeg(
  p: MotionValue<number>,
  a: number,
  b: number,
  from: number,
  to: number,
  ease = easeInOut,
): MotionValue<number> {
  return useTransform(p, [a, b], [from, to], { ease });
}

