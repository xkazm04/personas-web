import { DEMO_BOARD_DAY_MS, DEMO_SEED_NOW } from "../demoClock";
import { HISTORY_DAYS, hashSeed, mulberry32, utcDayStart, type WorldShape } from "./generate";

/** The demo world's seed: one world per load, the same on every load. */
export const DEMO_WORLD_SEED = 20_261_001;

/**
 * The cost spike the Performance tab's anomaly banner names: three days ago,
 * the Growth & Content team's runs cost 4x (a new long-form model rolled out
 * and back). Declared here, in the root, so the banner, the chart annotation
 * and the runs that cost it are one fact.
 */
export const DEMO_COST_SPIKE = { dayAgo: 3, team: "growth", factor: 4 } as const;

const shapes = new Map<string, WorldShape>();

/** The clock and shared shape of the demo world at `nowMs` (memoized per seed). */
export function worldShape(nowMs: number = DEMO_SEED_NOW, seed: number = DEMO_WORLD_SEED): WorldShape {
  const key = `${seed}:${nowMs}`;
  let shape = shapes.get(key);
  if (!shape) {
    const todayStartMs = utcDayStart(nowMs);
    const rng = mulberry32(hashSeed(seed, "days"));
    shape = {
      seed,
      nowMs,
      todayStartMs,
      spanStartMs: Math.max(todayStartMs, nowMs - DEMO_BOARD_DAY_MS),
      dayFactor: Array.from({ length: HISTORY_DAYS }, (_, d) => (d === 0 ? 1 : 0.96 + 0.08 * rng())),
      growthPerDay: 0.003,
      costSpike: DEMO_COST_SPIKE,
    };
    shapes.set(key, shape);
  }
  return shape;
}
