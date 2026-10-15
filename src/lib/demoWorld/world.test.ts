import { describe, expect, it } from "vitest";
import raw from "@/components/dashboard/fleet-monitor/fleet.json";
import { FLEET, type Fleet } from "@/components/dashboard/fleet-monitor/fleet-data";
import { DEMO_CREW, crewPersonaId } from "../demoCrew";
import { DEMO_BOARD_DAY_MS, DEMO_FLEET_NOW_MS, DEMO_SEED_NOW } from "../demoClock";
import { MOCK_EXECUTIONS } from "../mockData";
import { CREW_DAYS, buildCrewWorld, crewDayFigures, crewSla, crewWorld, daysWithFixed } from "./crew";
import { buildFleetWorld, demoFleetLog, stagePersonaId } from "./fleetLog";
import { worldRows } from "./fleetReads";
import { COST_UNIT, DAY_MS, LOG_DAYS, isoOf, utcDayStart, type AgentLog } from "./generate";
import { worldShape } from "./shape";

/**
 * The demo world's generator against its root (fleet.json and the crew's
 * persona-side declarations). The cross-view equalities (Board == Observability
 * == Executions, the engines, the drill-downs) live in
 * src/lib/mockFleetConsistency.test.ts; this file holds the projection itself.
 */

const ROOT = raw as unknown as Fleet;
const units = (usd: number) => Math.round(usd * COST_UNIT);
const isCrew = (log: AgentLog) => crewPersonaId(log.agent.agentId) !== null;
const finished = (s: string) => s === "completed" || s === "failed";

describe("the root", () => {
  it("the demo's shared clock is fleet.json's: its now, and the Board's day so far", () => {
    expect(DEMO_FLEET_NOW_MS).toBe(ROOT.nowMs);
    expect(DEMO_BOARD_DAY_MS).toBe(ROOT.nowMs - utcDayStart(ROOT.nowMs));
  });

  it("fleet.json's crew tiles carry the crew's declared day (the persona side is the source)", () => {
    for (const { personaId, agentId } of DEMO_CREW) {
      const tile = ROOT.agents.find((a) => a.id === agentId)!;
      expect(tile.runsToday, agentId).toBe(CREW_DAYS[personaId].runsToday);
      expect(tile.costTodayUsd, agentId).toBe(CREW_DAYS[personaId].costTodayUsd);
    }
  });

  it("a tile that ran nothing today spent nothing (aggregate agreement starts at the root)", () => {
    for (const a of ROOT.agents) if (a.runsToday === 0) expect(a.costTodayUsd, a.id).toBe(0);
  });
});

describe("today reproduces every Board tile", () => {
  const world = demoFleetLog();

  it("the 94 stage agents: runs, spend, success rate, the newest dots and the run in flight", () => {
    const stage = world.logs.filter((log) => !isCrew(log));
    expect(stage).toHaveLength(ROOT.agents.length - DEMO_CREW.length);
    for (const log of stage) {
      const tile = ROOT.agents.find((a) => a.id === log.agent.agentId)!;
      const today = log.days[0];
      expect(today.runs, tile.id).toBe(tile.runsToday);
      expect(today.costUnits, tile.id).toBe(units(tile.costTodayUsd));
      // The tile's success rate is over its 12 dots, and the dots are the log's newest finished runs.
      expect(tile.successRate, tile.id).toBe(Math.round((tile.recentStatuses.filter((s) => s === "completed").length / 12) * 100) / 100);
      const dots = log.runs.filter((r) => finished(r.status)).slice(0, tile.recentStatuses.length).map((r) => r.status);
      expect(dots, tile.id).toEqual(tile.recentStatuses.slice(0, dots.length));
      const live = log.runs.find((r) => r.id === `run-${tile.id}-live-mock`);
      expect(Boolean(live), tile.id).toBe(tile.runsToday > 0 && ["running", "input_required", "queued"].includes(tile.state));
    }
  });

  it("the 5 crew tiles show the crew's log (generated runs and the authored ones)", () => {
    const figures = crewDayFigures();
    const crew = crewWorld();
    for (const log of crew.logs) {
      const tile = FLEET.agents.find((a) => a.id === log.agent.agentId)!;
      const today = daysWithFixed(log, crew.fixed.get(log.agent.personaId) ?? [], crew.shape.todayStartMs)[0];
      expect(tile.runsToday, tile.id).toBe(today.runs);
      expect(units(tile.costTodayUsd), tile.id).toBe(today.costUnits);
      expect(tile.runsToday, tile.id).toBe(CREW_DAYS[log.agent.personaId].runsToday);
      expect(tile.recentStatuses, tile.id).toEqual(figures.get(tile.id)!.recentStatuses);
      expect(tile.recentStatuses, tile.id).toHaveLength(12);
      expect(tile.successRate, tile.id).toBe(figures.get(tile.id)!.successRate);
    }
  });
});

describe("whatever hour the demo loads, the day still reconciles and the faults still breach", () => {
  // UTC hours spanning the day: just after midnight (the day so far is minutes),
  // early, the Board's own hour, just before midnight.
  const hours = [0.1, 3, 14 + 1 / 3, 23.9];
  for (const hour of hours) {
    it(`at ${hour.toFixed(2)}h UTC`, () => {
      const now = utcDayStart(DEMO_SEED_NOW) + Math.round(hour * 3_600_000);
      const shift = now - DEMO_SEED_NOW;
      const authored = MOCK_EXECUTIONS.map((e) => ({
        ...e,
        createdAt: new Date(Date.parse(e.createdAt) + shift).toISOString(),
      }));
      const crew = buildCrewWorld(worldShape(now), authored);
      const world = buildFleetWorld(crew, ROOT.agents);
      for (const log of world.logs) {
        const fixed = crew.fixed.get(log.agent.personaId) ?? [];
        const today = daysWithFixed(log, fixed, crew.shape.todayStartMs)[0];
        const tile = ROOT.agents.find((a) => a.id === log.agent.agentId)!;
        expect(today.runs, `${tile.id} runs`).toBe(tile.runsToday);
        expect(today.costUnits, `${tile.id} cost`).toBe(units(tile.costTodayUsd));
        for (const run of log.runs) expect(run.at, run.id).toBeLessThanOrEqual(now);
      }
      expect(crewSla(crew).breaches.map((b) => b.id).sort()).toEqual(["br_1", "br_2", "br_3", "br_4"]);
    });
  }
});

describe("identity and determinism", () => {
  it("every generated run has one id, marked as demo data, and none collides with an authored run", () => {
    const { rows } = worldRows();
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.size).toBe(rows.length);
    for (const id of ids) expect(id.endsWith("-mock"), id).toBe(true);
    for (const e of MOCK_EXECUTIONS) expect(ids.has(e.id), e.id).toBe(false);
    for (const log of demoFleetLog().logs) {
      const expected = crewPersonaId(log.agent.agentId) ?? stagePersonaId(log.agent.agentId);
      expect(log.agent.personaId).toBe(expected);
    }
  });

  it("the same seed and clock build the same world", () => {
    const a = buildFleetWorld(buildCrewWorld(worldShape(DEMO_SEED_NOW)), ROOT.agents);
    const b = buildFleetWorld(buildCrewWorld(worldShape(DEMO_SEED_NOW)), ROOT.agents);
    expect(a.logs.map((l) => l.runs.map((r) => `${r.id}@${r.at}:${r.status}:${r.costUnits}`))).toEqual(
      b.logs.map((l) => l.runs.map((r) => `${r.id}@${r.at}:${r.status}:${r.costUnits}`)),
    );
  });

  it("holds a 14-day log at the Board's scale, and builds it quickly (memoized after)", () => {
    const t0 = performance.now();
    const world = buildFleetWorld(buildCrewWorld(worldShape(DEMO_SEED_NOW + 1)), ROOT.agents);
    const rows = worldRows(world).rows;
    const ms = performance.now() - t0;
    expect(rows.length).toBeGreaterThan(LOG_DAYS * 1_000);
    expect(rows[rows.length - 1].createdAt >= new Date(utcDayStart(DEMO_SEED_NOW) - (LOG_DAYS - 1) * DAY_MS).toISOString()).toBe(true);
    // Generous: the build runs once per load, on the first read that needs it.
    expect(ms).toBeLessThan(3_000);
    expect(worldRows(world).rows).toBe(rows);
  });

  it("formats stamps exactly as toISOString", () => {
    for (const ms of [0, 1_790_864_400_000, DEMO_SEED_NOW, DEMO_SEED_NOW - 123_456_789, 1_700_000_000_001]) {
      expect(isoOf(ms)).toBe(new Date(ms).toISOString());
    }
  });
});
