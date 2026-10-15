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

/**
 * The Personas Board's frozen "now" (`fleet.json` `nowMs`) and how much of its
 * UTC day had passed then: the demo world's day so far. The Board's "runs
 * today" are the runs of that span, so the world places today's runs in the
 * same span before the seed clock (never before today's UTC midnight). Pinned
 * to `fleet.json` by `src/lib/demoWorld/world.test.ts`.
 */
export const DEMO_FLEET_NOW_MS = 1_790_864_400_000;
export const DEMO_BOARD_DAY_MS = DEMO_FLEET_NOW_MS % 86_400_000;
