import { describe, expect, it } from "vitest";
import { MIN_RUNS, addDays, selfRelative, standings, windowedAxes, type SnapshotRow } from "./standings";

const ASOF = "2026-10-11";

function snap(id: string, daysAgo: number, runs: number, durMs: number, cost = 0.01 * runs, ok = runs): SnapshotRow {
  return {
    persona_id: id,
    snapshot_date: addDays(ASOF, -daysAgo),
    total_executions: runs,
    successful_executions: ok,
    total_cost_usd: String(cost), // PostgREST numeric arrives as a string
    avg_duration_ms: durMs,
  };
}

describe("windowedAxes", () => {
  it("splits current and prior windows and weights duration by runs", () => {
    const rows = [snap("a", 0, 1, 1000), snap("a", 1, 3, 2000), snap("a", 8, 4, 9000)];
    const cur = windowedAxes(rows, { start: addDays(ASOF, -6), end: ASOF }).get("a")!;
    expect(cur.runs).toBe(4);
    expect(cur.durationMs).toBe(1750);
    const prior = windowedAxes(rows, { start: addDays(ASOF, -13), end: addDays(ASOF, -7) }).get("a")!;
    expect(prior.runs).toBe(4);
    expect(prior.durationMs).toBe(9000);
  });
});

describe("selfRelative", () => {
  it("is neutral without a baseline or inside the floor, and rises with improvement", () => {
    expect(selfRelative(60000, undefined, 250)).toBe(50);
    expect(selfRelative(60100, 60000, 250)).toBe(50);
    expect(selfRelative(54000, 60000, 250)).toBeGreaterThan(50); // 10% faster
    expect(selfRelative(66000, 60000, 250)).toBeLessThan(50);
  });
});

describe("standings", () => {
  it("scores the slowest job against its own baseline, not the cohort max", () => {
    const rows: SnapshotRow[] = [];
    for (let d = 0; d < 7; d++) rows.push(snap("slow", d, 2, 56070)); // 10% faster
    for (let d = 7; d < 30; d++) rows.push(snap("slow", d, 2, 62300));
    for (let d = 0; d < 30; d++) rows.push(snap("fast", d, 2, 5000));
    const slow = standings(rows, ASOF).find((x) => x.id === "slow")!;
    expect(slow.metrics.speed).toBeGreaterThan(50);
  });

  it("gives an honest delta of 0 for identical windows", () => {
    const rows: SnapshotRow[] = [];
    for (let d = 0; d < 40; d++) rows.push(snap("a", d, 2, 4000));
    const a = standings(rows, ASOF)[0];
    expect(a.delta).toBe(0);
    expect(a.trend).toBe("flat");
    expect(a.deltaSuppressed).toBe(false);
  });

  it("suppresses the delta below the minimum-runs floor", () => {
    const rows = [snap("a", 0, MIN_RUNS - 1, 4000), snap("a", 8, 10, 9000)];
    const a = standings(rows, ASOF)[0];
    expect(a.deltaSuppressed).toBe(true);
    expect(a.delta).toBe(0);
  });

  it("reports real movement and a rank history that shows a climb", () => {
    const rows: SnapshotRow[] = [];
    for (let d = 0; d < 7; d++) rows.push(snap("climber", d, 6, 4000));
    for (let d = 7; d < 14; d++) rows.push(snap("climber", d, 6, 4000, 0.06, 2));
    for (let d = 0; d < 14; d++) rows.push(snap("steady", d, 6, 4000, 0.06, 5));
    const climber = standings(rows, ASOF).find((x) => x.id === "climber")!;
    expect(climber.delta).toBeGreaterThan(0);
    expect(climber.trend).toBe("up");
    const h = climber.rankHistory;
    expect(h[h.length - 1]).toBe(1);
    expect(h[h.length - 2]).toBe(2);
    expect(h[0]).toBeNull();
  });
});
