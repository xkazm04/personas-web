import { describe, expect, it, vi } from "vitest";
import {
  FLEET,
  MOCK_DIRECTOR_PORTFOLIO,
  MOCK_DIRECTOR_VERDICTS,
  MOCK_MEMORIES,
} from "./mock-dashboard-data";
import { MOCK_EVENTS, MOCK_PERSONAS, MOCK_SUBSCRIPTIONS } from "./mockData";
import { DEMO_CREW, crewAgentId, crewPersonaId, hueOf } from "./demoCrew";
import { FLEET as STAGE_FLEET } from "@/components/dashboard/fleet-monitor/fleet-data";

// The demo dashboard tells ONE story. These cases hold fixtures that other
// pages cross-read to that story, so no two screens can contradict each other.

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
