import { describe, expect, it } from "vitest";
import { observabilityOf } from "./demoWorld/fleetReads";
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "./mockData";
import {
  breachEpisodes,
  burnRate,
  errorBudget,
  exhaustionForecast,
  sli,
  trailing,
  type SliPoint,
} from "./sloEngine";

// The demo's daily series (the world's log, as the charts draw it). A ratio SLI
// counts finished runs: a run still in flight is neither good nor bad yet.
const DEMO_DAILY = observabilityOf({ rows: MOCK_EXECUTIONS, personas: MOCK_PERSONAS }).dailyMetrics;
const fromDaily: SliPoint[] = DEMO_DAILY.map((d) => ({
  date: d.date,
  total: d.successes + d.failures,
  good: d.successes,
}));

const day = (n: number) => `2026-03-${String(n).padStart(2, "0")}`;

describe("errorBudget", () => {
  it("allows (1 - target) of events and reports the share burned", () => {
    const pts: SliPoint[] = [{ date: day(1), total: 47, good: 42 }];
    const b = errorBudget(pts, 95);
    expect(b.allowed).toBeCloseTo(2.35, 6);
    expect(b.bad).toBe(5);
    expect(b.burned).toBeCloseTo(5 / 2.35, 6);
    expect(b.remaining).toBeCloseTo(-2.65, 6);
  });

  it("reconciles with the demo daily series the charts draw", () => {
    const b = errorBudget(fromDaily, 95);
    expect(b.total).toBe(DEMO_DAILY.reduce((s, d) => s + d.successes + d.failures, 0));
    expect(b.bad).toBe(DEMO_DAILY.reduce((s, d) => s + d.failures, 0));
    expect(b.allowed).toBeCloseTo(b.total * 0.05, 6);
  });

  it("is empty-safe", () => {
    expect(errorBudget([], 95)).toMatchObject({ total: 0, burned: 0, compliance: 1 });
  });
});

describe("burnRate", () => {
  it("is 1 when failures arrive exactly at the allowed pace", () => {
    expect(burnRate([{ date: day(1), total: 100, good: 95 }], 95)).toBeCloseTo(1, 6);
  });
  it("is above 1 for a short hot window", () => {
    expect(burnRate([{ date: day(1), total: 100, good: 80 }], 95)).toBeCloseTo(4, 6);
  });
});

describe("breachEpisodes", () => {
  const objective = { target: 95, direction: "higher" as const };
  it("yields one closed episode with an end date for a persona that recovers", () => {
    const pts: SliPoint[] = [
      { date: day(1), total: 100, good: 99 },
      { date: day(2), total: 100, good: 90 },
      { date: day(3), total: 100, good: 80 },
      { date: day(4), total: 100, good: 99 },
    ];
    const eps = breachEpisodes(sli(pts, "successRate"), objective);
    expect(eps).toHaveLength(1);
    expect(eps[0]).toMatchObject({
      start: day(2),
      end: day(3),
      days: 2,
      durationMinutes: 2 * 1440,
      ongoing: false,
      worst: 80,
    });
  });

  it("leaves a trailing breach ongoing and honors lower-is-better", () => {
    const eps = breachEpisodes(
      [
        { date: day(1), value: 100 },
        { date: day(2), value: 900 },
        { date: day(3), value: 700 },
      ],
      { target: 500, direction: "lower" },
    );
    expect(eps).toEqual([
      { start: day(2), end: day(3), days: 2, durationMinutes: 2880, ongoing: true, worst: 900 },
    ]);
  });

  it("gives every demo-series episode a non-zero duration", () => {
    for (const e of breachEpisodes(sli(fromDaily, "successRate"), objective)) {
      expect(e.durationMinutes).toBeGreaterThan(0);
    }
  });
});

describe("trailing + exhaustionForecast", () => {
  const pts: SliPoint[] = Array.from({ length: 10 }, (_, i) => ({
    date: day(i + 1),
    total: 100,
    good: i >= 8 ? 96 : 100,
  }));
  it("slices the last N calendar days", () => {
    expect(trailing(pts, 3).map((p) => p.date)).toEqual([day(8), day(9), day(10)]);
  });
  it("forecasts days to exhaustion from the recent failure pace", () => {
    // allowed 50 over 1000 events, 8 bad; recent pace = 8/2 per day... 4 bad/day over 2 days
    const f = exhaustionForecast(pts, trailing(pts, 2), 95);
    expect(f).toBeCloseTo((50 - 8) / 4, 6);
  });
  it("returns null when nothing failed recently and 0 when overspent", () => {
    expect(exhaustionForecast(pts, trailing(pts, 5), 95)).not.toBeNull();
    expect(exhaustionForecast(pts, pts.slice(0, 3), 95)).toBeNull();
    expect(exhaustionForecast([{ date: day(1), total: 10, good: 5 }], [], 95)).toBe(0);
  });
});
