/**
 * The deterministic sample series the app's charts draw. Kept out of `data.ts`
 * because they are scenery, not choreography — no phase function reads them.
 * Precomputed constants on purpose: React 19 forbids `Math.random` in render.
 */

/** Monitoring sparkline — one week of run counts (SVG y-axis, so a falling
 *  number is a rising line). */
export const CHART_POINTS = [20, 16, 18, 10, 13, 6, 9, 3] as const;

/** Monitoring bar series — the same week as discrete volume. */
export const BAR_POINTS = [45, 70, 55, 85, 60, 95, 72] as const;

/** Template-card health strip — per-day success, as bar heights. */
export const HEALTH_BARS = [55, 80, 62, 90, 70, 96, 84] as const;
