import { describe, expect, it } from "vitest";
import { observabilityOf, worldAnnotations } from "./demoWorld/fleetReads";
import { DEMO_COST_SPIKE } from "./demoWorld/shape";
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "./mockData";
import { detectCostAnomalies, previousSeries } from "./observabilitySeries";

// The Performance tab draws the headline tiles, both charts, the Compare
// overlay, the tile sparklines, the anomaly banner and the chart annotations on
// ONE screen. These cases hold every overlay to the one daily series the demo
// serves (the world's log folded by day, `demoWorld/fleetReads.ts`), so no two
// numbers on that screen can disagree. The overlays are computed exactly as
// PerformanceView computes them from what `mockApi` serves.
//
// L3 re-baseline: this file used to pin the hand-tuned 5-persona window
// (47 runs, $4.82, 89.4%). The window is now the demo fleet's log (the Board's
// 99 agents), so the guards below are equalities between the screen's own
// numbers instead of constants.
//
// The series module is imported lazily so the guards run on their own.
const series = () => import("./observabilitySeries");

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const served = observabilityOf({ rows: MOCK_EXECUTIONS, personas: MOCK_PERSONAS });
const { dailyMetrics: DAILY, prior: PRIOR, metrics: METRICS, personaSpend: SPEND } = served;
const COST_COMPARE = previousSeries(DAILY, PRIOR, "cost");
const EXEC_COMPARE = previousSeries(DAILY, PRIOR, "executions");
const ANOMALIES = detectCostAnomalies(DAILY, 2);
const ANNOTATIONS = worldAnnotations(DAILY);
const chartKeys = new Set(DAILY.map((d) => d.date.slice(5)));

describe("Performance-tab overlays project the daily series", () => {
  it("tile sparklines are the daily series: 14 points, summing to the tile totals", async () => {
    const { sparklinesFromDaily } = await series();
    const s = sparklinesFromDaily(DAILY);
    expect(s.cost).toHaveLength(14);
    expect(Math.abs(sum(s.cost) - METRICS.totalCost)).toBeLessThanOrEqual(0.01);
    expect(sum(s.executions)).toBe(METRICS.totalExecutions);
  });

  it("Compare overlays sit on the chart's own x keys and share its magnitude", () => {
    for (const compare of [COST_COMPARE, EXEC_COMPARE]) {
      expect(compare).toHaveLength(DAILY.length);
      for (const point of compare) expect(chartKeys.has(point.date)).toBe(true);
    }
    const costRatio = sum(COST_COMPARE.map((p) => p.previous)) / sum(DAILY.map((d) => d.cost));
    const execRatio = sum(EXEC_COMPARE.map((p) => p.previous)) / sum(DAILY.map((d) => d.executions));
    for (const ratio of [costRatio, execRatio]) {
      expect(ratio).toBeGreaterThanOrEqual(0.5);
      expect(ratio).toBeLessThanOrEqual(2);
    }
  });

  it("the tiles' 'vs last period' trends are the Compare overlay's own % change", async () => {
    const { periodTrend } = await series();
    const previous = DAILY.map((d, i) => ({
      ...d,
      cost: COST_COMPARE[i].previous,
      executions: EXEC_COMPARE[i].previous,
      successes: PRIOR[i].successes,
    }));
    const t = periodTrend(DAILY, previous);
    expect(Math.abs(METRICS.costTrend - t.cost)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(METRICS.execTrend - t.executions)).toBeLessThanOrEqual(0.05);
  });

  it("the anomaly banner names real window days at their real cost and z-score", () => {
    expect(ANOMALIES.length).toBeGreaterThanOrEqual(1);
    const costs = DAILY.map((d) => d.cost);
    const mean = sum(costs) / costs.length;
    const sd = Math.sqrt(sum(costs.map((c) => (c - mean) ** 2)) / costs.length);
    for (const anomaly of ANOMALIES) {
      const d = DAILY.find((m) => m.date === anomaly.date);
      expect(d, `anomaly ${anomaly.date} is not a window day`).toBeDefined();
      expect(anomaly.cost).toBe(d!.cost);
      expect(anomaly.deviation).toBeCloseTo((d!.cost - mean) / sd, 10);
    }
  });

  it("the one anomaly is the root's declared cost spike, and the deploy annotation sits on it", () => {
    const spikeDay = DAILY[DAILY.length - 1 - DEMO_COST_SPIKE.dayAgo].date;
    expect(ANOMALIES.map((a) => a.date)).toEqual([spikeDay]);
    expect(ANNOTATIONS.find((a) => a.type === "deployment")?.date).toBe(spikeDay.slice(5));
  });

  it("every annotation lands on an x-axis key, so recharts can draw it", () => {
    expect(ANNOTATIONS.length).toBeGreaterThan(0);
    for (const a of ANNOTATIONS) expect(chartKeys.has(a.date), a.date).toBe(true);
  });
});

describe("guards: the numbers other screens reconcile against", () => {
  it("window totals are the daily series summed (home Vitals + traffic chart)", () => {
    expect(METRICS.totalCost).toBe(+sum(DAILY.map((d) => d.cost)).toFixed(2));
    expect(METRICS.totalExecutions).toBe(sum(DAILY.map((d) => d.executions)));
    expect(METRICS.successRate).toBe(+((sum(DAILY.map((d) => d.successes)) / METRICS.totalExecutions) * 100).toFixed(1));
  });

  it("per-agent spend sums to the window's cost and runs", () => {
    expect(+sum(SPEND.map((p) => p.totalCost)).toFixed(2)).toBe(METRICS.totalCost);
    expect(sum(SPEND.map((p) => p.executionCount))).toBe(METRICS.totalExecutions);
  });
});
