import { describe, expect, it } from "vitest";

import { resolveScopeFilter, scopeHidAll, type Scope } from "@/lib/dashboardScope";
import { DEMO_SEED_NOW } from "@/lib/demoClock";
import { listWorldExecutions, observabilityOf, worldLeaderboard } from "@/lib/demoWorld/fleetReads";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  MOCK_MEMORIES,
  MOCK_MESSAGE_THREADS,
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
} from "@/lib/mock-dashboard-data";
import { MOCK_EVENTS, MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import type { DateRangePreset } from "@/stores/dashboardFilterStore";
import type { ManualReviewItem } from "@/lib/types";

import {
  scopeDaily,
  scopeEvents,
  scopeExecutions,
  scopeKnowledge,
  scopeLeaderboard,
  scopeMessages,
  scopeReviews,
  scopeSla,
} from "./scopeProjections";

/**
 * The before/after the scope bar promises, over the demo's own fixtures (the
 * rows each view's data hook reads), measured from the demo's seed clock as the
 * hooks do. Before this change no view read the store, so every surface showed
 * its "All personas" counts whatever the bar said.
 *
 * L3 re-baseline: executions, the leaderboard and Mission Control's run total
 * now read the demo world (the Board's 99-agent fleet, a 14-day log of ~24k
 * runs) instead of the 12-row / 47-run fixtures, so their counts are computed
 * here from the rows rather than pinned; the fixed fixtures keep their numbers.
 */

const IR = "p-0002-mock"; // Incident Responder
const IR_NAME = MOCK_PERSONAS.find((p) => p.id === IR)!.name;

// The review queue is the store's projection of the manual_review events
// (reviewStore.parseManualReview): persona = the event's target, time = its creation.
const REVIEWS = MOCK_EVENTS.filter((e) => e.eventType === "manual_review").map(
  (e) => ({ id: e.id, personaId: e.targetPersonaId ?? "", createdAt: e.createdAt }) as ManualReviewItem,
);

function scope(personaId: string | null, dateRange: DateRangePreset): Scope {
  return { filter: resolveScopeFilter({ personaId, dateRange }, MOCK_PERSONAS), now: DEMO_SEED_NOW };
}

// What the demo serves (mockApi reads these): the world's log and its folds.
const SESSION = { rows: MOCK_EXECUTIONS, personas: MOCK_PERSONAS };
const EXECUTIONS = listWorldExecutions(SESSION);
const DAILY = observabilityOf(SESSION).dailyMetrics;
const LEADERBOARD = worldLeaderboard(SESSION);
const HOUR = 3_600_000;

/** Independent of `inScope`: runs of a persona (or all) created at or after `since`. */
const runsSince = (personaId: string | null, since: number) =>
  EXECUTIONS.filter((e) => (personaId === null || e.personaId === personaId) && Date.parse(e.createdAt) >= since).length;
/** The run total of the days whose UTC midnight is at or after `since`. */
const runsOfDaysSince = (since: number) =>
  DAILY.filter((d) => Date.parse(`${d.date}T00:00:00Z`) >= since).reduce((sum, d) => sum + d.executions, 0);

function surfaces(s: Scope) {
  const sla = scopeSla({ targets: MOCK_SLA_TARGETS, breaches: MOCK_SLA_BREACHES }, s);
  const knowledge = scopeKnowledge({ patterns: MOCK_KNOWLEDGE_PATTERNS, memories: MOCK_MEMORIES }, s);
  const daily = scopeDaily(DAILY, s);
  return {
    executions: scopeExecutions(EXECUTIONS, s),
    reviews: scopeReviews(REVIEWS, s),
    events: scopeEvents(MOCK_EVENTS, s),
    leaderboard: scopeLeaderboard(LEADERBOARD, s),
    slaTargets: sla.targets,
    slaBreaches: sla.breaches,
    patterns: knowledge.patterns,
    memories: knowledge.memories,
    threads: scopeMessages(MOCK_MESSAGE_THREADS, s),
    // Mission Control's run total (outcomesOf sums the scoped days).
    homeRuns: daily.reduce((sum, day) => sum + day.executions, 0),
    homeDays: daily.length,
  };
}

const counts = (s: ReturnType<typeof surfaces>) =>
  Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Array.isArray(v) ? v.length : v]));

describe("the default scope (All personas, 7 days)", () => {
  it("keeps every list row the fixtures hold: the lists paint as before", () => {
    const s = surfaces(scope(null, "7d"));
    // The log reaches back 14 days, so the 7-day window keeps the runs of its own 7 days.
    expect(s.executions).toEqual(EXECUTIONS.filter((e) => Date.parse(e.createdAt) >= DEMO_SEED_NOW - 7 * 24 * HOUR));
    expect(s.executions.length).toBeLessThan(EXECUTIONS.length);
    expect(s.reviews).toEqual(REVIEWS);
    expect(s.events).toEqual(MOCK_EVENTS);
    expect(s.leaderboard).toEqual(LEADERBOARD);
    expect(s.slaTargets).toEqual(MOCK_SLA_TARGETS);
    expect(s.slaBreaches).toEqual(MOCK_SLA_BREACHES);
    expect(s.patterns).toEqual(MOCK_KNOWLEDGE_PATTERNS);
    expect(s.memories).toEqual(MOCK_MEMORIES);
    expect(s.threads).toEqual(MOCK_MESSAGE_THREADS);
  });

  it("reads Mission Control's last 7 of its 14 days, which its header now states", () => {
    expect(DAILY).toHaveLength(14);
    const week = DAILY.slice(-7).reduce((sum, d) => sum + d.executions, 0);
    const fortnight = DAILY.reduce((sum, d) => sum + d.executions, 0);
    expect(surfaces(scope(null, "7d"))).toMatchObject({ homeDays: 7, homeRuns: week });
    // The whole fortnight (the old fixed 14-day reading) is one window away.
    expect(surfaces(scope(null, "30d"))).toMatchObject({ homeDays: 14, homeRuns: fortnight });
    expect(surfaces(scope(null, "90d"))).toMatchObject({ homeDays: 14, homeRuns: fortnight });
  });
});

describe("Incident Responder, last 24 hours", () => {
  const before = counts(surfaces(scope(null, "7d")));
  const after = surfaces(scope(IR, "24h"));

  it("changes the four verified surfaces: executions, reviews, leaderboard, home run total", () => {
    const day = DEMO_SEED_NOW - 24 * HOUR;
    expect(before).toMatchObject({
      executions: runsSince(null, DEMO_SEED_NOW - 7 * 24 * HOUR),
      reviews: 6,
      leaderboard: LEADERBOARD.length,
      homeRuns: DAILY.slice(-7).reduce((sum, d) => sum + d.executions, 0),
    });
    expect(counts(after)).toMatchObject({
      executions: runsSince(IR, day),
      reviews: 1,
      leaderboard: 1,
      // Mission Control has no persona: the window alone, in whole days.
      homeRuns: runsOfDaysSince(day),
    });
    expect(after.executions.length).toBeGreaterThan(0);
    expect(after.executions.length).toBeLessThan(before.executions as number);
  });

  it("narrows every other scoped surface too", () => {
    expect(before).toMatchObject({ events: 22, slaTargets: 5, slaBreaches: 4, patterns: 8, memories: 20, threads: 20 });
    // Incident Responder's breaches that overlap the last 24 hours (the SLA engine dates them from the log).
    const irBreaches = MOCK_SLA_BREACHES.filter(
      (b) => b.persona === IR_NAME && (b.resolvedAt === null || Date.parse(b.resolvedAt) >= DEMO_SEED_NOW - 24 * HOUR),
    ).length;
    expect(counts(after)).toMatchObject({ events: 8, slaTargets: 1, slaBreaches: irBreaches, patterns: 2, memories: 4, threads: 4 });
  });

  it("keeps only that persona's rows", () => {
    expect(after.executions.every((r) => r.personaId === IR)).toBe(true);
    expect(after.reviews.every((r) => r.personaId === IR)).toBe(true);
    expect(after.events.every((r) => r.targetPersonaId === IR)).toBe(true);
    expect(after.leaderboard.map((r) => r.id)).toEqual([IR]);
    expect(after.slaTargets.every((r) => r.persona === IR_NAME)).toBe(true);
    expect(after.patterns.every((r) => r.personaName === IR_NAME)).toBe(true);
    expect(after.memories.every((r) => r.persona === IR_NAME)).toBe(true);
    expect(after.threads.every((r) => r.persona === IR_NAME)).toBe(true);
  });

  it("is persona-only where rows have no time: the window alone changes nothing there", () => {
    const wide = surfaces(scope(IR, "90d"));
    expect(wide.leaderboard).toEqual(after.leaderboard);
    expect(wide.slaTargets).toEqual(after.slaTargets);
    expect(wide.memories).toEqual(after.memories);
    // ...and the window alone narrows the timed lists.
    const day = DEMO_SEED_NOW - 24 * HOUR;
    expect(counts(surfaces(scope(null, "24h")))).toMatchObject({ executions: runsSince(null, day), homeRuns: runsOfDaysSince(day) });
  });
});

describe("going back", () => {
  it("All personas + 7 days restores the exact prior rows and run total", () => {
    const first = surfaces(scope(null, "7d"));
    surfaces(scope(IR, "24h"));
    expect(surfaces(scope(null, "7d"))).toEqual(first);
  });
});

describe("a scope that matches nothing", () => {
  it("empties a list that has rows, which the views read as 'nothing in this window'", () => {
    // Every crew persona ran today (the world's log), so the empty slice is a
    // window before the log begins: Security Scanner, one day two months back.
    const old = new Date(DEMO_SEED_NOW - 60 * 24 * HOUR).toISOString().slice(0, 10);
    const s: Scope = {
      filter: resolveScopeFilter({ personaId: "p-0004-mock", dateRange: "custom", customStart: old, customEnd: old }, MOCK_PERSONAS),
      now: DEMO_SEED_NOW,
    };
    expect(scopeExecutions(EXECUTIONS, s)).toEqual([]);
    expect(scopeHidAll(EXECUTIONS, scopeExecutions(EXECUTIONS, s))).toBe(true);
  });
});

describe("a deep link outranks the scope", () => {
  it("keeps a ?focus= SLA breach the scope would hide", () => {
    const outside = MOCK_SLA_BREACHES.find((b) => b.persona !== IR_NAME)!;
    const s = scope(IR, "24h");
    const breaches = (focus: string | null) =>
      scopeSla({ targets: MOCK_SLA_TARGETS, breaches: MOCK_SLA_BREACHES }, s, focus).breaches.map((b) => b.id);
    expect(breaches(null)).not.toContain(outside.id);
    expect(breaches(outside.id)).toContain(outside.id);
  });
});

describe("resolveScopeFilter (the same in real mode)", () => {
  it("joins the persona's name for name-keyed rows", () => {
    expect(resolveScopeFilter({ personaId: IR, dateRange: "7d" }, MOCK_PERSONAS).personaName).toBe(IR_NAME);
  });

  it("reads a remembered persona the loaded roster lacks as all personas, as the bar shows it", () => {
    expect(resolveScopeFilter({ personaId: "p-gone", dateRange: "7d" }, MOCK_PERSONAS).personaId).toBeNull();
  });

  it("keeps the id while the roster has not loaded", () => {
    expect(resolveScopeFilter({ personaId: "p-real", dateRange: "7d" }, []).personaId).toBe("p-real");
  });
});
