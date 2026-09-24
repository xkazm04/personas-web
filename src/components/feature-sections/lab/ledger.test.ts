import { describe, it, expect } from "vitest";
import { ARENA_ROUNDS, CHAT_SCRIPT, TABS } from "./data";
import {
  initialLedger,
  activate,
  setBaseline,
  deltaVsBaseline,
  isRegression,
  arenaContenders,
  ledgerReducer,
  REFINED_VERSION,
  type LedgerState,
} from "./ledger";

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const productionCount = (s: LedgerState) =>
  s.rows.filter((r) => r.status === "production").length;

describe("lab version ledger", () => {
  it("initialLedger: v4.2 live, v4.3 experimental, ratings are the arena means", () => {
    const s = initialLedger();
    expect(s.rows.map((r) => r.id)).toEqual(["v4.2", "v4.3"]);
    const prod = s.rows.filter((r) => r.status === "production");
    expect(prod.map((r) => r.id)).toEqual(["v4.2"]);
    expect(s.liveId).toBe("v4.2");
    const byId = Object.fromEntries(s.rows.map((r) => [r.id, r.rating]));
    expect(byId["v4.2"]).toBe(Math.round(mean(ARENA_ROUNDS.map((r) => r.scoreA))));
    expect(byId["v4.3"]).toBe(Math.round(mean(ARENA_ROUNDS.map((r) => r.scoreB))));
    expect(byId["v4.2"]).toBe(88);
    expect(byId["v4.3"]).toBe(85);
  });

  it("activate moves the single production tag to the chosen version", () => {
    const s = activate(initialLedger(), "v4.3");
    expect(s.liveId).toBe("v4.3");
    expect(s.rows.find((r) => r.id === "v4.2")?.status).not.toBe("production");
    expect(productionCount(s)).toBe(1);
  });

  it("every activate() sequence of length <= 3 leaves exactly one production row", () => {
    const ids = ["v4.2", "v4.3", "nope"];
    const sequences: string[][] = [[]];
    for (let len = 1; len <= 3; len++) {
      const prev = sequences.filter((q) => q.length === len - 1);
      for (const q of prev) for (const id of ids) sequences.push([...q, id]);
    }
    expect(sequences.length).toBe(1 + 3 + 9 + 27);
    for (const seq of sequences) {
      const s = seq.reduce(activate, initialLedger());
      expect(productionCount(s)).toBe(1);
      expect(s.rows.find((r) => r.status === "production")?.id).toBe(s.liveId);
    }
  });

  it("re-activating the previous version rolls a promotion back exactly", () => {
    const initial = initialLedger();
    const back = activate(activate(initial, "v4.3"), "v4.2");
    expect(back.rows).toEqual(initial.rows);
    expect(back.liveId).toBe(initial.liveId);
  });

  it("activating the live version or an unknown id is a same-reference no-op", () => {
    const s = initialLedger();
    expect(activate(s, s.liveId)).toBe(s);
    expect(activate(s, "nope")).toBe(s);
    expect(ledgerReducer(s, { type: "activate", id: s.liveId })).toBe(s);
  });

  it("delta vs baseline, and a drop of 5 or more is a regression", () => {
    const s = setBaseline(initialLedger(), "v4.2");
    expect(s.baselineId).toBe("v4.2");
    expect(deltaVsBaseline(s, "v4.3")).toBe(-3);
    expect(deltaVsBaseline(s, "v4.2")).toBeNull();
    expect(isRegression(-3)).toBe(false);
    expect(isRegression(-4)).toBe(false);
    expect(isRegression(-5)).toBe(true);
    expect(isRegression(null)).toBe(false);
    const flipped = setBaseline(s, "v4.3");
    expect(deltaVsBaseline(flipped, "v4.2")).toBe(3);
    expect(deltaVsBaseline(flipped, "v4.3")).toBeNull();
    expect(setBaseline(flipped, "nope")).toBe(flipped);
  });

  it("arena contenders come from the ledger, and never disagree with the rail", () => {
    expect(arenaContenders(initialLedger())).toEqual({ A: "v4.2", B: "v4.3" });
    const states = [
      initialLedger(),
      activate(initialLedger(), "v4.3"),
      setBaseline(activate(initialLedger(), "v4.3"), "v4.3"),
    ];
    for (const s of states) {
      const c = arenaContenders(s);
      const rating = (id: string) => s.rows.find((r) => r.id === id)?.rating;
      expect(rating(c.A)).toBe(Math.round(mean(ARENA_ROUNDS.map((r) => r.scoreA))));
      expect(rating(c.B)).toBe(Math.round(mean(ARENA_ROUNDS.map((r) => r.scoreB))));
    }
  });

  it("the chat refinement's candidate is a ledger row that starts experimental", () => {
    const row = initialLedger().rows.find((r) => r.id === REFINED_VERSION);
    expect(row?.status).toBe("experimental");
  });
});

describe("lab guards (tour + fixtures)", () => {
  it("tab keys stay in tour order", () => {
    expect(TABS.map((t) => t.key)).toEqual(["chat", "arena", "evolution", "eval"]);
  });

  it("the chat and arena fixtures are unchanged in size", () => {
    expect(CHAT_SCRIPT).toHaveLength(7);
    expect(ARENA_ROUNDS).toHaveLength(5);
  });
});
