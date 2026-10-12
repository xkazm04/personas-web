import { describe, expect, it } from "vitest";
import { correlate, demoSignals, type Signal } from "./incidentCorrelate";

const HOUR = 3_600_000;
const WINDOW = 90 * 60_000;

const incidents = () => correlate(demoSignals(), { windowMs: WINDOW });
const ids = (inc: { members: Signal[] }) => inc.members.map((m) => m.id).sort();

describe("correlate over the demo fixtures", () => {
  it("collapses the Slack outage into one incident, including both authored duplicates' source", () => {
    const slack = incidents().find((i) => i.members.some((m) => m.id === "br_1"));
    expect(ids(slack!)).toEqual(["br_1", "hi_2", "in_slack", "inc_1"]);
    expect(slack!.severity).toBe("critical");
    expect(slack!.status).toBe("escalated");
    expect(slack!.resolvedAt).toBeNull();
  });

  it("attaches inc_2 to the Security latency thread (timeout and performance fold into latency)", () => {
    const sec = incidents().find((i) => i.members.some((m) => m.id === "br_2"));
    expect(ids(sec!)).toEqual(["br_2", "hi_5", "inc_2"]);
    expect(sec!.status).toBe("open");
  });

  it("does NOT merge br_3 (success rate) with inc_3 (memory): categories differ", () => {
    const all = incidents();
    const br3 = all.find((i) => i.members.some((m) => m.id === "br_3"))!;
    expect(br3.members.some((m) => m.id === "inc_3")).toBe(false);
    // Without the category guard they would merge (same persona, one hour apart).
    const loose = correlate(demoSignals(), { windowMs: WINDOW, sameCategory: false });
    const merged = loose.find((i) => i.members.some((m) => m.id === "br_3"))!;
    expect(merged.members.some((m) => m.id === "inc_3")).toBe(true);
  });

  it("keeps inc_4 standalone and resolved", () => {
    const inc4 = incidents().find((i) => i.members.some((m) => m.id === "inc_4"))!;
    expect(ids(inc4)).toEqual(["inc_4"]);
    expect(inc4.status).toBe("resolved");
    expect(inc4.resolvedAt).not.toBeNull();
  });

  it("lists every signal in exactly one incident, except unattached standing checks", () => {
    const seen = incidents().flatMap((i) => i.members.map((m) => m.id));
    expect(new Set(seen).size).toBe(seen.length);
    const timedIds = demoSignals().filter((s) => s.detectedAt !== null).map((s) => s.id);
    for (const id of timedIds) expect(seen).toContain(id);
  });

  it("never merges across personas", () => {
    for (const inc of incidents()) {
      const personas = new Set(inc.members.map((m) => m.persona).filter((p) => p !== null));
      expect(personas.size, inc.id).toBeLessThanOrEqual(1);
    }
  });
});

describe("correlate window and aggregation", () => {
  const base = Date.parse("2026-01-01T00:00:00Z");
  const sig = (id: string, offsetMs: number, over: Partial<Signal> = {}): Signal => ({
    id,
    kind: "healthIssue",
    persona: "P",
    category: "latency",
    detectedAt: new Date(base + offsetMs).toISOString(),
    resolvedAt: null,
    severity: "low",
    status: "resolved",
    ...over,
  });

  it("chains signals within the window and splits beyond it", () => {
    const out = correlate([sig("a", 0), sig("b", HOUR), sig("c", 2 * HOUR), sig("d", 10 * HOUR)], {
      windowMs: HOUR,
    });
    expect(out.map(ids)).toEqual([["a", "b", "c"], ["d"]]);
  });

  it("takes max severity, earliest detection and latest resolution", () => {
    const [inc] = correlate(
      [
        sig("a", 0, { severity: "low", resolvedAt: new Date(base + HOUR).toISOString() }),
        sig("b", 1000, { severity: "high", resolvedAt: new Date(base + 2 * HOUR).toISOString() }),
      ],
      { windowMs: HOUR },
    );
    expect(inc.severity).toBe("high");
    expect(inc.detectedAt).toBe(new Date(base).toISOString());
    expect(inc.resolvedAt).toBe(new Date(base + 2 * HOUR).toISOString());
  });

  it("is open while any member is open, and persona-less signals never merge", () => {
    const [inc] = correlate([sig("a", 0), sig("b", 1000, { status: "open" })], { windowMs: HOUR });
    expect(inc.status).toBe("open");
    expect(inc.resolvedAt).toBeNull();
    const infra = correlate([sig("x", 0, { persona: null }), sig("y", 1000, { persona: null })], {
      windowMs: HOUR,
    });
    expect(infra).toHaveLength(2);
  });
});
