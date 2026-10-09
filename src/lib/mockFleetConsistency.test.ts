import { describe, expect, it, vi } from "vitest";
import {
  FLEET,
  MOCK_DIRECTOR_PORTFOLIO,
  MOCK_DIRECTOR_VERDICTS,
  MOCK_MEMORIES,
} from "./mock-dashboard-data";
import { MOCK_EVENTS, MOCK_SUBSCRIPTIONS } from "./mockData";

// The demo dashboard tells ONE story. These cases hold fixtures that other
// pages cross-read to that story, so no two screens can contradict each other.

const fleetById = new Map(FLEET.map((m) => [m.id, m]));

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
