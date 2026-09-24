import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { DailyMetric } from "./types";

// The series module is imported lazily inside each case so the guard below —
// which pins the Supabase plane's existing arithmetic — runs whether or not the
// module exists yet.
const series = () => import("./observabilitySeries");

function day(date: string, cost: number, executions = 0, successes = executions): DailyMetric {
  return { date, cost, executions, successes, failures: executions - successes };
}

describe("periodTrend", () => {
  it("is the % change of the current period against the previous one", async () => {
    const { periodTrend } = await series();
    const current = [day("2026-09-22", 1), day("2026-09-23", 1)];
    const previous = [day("2026-09-08", 2), day("2026-09-09", 2)];
    expect(periodTrend(current, previous).cost).toBe(-50);
  });

  it("answers 0 when the previous period has no baseline", async () => {
    const { periodTrend } = await series();
    const current = [day("2026-09-22", 1, 3, 2)];
    const previous = [day("2026-09-08", 0, 0, 0)];
    expect(periodTrend(current, previous)).toEqual({ cost: 0, executions: 0, success: 0 });
  });

  it("compares success RATES, not success counts", async () => {
    const { periodTrend } = await series();
    // 9/10 now vs 8/10 before: +12.5%, although volume is flat.
    const t = periodTrend([day("a", 1, 10, 9)], [day("b", 1, 10, 8)]);
    expect(t.executions).toBe(0);
    expect(t.success).toBeCloseTo(12.5, 10);
  });
});

describe("sparklinesFromDaily", () => {
  it("projects cost, executions and per-day success rate, one point per day", async () => {
    const { sparklinesFromDaily } = await series();
    const s = sparklinesFromDaily([day("a", 0.5, 4, 3), day("b", 0.25, 0, 0)]);
    expect(s).toEqual({ cost: [0.5, 0.25], executions: [4, 0], success: [75, 0] });
  });
});

describe("previousSeries", () => {
  it("keys each prior day by the CURRENT day's chart key (date.slice(5))", async () => {
    const { previousSeries } = await series();
    const current = [day("2026-09-22", 1, 3), day("2026-09-23", 2, 4)];
    const prior = [day("2026-09-08", 5, 6), day("2026-09-09", 7, 8)];
    expect(previousSeries(current, prior, "cost")).toEqual([
      { date: "09-22", current: 1, previous: 5 },
      { date: "09-23", current: 2, previous: 7 },
    ]);
    expect(previousSeries(current, prior, "executions").map((p) => p.previous)).toEqual([6, 8]);
  });
});

describe("detectCostAnomalies", () => {
  it("flags only upward days at or past the z threshold, with the day's own cost and z", async () => {
    const { detectCostAnomalies } = await series();
    const costs = [1, 1, 1, 1, 1, 1, 1, 1, 1, 5];
    const daily = costs.map((c, i) => day(`2026-09-${String(10 + i)}`, c));
    const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
    const sd = Math.sqrt(costs.reduce((a, c) => a + (c - mean) ** 2, 0) / costs.length);
    expect(detectCostAnomalies(daily, 2)).toEqual([
      { date: "2026-09-19", cost: 5, deviation: (5 - mean) / sd },
    ]);
  });

  it("returns nothing for a flat series (sd 0) or an empty one", async () => {
    const { detectCostAnomalies } = await series();
    expect(detectCostAnomalies([day("a", 1), day("b", 1)], 2)).toEqual([]);
    expect(detectCostAnomalies([], 2)).toEqual([]);
  });
});

describe("anchorAnnotations", () => {
  it("anchors by days-before-the-newest-day and drops offsets outside the window", async () => {
    const { anchorAnnotations } = await series();
    const daily = [day("2026-09-21", 1), day("2026-09-22", 1), day("2026-09-23", 1)];
    expect(
      anchorAnnotations(daily, [
        { dayOffset: 0, label: "today", type: "incident" },
        { dayOffset: 2, label: "first", type: "deployment" },
        { dayOffset: 3, label: "gone", type: "milestone" },
      ]),
    ).toEqual([
      { date: "09-23", label: "today", type: "incident" },
      { date: "09-21", label: "first", type: "deployment" },
    ]);
  });
});

// ── Guard: the Supabase plane's trend arithmetic ─────────────────────
// Real mode has no synced prior window, so it compares the recent half of the
// daily series with the earlier half. Lifting that rule into the series module
// must not change a single number it produces.

const { DAILY_ROWS } = vi.hoisted(() => ({
  DAILY_ROWS: [
    { date: "2026-09-20", cost: 1, executions: 4, successes: 4, failures: 0 },
    { date: "2026-09-21", cost: 1, executions: 4, successes: 3, failures: 1 },
    { date: "2026-09-22", cost: 2, executions: 6, successes: 6, failures: 0 },
    { date: "2026-09-23", cost: 2, executions: 6, successes: 5, failures: 1 },
  ] satisfies DailyMetric[],
}));

vi.mock("./supabase", () => {
  const chain = {
    select: () => chain,
    eq: () => Promise.resolve({ data: [{ id: "p1" }], error: null }),
    order: () => Promise.resolve({ data: DAILY_ROWS, error: null }),
  };
  return { getSupabase: () => ({ from: () => chain }) };
});
vi.mock("./api", () => ({ ApiError: class ApiError extends Error {} }));

describe("guard: supabase trend arithmetic", () => {
  it("daily halves [cost 1,1 | 2,2] -> costTrend 100", async () => {
    const { supabaseApi } = await import("./supabaseApi");
    const m = await supabaseApi.getObservabilityMetrics();
    expect(m.costTrend).toBe(100);
    expect(m.execTrend).toBe(50); // 8 -> 12 runs
    // success rate 7/8 -> 11/12
    expect(m.successTrend).toBeCloseTo(((11 / 12 - 7 / 8) / (7 / 8)) * 100, 10);
    expect(m.totalCost).toBe(6);
    expect(m.totalExecutions).toBe(20);
    expect(m.activePersonas).toBe(1);
  });
});

// ── Source scan: one rule, one implementation ────────────────────────

describe("both data planes call the series module", () => {
  const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

  it("useSparklines imports neither generated cost/execution sparkline", () => {
    const src = read("app/dashboard/observability/performance-view/useSparklines.ts");
    expect(src).not.toMatch(/\bSPARKLINE_COST\b/);
    expect(src).not.toMatch(/\bSPARKLINE_EXECUTIONS\b/);
    expect(src).toMatch(/\bsparklinesFromDaily\b/);
  });

  it("supabaseApi declares no local pctChange and derives trends via the series module", () => {
    const src = read("lib/supabaseApi.ts");
    expect(src).not.toMatch(/function\s+pctChange\b/);
    expect(src).toMatch(/from "\.\/observabilitySeries"/);
  });
});
