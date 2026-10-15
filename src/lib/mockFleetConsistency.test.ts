import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  FLEET,
  MOCK_DIRECTOR_PORTFOLIO,
  MOCK_DIRECTOR_VERDICTS,
  MOCK_MEMORIES,
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
} from "./mock-dashboard-data";
import { MOCK_EVENTS, MOCK_EXECUTIONS, MOCK_PERSONAS, MOCK_SUBSCRIPTIONS } from "./mockData";
import { DEMO_CREW, crewAgentId, crewPersonaId, hueOf } from "./demoCrew";
import { FLEET as STAGE_FLEET } from "@/components/dashboard/fleet-monitor/fleet-data";
import { scopeDaily, scopeExecutions } from "@/components/dashboard/scope/scopeProjections";
import { resolveScopeFilter, type Scope } from "./dashboardScope";
import { DEMO_SEED_NOW } from "./demoClock";
import { CREW_OBJECTIVES, SLO_WINDOW_DAYS, crewWorld, daysWithFixed } from "./demoWorld/crew";
import { agentDays, worldSnapshots } from "./demoWorld/fleetReads";
import { COST_UNIT, DAY_MS, LOG_DAYS, utcDate, utcDayStart } from "./demoWorld/generate";
import { drillOver, drillScopeChoice, runTotals } from "./metricDrill";
import { getDemoLeaderboard, mockApi } from "./mockApi";
import { breachEpisodes, sli, type SliPoint } from "./sloEngine";
import { standings } from "./standings";
import type { DailyMetric, GlobalExecution } from "./types";
import type { DateRangePreset } from "@/stores/dashboardFilterStore";

// The demo dashboard tells ONE story. These cases hold fixtures that other
// pages cross-read to that story, so no two screens can contradict each other.

// mockApi loads the world on its first read. Load it now, before a case below
// re-imports the fixtures under a mocked clock (vi.resetModules): every read in
// this file then comes from the one world these imports belong to.
beforeAll(async () => {
  await mockApi.listExecutions({ limit: 0 });
});

const fleetById = new Map(FLEET.map((m) => [m.id, m]));

describe("the stage's crew is the synced personas (D2)", () => {
  const agentById = new Map(STAGE_FLEET.agents.map((a) => [a.id, a]));
  const pending = (personaId: string) =>
    MOCK_EVENTS.filter((e) => e.eventType === "manual_review" && e.targetPersonaId === personaId && e.status === "pending");

  it("five distinct pairs: every synced persona, each a different stage agent", () => {
    expect(DEMO_CREW).toHaveLength(5);
    expect(new Set(DEMO_CREW.map((c) => c.personaId))).toEqual(new Set(MOCK_PERSONAS.map((p) => p.id)));
    expect(new Set(DEMO_CREW.map((c) => c.agentId)).size).toBe(5);
  });

  it("ids map both ways, and a stage-only agent maps to nobody", () => {
    for (const { personaId, agentId } of DEMO_CREW) {
      expect(agentById.has(agentId), agentId).toBe(true);
      expect(crewAgentId(personaId)).toBe(agentId);
      expect(crewPersonaId(agentId)).toBe(personaId);
      expect(crewAgentId(crewPersonaId(agentId)!)).toBe(agentId);
    }
    const crew = new Set(DEMO_CREW.map((c) => c.agentId));
    const others = STAGE_FLEET.agents.filter((a) => !crew.has(a.id));
    expect(others).toHaveLength(STAGE_FLEET.agents.length - 5);
    for (const a of others) expect(crewPersonaId(a.id), a.id).toBeNull();
  });

  it("each pair shares its name, colour and on/off, so the Board and the pages show one person", () => {
    for (const { personaId, agentId } of DEMO_CREW) {
      const persona = MOCK_PERSONAS.find((p) => p.id === personaId)!;
      const agent = agentById.get(agentId)!;
      expect(agent.name, agentId).toBe(persona.name);
      expect(agent.hue, agentId).toBe(hueOf(persona.color!));
      expect(agent.enabled, agentId).toBe(persona.enabled);
      // The dashboard roster every other page reads carries the same colour.
      expect(FLEET.find((m) => m.id === personaId)?.color).toBe(persona.color);
    }
  });

  it("no other stage agent wears a crew name", () => {
    const names = new Set(MOCK_PERSONAS.map((p) => p.name));
    const crew = new Set(DEMO_CREW.map((c) => c.agentId));
    for (const a of STAGE_FLEET.agents) if (!crew.has(a.id)) expect(names.has(a.name), a.id).toBe(false);
  });

  it("a crew agent's reviews on the Board are its persona's pending reviews, by event id", () => {
    for (const { personaId, agentId } of DEMO_CREW) {
      const reviews = agentById.get(agentId)!.reviews;
      const events = pending(personaId);
      expect(reviews.map((r) => r.id).sort(), agentId).toEqual(events.map((e) => e.id).sort());
      for (const e of events) {
        const p = JSON.parse(e.payload!) as { title: string; severity: string };
        const r = reviews.find((x) => x.id === e.id)!;
        expect(r.title).toBe(p.title);
        expect(r.severity).toBe(p.severity);
        // Same age, within the minute the fixtures were stamped in.
        expect(Math.abs(r.ageMin - (Date.now() - Date.parse(e.createdAt)) / 60_000)).toBeLessThan(2);
      }
    }
  });
});

describe("Director fixtures judge the shared demo fleet (D20a)", () => {
  it("every roster entry is a FLEET member, with its name and colour", () => {
    for (const entry of MOCK_DIRECTOR_PORTFOLIO.roster) {
      const member = fleetById.get(entry.id);
      expect(member, entry.id).toBeDefined();
      expect(entry.name).toBe(member!.name);
      expect(entry.color).toBe(member!.color);
    }
  });

  it("every verdict names a FLEET member, with its name and colour", () => {
    for (const v of MOCK_DIRECTOR_VERDICTS) {
      const member = fleetById.get(v.personaId);
      expect(member, v.id).toBeDefined();
      expect(v.personaName).toBe(member!.name);
      expect(v.personaColor).toBe(member!.color);
    }
  });

  it("no verdict is newer than its agent's last review", () => {
    const lastReviewed = new Map(
      MOCK_DIRECTOR_PORTFOLIO.roster.map((r) => [r.id, r.lastReviewedAt]),
    );
    for (const v of MOCK_DIRECTOR_VERDICTS) {
      const at = lastReviewed.get(v.personaId);
      expect(at, v.id).not.toBeNull();
      expect(Date.parse(v.createdAt)).toBeLessThanOrEqual(Date.parse(at!));
    }
  });

  it("holds when the clock ticks between fixture reads", async () => {
    let n = 0;
    const spy = vi.spyOn(Date, "now").mockImplementation(() => 1_790_000_000_000 + n++);
    try {
      vi.resetModules();
      const fresh = await import("./mock-dashboard-data");
      const lastReviewed = new Map(
        fresh.MOCK_DIRECTOR_PORTFOLIO.roster.map((r) => [r.id, r.lastReviewedAt]),
      );
      for (const v of fresh.MOCK_DIRECTOR_VERDICTS) {
        const at = lastReviewed.get(v.personaId);
        expect(at, v.id).not.toBeNull();
        expect(Date.parse(v.createdAt)).toBeLessThanOrEqual(Date.parse(at!));
      }
    } finally {
      spy.mockRestore();
    }
  });
});

describe("dead letters agree with the subscriptions (D20b)", () => {
  it('a "No subscription matched" event had no enabled subscription for its type when it failed', () => {
    const subs = Object.values(MOCK_SUBSCRIPTIONS).flat();
    const unmatched = MOCK_EVENTS.filter((e) =>
      e.errorMessage?.startsWith("No subscription matched"),
    );
    expect(unmatched.length).toBeGreaterThan(0);
    for (const e of unmatched) {
      const matching = subs.filter(
        (s) =>
          s.enabled &&
          s.eventType === e.eventType &&
          (s.sourceFilter === null || s.sourceFilter === e.sourceType) &&
          Date.parse(s.createdAt) <= Date.parse(e.createdAt),
      );
      expect(matching.map((s) => s.id), e.id).toEqual([]);
    }
  });
});

describe("knowledge memories are distinct (D20c)", () => {
  it("no two memories share a title", () => {
    const titles = MOCK_MEMORIES.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("every memory belongs to a FLEET member, and some are in conflict", () => {
    const names = new Set(FLEET.map((m) => m.name));
    for (const m of MOCK_MEMORIES) expect(names.has(m.persona), m.id).toBe(true);
    expect(MOCK_MEMORIES.some((m) => m.hasConflict)).toBe(true);
    expect(new Set(MOCK_MEMORIES.map((m) => m.status))).toEqual(
      new Set(["active", "pending", "archived"]),
    );
  });
});

// ── One world through the real engines (L3) ─────────────────────────
// The Board, Executions, Observability, Mission Control, the leaderboard and
// SLA read one log: the demo world's runs (src/lib/demoWorld/). These cases
// hold them to each other by EQUALITY at the demo's fixed time (the seed
// clock); they replace the constants observabilityFixtures used to pin
// (47 runs, $4.82), which described a 5-persona world the Board never showed.
// Each describe names the population its surface covers.

const units = (usd: number) => Math.round(usd * COST_UNIT);
const sumUnits = (xs: readonly { costUsd: number }[]) => xs.reduce((a, r) => a + units(r.costUsd), 0);
const TODAY = utcDayStart(DEMO_SEED_NOW);
const isToday = (iso: string) => {
  const at = Date.parse(iso);
  return at >= TODAY && at < TODAY + DAY_MS;
};

/** Every row `api.listExecutions()` serves in the demo (the executions store asks for the whole log there). */
const listAll = () => mockApi.listExecutions() as Promise<GlobalExecution[]>;

describe("today reconciles across the Board, Observability and Executions (population: the 99-agent demo fleet)", () => {
  it("the Board's runs today == today's executions in getObservability() == today's rows in listExecutions(); spend likewise", async () => {
    const boardRuns = STAGE_FLEET.agents.reduce((a, x) => a + x.runsToday, 0);
    const boardUnits = STAGE_FLEET.agents.reduce((a, x) => a + units(x.costTodayUsd), 0);
    const [observability, rows] = await Promise.all([mockApi.getObservability(), listAll()]);
    const today = observability.dailyMetrics.at(-1)!;
    const todayRows = rows.filter((r) => isToday(r.createdAt));

    expect(today.date).toBe(utcDate(TODAY));
    expect(today.executions).toBe(boardRuns);
    expect(todayRows).toHaveLength(boardRuns);
    expect(units(today.cost)).toBe(boardUnits);
    expect(sumUnits(todayRows)).toBe(boardUnits);
    // The whole window, too: the tiles are the table's rows summed.
    const windowStart = TODAY - (LOG_DAYS - 1) * DAY_MS;
    const windowRows = rows.filter((r) => Date.parse(r.createdAt) >= windowStart);
    expect(windowRows).toHaveLength(observability.metrics.totalExecutions);
    expect((sumUnits(windowRows) / COST_UNIT).toFixed(2)).toBe(observability.metrics.totalCost.toFixed(2));
  }, 15_000);

  it("each day of the series is that day's rows, and each synced agent's spend row is its rows", async () => {
    const [observability, rows] = await Promise.all([mockApi.getObservability(), listAll()]);
    for (const day of observability.dailyMetrics) {
      const of = rows.filter((r) => r.createdAt.startsWith(day.date));
      expect(of.length, day.date).toBe(day.executions);
      expect(of.filter((r) => r.status === "completed").length, day.date).toBe(day.successes);
      expect(of.filter((r) => r.status === "failed").length, day.date).toBe(day.failures);
      expect(sumUnits(of), day.date).toBe(units(day.cost));
    }
    for (const spend of observability.personaSpend.filter((s) => MOCK_PERSONAS.some((p) => p.id === s.personaId))) {
      const of = rows.filter((r) => r.personaId === spend.personaId);
      expect(of.length, spend.personaId).toBe(spend.executionCount);
      expect(sumUnits(of), spend.personaId).toBe(units(spend.totalCost));
    }
  }, 15_000);
});

describe("the analytic views run the product's engines over the projected rows", () => {
  it("leaderboard order == standings() over the snapshots, and the log days' snapshots are the listed rows folded (population: the demo fleet)", async () => {
    const [leaderboard, rows] = await Promise.all([getDemoLeaderboard(), listAll()]);
    const snapshots = worldSnapshots(agentDays({ rows: MOCK_EXECUTIONS, personas: MOCK_PERSONAS }));
    expect(leaderboard.map((r) => r.id)).toEqual(standings(snapshots, utcDate(TODAY)).map((s) => s.id));
    expect(leaderboard).toHaveLength(STAGE_FLEET.agents.length);

    const logStart = utcDate(TODAY - (LOG_DAYS - 1) * DAY_MS);
    const folded = new Map<string, { finished: number; ok: number; units: number }>();
    for (const r of rows) {
      if (r.status !== "completed" && r.status !== "failed") continue;
      const key = `${r.personaId}|${r.createdAt.slice(0, 10)}`;
      const f = folded.get(key) ?? { finished: 0, ok: 0, units: 0 };
      f.finished += 1;
      f.ok += r.status === "completed" ? 1 : 0;
      folded.set(key, f);
    }
    const logSnapshots = snapshots.filter((s) => s.snapshot_date >= logStart);
    expect(logSnapshots.length).toBeGreaterThan(0);
    for (const s of logSnapshots) {
      const f = folded.get(`${s.persona_id}|${s.snapshot_date}`);
      expect(f, `${s.persona_id} ${s.snapshot_date}`).toBeDefined();
      expect(s.total_executions).toBe(f!.finished);
      expect(s.successful_executions).toBe(f!.ok);
    }
  }, 15_000);

  it("SLA breaches == breachEpisodes() over each objective's daily SLI (population: the 5 synced agents carry objectives)", () => {
    const world = crewWorld();
    let episodesTotal = 0;
    for (const objective of CREW_OBJECTIVES) {
      const log = world.logs.find((l) => l.agent.personaId === objective.personaId)!;
      const days = daysWithFixed(log, world.fixed.get(objective.personaId) ?? [], TODAY);
      const points: SliPoint[] = [];
      for (let d = SLO_WINDOW_DAYS - 1; d >= 0; d--) {
        const day = days[d];
        points.push({
          date: utcDate(TODAY - d * DAY_MS),
          total: day.completed + day.failed,
          good: day.completed,
          durationMs: day.timed > 0 ? day.durationSum / day.timed : undefined,
        });
      }
      const latency = objective.metric === "latency";
      const episodes = breachEpisodes(sli(points, latency ? "latency" : "successRate"), {
        target: objective.target,
        direction: latency ? "lower" : "higher",
      });
      const name = MOCK_PERSONAS.find((p) => p.id === objective.personaId)!.name;
      const breaches = MOCK_SLA_BREACHES.filter((b) => b.persona === name && b.metric === objective.metric);
      expect(breaches.map((b) => b.startedAt.slice(0, 10)).sort(), objective.id).toEqual(episodes.map((e) => e.start).sort());
      expect(breaches.some((b) => b.resolvedAt === null), objective.id).toBe(episodes.some((e) => e.ongoing));
      expect(MOCK_SLA_TARGETS.find((t) => t.id === objective.id)!.activeBreach, objective.id).toBe(episodes.some((e) => e.ongoing));
      episodesTotal += episodes.length;
    }
    expect(MOCK_SLA_BREACHES).toHaveLength(episodesTotal);
    // The incident threads (D3) keep their identity: each declared fault is one breach.
    expect(MOCK_SLA_BREACHES.map((b) => b.id).sort()).toEqual(["br_1", "br_2", "br_3", "br_4"]);
  });

  it("an objective's SLI over the log days is the listed rows of that persona", async () => {
    const rows = await listAll();
    const world = crewWorld();
    for (const objective of CREW_OBJECTIVES) {
      const log = world.logs.find((l) => l.agent.personaId === objective.personaId)!;
      const days = daysWithFixed(log, world.fixed.get(objective.personaId) ?? [], TODAY);
      for (let d = 0; d < LOG_DAYS; d++) {
        const date = utcDate(TODAY - d * DAY_MS);
        const of = rows.filter((r) => r.personaId === objective.personaId && r.createdAt.startsWith(date));
        expect(of.filter((r) => r.status === "completed").length, `${objective.id} ${date}`).toBe(days[d].completed);
        expect(of.filter((r) => r.status === "failed").length, `${objective.id} ${date}`).toBe(days[d].failed);
      }
    }
  }, 15_000);
});

describe("a metric drills to exactly the executions behind it (P23)", () => {
  const scopeOf = (choice: ReturnType<typeof drillScopeChoice>): Scope => ({
    filter: resolveScopeFilter(choice, MOCK_PERSONAS),
    now: DEMO_SEED_NOW,
  });
  /** What the executions table shows for a drill: the store's scope over the served rows, totalled. */
  const contributing = (rows: GlobalExecution[], personaId: string | null, days: readonly DailyMetric[]) =>
    runTotals(scopeExecutions(rows, scopeOf(drillScopeChoice(drillOver(personaId, days)!))));

  it("Observability's run and spend tiles (the 14-day window, every agent)", async () => {
    const [observability, rows] = await Promise.all([mockApi.getObservability(), listAll()]);
    const totals = contributing(rows, null, observability.dailyMetrics);
    expect(totals.runs).toBe(observability.metrics.totalExecutions);
    expect(totals.costUsd.toFixed(2)).toBe(observability.metrics.totalCost.toFixed(2));
  }, 15_000);

  it("each synced agent's spend row (the 14-day window, that persona)", async () => {
    const [observability, rows] = await Promise.all([mockApi.getObservability(), listAll()]);
    for (const { id } of MOCK_PERSONAS) {
      const row = observability.personaSpend.find((s) => s.personaId === id)!;
      const totals = contributing(rows, id, observability.dailyMetrics);
      expect(totals.runs, id).toBe(row.executionCount);
      expect(units(totals.costUsd), id).toBe(units(row.totalCost));
    }
  }, 15_000);

  it("Mission Control's run total and spend, in every window the scope bar offers", async () => {
    const [daily, rows] = await Promise.all([mockApi.getObservabilityDaily(), listAll()]);
    for (const dateRange of ["24h", "7d", "30d", "90d"] as DateRangePreset[]) {
      const scoped = scopeDaily(daily, { filter: resolveScopeFilter({ personaId: null, dateRange }, MOCK_PERSONAS), now: DEMO_SEED_NOW });
      const totals = contributing(rows, null, scoped);
      expect(totals.runs, dateRange).toBe(scoped.reduce((a, d) => a + d.executions, 0));
      expect(units(totals.costUsd), dateRange).toBe(scoped.reduce((a, d) => a + units(d.cost), 0));
    }
  }, 15_000);

  it("today, per synced agent: the crew tile's runs and spend on the Board", async () => {
    const [daily, rows] = await Promise.all([mockApi.getObservabilityDaily(), listAll()]);
    const today = daily.slice(-1);
    for (const { personaId, agentId } of DEMO_CREW) {
      const tile = STAGE_FLEET.agents.find((a) => a.id === agentId)!;
      const totals = contributing(rows, personaId, today);
      expect(totals.runs, agentId).toBe(tile.runsToday);
      expect(units(totals.costUsd), agentId).toBe(units(tile.costTodayUsd));
    }
  }, 15_000);
});
