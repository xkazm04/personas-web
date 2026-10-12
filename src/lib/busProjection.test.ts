import { describe, expect, it } from "vitest";
import { MOCK_EVENTS } from "./mockData";
import { BUS_WINDOW_MS, busTopology, throughput, unseenEvents } from "./busProjection";
import type { PersonaEvent } from "./types";

function ev(id: string, sourceType: string, ageMs: number, now: number, status: PersonaEvent["status"] = "processed"): PersonaEvent {
  return {
    id,
    projectId: "p",
    eventType: "t",
    sourceType,
    sourceId: null,
    targetPersonaId: null,
    payload: null,
    status,
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(now - ageMs).toISOString(),
    retryCount: 0,
  };
}

describe("busTopology", () => {
  const now = Date.now();

  it("has one node per distinct sourceType in the window (the demo log has 10)", () => {
    const nodes = busTopology(MOCK_EVENTS, now);
    const distinct = new Set(MOCK_EVENTS.map((e) => e.sourceType));
    expect(distinct.size).toBe(10);
    expect(new Set(nodes.map((n) => n.id))).toEqual(distinct);
    expect(nodes).toHaveLength(10);
  });

  it("includes sources the old fixtures never drew (gitlab, jira, stripe, pagerduty, dependabot)", () => {
    const ids = busTopology(MOCK_EVENTS, now).map((n) => n.id);
    for (const id of ["gitlab", "jira", "stripe", "pagerduty", "dependabot"]) expect(ids).toContain(id);
    expect(ids).not.toContain("api");
  });

  it("drops sources whose events are all outside the window", () => {
    const events = [ev("a", "github", 1_000, now), ev("b", "jira", BUS_WINDOW_MS + 60_000, now)];
    expect(busTopology(events, now).map((n) => n.id)).toEqual(["github"]);
  });

  it("is an empty ring for an empty log, not invented sources", () => {
    expect(busTopology([], now)).toEqual([]);
  });

  it("counts dead letters per source and orders busiest first", () => {
    const events = [
      ev("1", "gitlab", 10, now, "dead_letter"),
      ev("2", "github", 10, now),
      ev("3", "github", 20, now),
    ];
    const nodes = busTopology(events, now);
    expect(nodes.map((n) => n.id)).toEqual(["github", "gitlab"]);
    expect(nodes[0].volume).toBe(1);
    expect(nodes[1]).toMatchObject({ count: 1, deadLetters: 1, volume: 0.5 });
  });
});

describe("throughput", () => {
  const now = Date.now();
  it("measures arrivals in the last minute, the buffer size and the source count", () => {
    const events = [ev("1", "github", 5_000, now), ev("2", "slack", 30_000, now), ev("3", "slack", 120_000, now)];
    expect(throughput(events, now)).toEqual({ perMinute: 2, total: 3, sources: 2 });
  });
  it("is all zero for an empty log", () => {
    expect(throughput([], now)).toEqual({ perMinute: 0, total: 0, sources: 0 });
  });
});

describe("unseenEvents", () => {
  it("returns only events whose id has not been drawn", () => {
    const now = Date.now();
    const events = [ev("1", "github", 1, now), ev("2", "github", 1, now)];
    expect(unseenEvents(events, new Set(["1"])).map((e) => e.id)).toEqual(["2"]);
  });
});
