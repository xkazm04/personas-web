import { describe, expect, it } from "vitest";

import { resolveScopeFilter, scopeHidAll, type Scope } from "@/lib/dashboardScope";
import { DEMO_SEED_NOW } from "@/lib/demoClock";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  MOCK_LEADERBOARD,
  MOCK_MEMORIES,
  MOCK_MESSAGE_THREADS,
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
} from "@/lib/mock-dashboard-data";
import { MOCK_DAILY_METRICS, MOCK_EVENTS, MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
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

function surfaces(s: Scope) {
  const sla = scopeSla({ targets: MOCK_SLA_TARGETS, breaches: MOCK_SLA_BREACHES }, s);
  const knowledge = scopeKnowledge({ patterns: MOCK_KNOWLEDGE_PATTERNS, memories: MOCK_MEMORIES }, s);
  const daily = scopeDaily(MOCK_DAILY_METRICS, s);
  return {
    executions: scopeExecutions(MOCK_EXECUTIONS, s),
    reviews: scopeReviews(REVIEWS, s),
    events: scopeEvents(MOCK_EVENTS, s),
    leaderboard: scopeLeaderboard(MOCK_LEADERBOARD, s),
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
    expect(s.executions).toEqual(MOCK_EXECUTIONS);
    expect(s.reviews).toEqual(REVIEWS);
    expect(s.events).toEqual(MOCK_EVENTS);
    expect(s.leaderboard).toEqual(MOCK_LEADERBOARD);
    expect(s.slaTargets).toEqual(MOCK_SLA_TARGETS);
    expect(s.slaBreaches).toEqual(MOCK_SLA_BREACHES);
    expect(s.patterns).toEqual(MOCK_KNOWLEDGE_PATTERNS);
    expect(s.memories).toEqual(MOCK_MEMORIES);
    expect(s.threads).toEqual(MOCK_MESSAGE_THREADS);
  });

  it("reads Mission Control's last 7 of its 14 days, which its header now states", () => {
    expect(MOCK_DAILY_METRICS).toHaveLength(14);
    expect(surfaces(scope(null, "7d"))).toMatchObject({ homeDays: 7, homeRuns: 24 });
    // The whole fortnight (the old fixed 14-day reading) is one window away.
    expect(surfaces(scope(null, "30d"))).toMatchObject({ homeDays: 14, homeRuns: 47 });
    expect(surfaces(scope(null, "90d"))).toMatchObject({ homeDays: 14, homeRuns: 47 });
  });
});

describe("Incident Responder, last 24 hours", () => {
  const before = counts(surfaces(scope(null, "7d")));
  const after = surfaces(scope(IR, "24h"));

  it("changes the four verified surfaces: executions, reviews, leaderboard, home run total", () => {
    expect(before).toMatchObject({ executions: 12, reviews: 6, leaderboard: 5, homeRuns: 24 });
    expect(counts(after)).toMatchObject({ executions: 1, reviews: 1, leaderboard: 1, homeRuns: 2 });
  });

  it("narrows every other scoped surface too", () => {
    expect(before).toMatchObject({ events: 22, slaTargets: 5, slaBreaches: 4, patterns: 8, memories: 20, threads: 20 });
    expect(counts(after)).toMatchObject({ events: 8, slaTargets: 1, slaBreaches: 1, patterns: 2, memories: 4, threads: 4 });
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
    expect(counts(surfaces(scope(null, "24h")))).toMatchObject({ executions: 6, homeRuns: 2 });
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
    const s = scope("p-0004-mock", "24h"); // Security Scanner queued no run in the last day
    expect(scopeExecutions(MOCK_EXECUTIONS, s)).toEqual([]);
    expect(scopeHidAll(MOCK_EXECUTIONS, scopeExecutions(MOCK_EXECUTIONS, s))).toBe(true);
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
