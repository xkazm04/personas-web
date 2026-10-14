/**
 * The explode entrance of the slab stack, in one place so the component and
 * its order check replay the same motion (a check with its own copy of the
 * constants measures a different animation).
 *
 * Slab 0 is the fixed top; slab i starts pressed under it at -i * (gap - 10)
 * and travels DOWN to its home. Draw order is fixed (upper slab in front),
 * which is only right while no slab passes below one that is drawn behind it.
 */
export const SLAB_GAP = 60;
export const SLAB_PRESS = 10;
export const SLAB_DURATION = 0.8;
export const SLAB_STEP = 0.07;
export const SLAB_BASE_DELAY = 0.15;
export const SLAB_EASE: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Whoever is outside leaves first: the bottom slab starts, the top one is already home. */
export const slabDelay = (i: number, count: number) => SLAB_BASE_DELAY + (count - 1 - i) * SLAB_STEP;

/** Collapsed y offset of slab i, px. */
export const slabCollapsedY = (i: number) => -i * (SLAB_GAP - SLAB_PRESS);

/** cubic-bezier easing: progress for elapsed fraction x (same curve family as the animation library). */
export function bezierEase(x: number, [x1, y1, x2, y2] = SLAB_EASE): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (at(x1, x2, mid) < x) lo = mid;
    else hi = mid;
  }
  return at(y1, y2, (lo + hi) / 2);
}

/** y offset of slab i at time t seconds after the explode starts. */
export function slabY(i: number, t: number, delay: (i: number) => number): number {
  const p = bezierEase((t - delay(i)) / SLAB_DURATION);
  return slabCollapsedY(i) * (1 - p);
}
