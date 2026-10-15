/**
 * The demo's seed clock: the instant the demo fixtures are anchored to.
 *
 * Fixture timestamps are written as "N minutes before the seed" (`mockData.ts`
 * `ago`, `daysAgo`), so a window measured from this instant cuts the fixtures
 * at exactly the same place on every load, while a window measured from a live
 * `Date.now()` would drift across a row on a boundary as the page stays open.
 * Read once at module evaluation, which is also where React 19's purity rule
 * wants an impure clock read to live (never in render).
 *
 * Import-free on purpose: `mockData.ts` imports it, so it is evaluated before
 * any fixture module computes a timestamp.
 */
export const DEMO_SEED_NOW: number = Date.now();
