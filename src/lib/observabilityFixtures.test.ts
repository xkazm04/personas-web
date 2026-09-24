import { describe, expect, it } from "vitest";
import {
  MOCK_ANNOTATIONS,
  MOCK_COST_ANOMALIES,
  MOCK_COST_COMPARE,
  MOCK_EXEC_COMPARE,
  SPARKLINE_SUCCESS,
} from "./mock-dashboard-data";
import {
  MOCK_DAILY_METRICS,
  MOCK_OBSERVABILITY_METRICS,
  MOCK_PERSONA_SPEND,
} from "./mockData";

// The Performance tab draws the headline tiles, both charts, the Compare
// overlay, the tile sparklines, the anomaly banner and the chart annotations on
// ONE screen. These cases hold every overlay to the one daily series
// (MOCK_DAILY_METRICS), so no two numbers on that screen can disagree.
//
// The series module is imported lazily so the guards run on their own.
const series = () => import("./observabilitySeries");

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const chartKeys = new Set(MOCK_DAILY_METRICS.map((d) => d.date.slice(5)));

describe("Performance-tab overlays project the daily series", () => {
  it("tile sparklines are the daily series: 14 points, summing to the tile totals", async () => {
    const { sparklinesFromDaily } = await series();
    const s = sparklinesFromDaily(MOCK_DAILY_METRICS);
    expect(s.cost).toHaveLength(14);
    expect(Math.abs(sum(s.cost) - MOCK_OBSERVABILITY_METRICS.totalCost)).toBeLessThanOrEqual(0.01);
    expect(sum(s.executions)).toBe(MOCK_OBSERVABILITY_METRICS.totalExecutions);
  });

  it("Compare overlays sit on the chart's own x keys and share its magnitude", () => {
    for (const compare of [MOCK_COST_COMPARE, MOCK_EXEC_COMPARE]) {
      expect(compare).toHaveLength(MOCK_DAILY_METRICS.length);
      for (const point of compare) expect(chartKeys.has(point.date)).toBe(true);
    }
    const costRatio = sum(MOCK_COST_COMPARE.map((p) => p.previous)) / sum(MOCK_DAILY_METRICS.map((d) => d.cost));
    const execRatio = sum(MOCK_EXEC_COMPARE.map((p) => p.previous)) / sum(MOCK_DAILY_METRICS.map((d) => d.executions));
    for (const ratio of [costRatio, execRatio]) {
      expect(ratio).toBeGreaterThanOrEqual(0.5);
      expect(ratio).toBeLessThanOrEqual(2);
    }
  });

  it("the tiles' 'vs last period' trends are the Compare overlay's own % change", async () => {
    const { periodTrend } = await series();
    const current = MOCK_DAILY_METRICS;
    const previous = MOCK_DAILY_METRICS.map((d, i) => ({
      ...d,
      cost: MOCK_COST_COMPARE[i].previous,
      executions: MOCK_EXEC_COMPARE[i].previous,
    }));
    const t = periodTrend(current, previous);
    expect(Math.abs(MOCK_OBSERVABILITY_METRICS.costTrend - t.cost)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(MOCK_OBSERVABILITY_METRICS.execTrend - t.executions)).toBeLessThanOrEqual(0.05);
  });

  it("the anomaly banner names real window days at their real cost and z-score", async () => {
    const { detectCostAnomalies } = await series();
    const detected = detectCostAnomalies(MOCK_DAILY_METRICS, 2);
    expect(detected.length).toBeGreaterThanOrEqual(1);

    const costs = MOCK_DAILY_METRICS.map((d) => d.cost);
    const mean = sum(costs) / costs.length;
    const sd = Math.sqrt(sum(costs.map((c) => (c - mean) ** 2)) / costs.length);
    for (const anomaly of MOCK_COST_ANOMALIES) {
      const d = MOCK_DAILY_METRICS.find((m) => m.date === anomaly.date);
      expect(d, `anomaly ${anomaly.date} is not a window day`).toBeDefined();
      expect(anomaly.cost).toBe(d!.cost);
      expect(anomaly.deviation).toBeCloseTo((d!.cost - mean) / sd, 10);
    }
    expect(MOCK_COST_ANOMALIES).toEqual(detected);
  });

  it("every annotation lands on an x-axis key, so recharts can draw it", () => {
    expect(MOCK_ANNOTATIONS.length).toBeGreaterThan(0);
    for (const a of MOCK_ANNOTATIONS) expect(chartKeys.has(a.date), a.date).toBe(true);
  });
});

describe("guards: the numbers other screens already reconcile against", () => {
  it("window totals are unchanged (home Vitals + traffic chart)", () => {
    expect(MOCK_OBSERVABILITY_METRICS.totalCost).toBe(4.82);
    expect(MOCK_OBSERVABILITY_METRICS.totalExecutions).toBe(47);
    expect(MOCK_OBSERVABILITY_METRICS.successRate).toBe(89.4);
  });

  it("per-agent spend still sums to the window's cost", () => {
    expect(+sum(MOCK_PERSONA_SPEND.map((p) => p.totalCost)).toFixed(2)).toBe(
      MOCK_OBSERVABILITY_METRICS.totalCost,
    );
  });

  it("SPARKLINE_SUCCESS is unchanged (home VitalsConsole renders it)", () => {
    expect(SPARKLINE_SUCCESS.map((v) => +v.toFixed(6))).toEqual([
      88.00047, 91.060522, 91.488388, 92.315125, 92.964755, 91.865443, 90.849067,
      89.736847, 88.582662, 86.754012, 86.739717, 86.310176, 86.869427, 85.423963,
    ]);
  });
});
