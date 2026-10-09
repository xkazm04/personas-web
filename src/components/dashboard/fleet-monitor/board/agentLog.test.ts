import { describe, expect, it } from "vitest";
import { FLEET } from "../fleet-data";
import { agentPlan, runHistory, runLog } from "./agentLog";
import { initSim, simReducer, type SimState } from "./sim";

const advance = (s: SimState, n: number) => {
  for (let i = 0; i < n; i++) s = simReducer(s, { type: "advance", dt: 1000, scale: 99, still: false });
  return s;
};

describe("runLog: the console's stylised tool-call log", () => {
  it("only rises in time, for every agent with a run to show", () => {
    const s = advance(initSim(99), 20);
    for (const a of s.agents) {
      const log = runLog(a, s.simMs);
      for (let i = 1; i < log.length; i++) expect(log[i].tsMs).toBeGreaterThanOrEqual(log[i - 1].tsMs);
    }
  });

  it("keeps a line's time while new calls stream in", () => {
    let s = advance(initSim(99), 12);
    const a = s.agents.find((x) => x.state === "running" && x.callTicks.length > 2)!;
    const before = new Map(runLog(a, s.simMs).map((l) => [l.key, l.tsMs]));
    s = advance(s, 4);
    const after = s.agents.find((x) => x.id === a.id)!;
    if (after.startSim !== a.startSim) return; // the run ended and a new one began
    for (const l of runLog(after, s.simMs)) if (before.has(l.key)) expect(l.tsMs).toBe(before.get(l.key));
  });

  it("ends a failed run on its failure line and a resting agent has none", () => {
    const s = initSim(99);
    const failed = s.agents.find((a) => a.state === "failed")!;
    expect(runLog(failed, 0).at(-1)?.end).toBe("failed");
    const waiting = s.agents.find((a) => a.state === "input_required")!;
    expect(runLog(waiting, 0).at(-1)?.end).toBe("paused");
    const idle = s.agents.find((a) => a.state === "idle")!;
    expect(runLog(idle, 0)).toEqual([]);
  });
});

describe("runHistory: the last 12 runs", () => {
  const midnight = Math.floor(FLEET.nowMs / 86_400_000) * 86_400_000;

  it("puts exactly today's runs after midnight, newest first", () => {
    for (const a of initSim(99).agents) {
      const rows = runHistory(a, 0);
      expect(rows.length).toBe(a.recentStatuses.length);
      const today = Math.min(a.runsToday, rows.length);
      rows.forEach((r, i) => {
        if (i < today) expect(r.endedMs).toBeGreaterThanOrEqual(midnight);
        else expect(r.endedMs).toBeLessThan(midnight);
        if (i) expect(r.endedMs).toBeLessThan(rows[i - 1].endedMs);
      });
    }
  });
});

describe("agentPlan", () => {
  it("schedules the next slot after now, or none for a trigger-only agent", () => {
    for (const a of initSim(99).agents) {
      const p = agentPlan(a, 5000);
      if (p.everyMin == null) expect(p.nextMs).toBeNull();
      else {
        expect(p.nextMs!).toBeGreaterThan(FLEET.nowMs + 5000);
        expect(p.nextMs! - (FLEET.nowMs + 5000)).toBeLessThanOrEqual(p.everyMin * 60_000);
      }
      expect(p.trigger.length).toBeGreaterThan(0);
    }
  });
});
