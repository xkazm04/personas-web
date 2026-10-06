import { describe, it, expect } from "vitest";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";
import { rankByComposite, defaultDirFor, sortPersonas } from "./leaderboardSort";

const p = (id: string, name: string, composite: number, delta = 0) =>
  ({ id, name, composite, delta }) as unknown as LeaderboardPersona;

describe("rankByComposite", () => {
  it("ranks by composite desc, breaking ties by name (stable badge numbers)", () => {
    const ranks = rankByComposite([p("a", "Bravo", 90), p("b", "Alpha", 90), p("c", "Cara", 95)]);
    expect(ranks.get("c")).toBe(1); // highest composite
    expect(ranks.get("b")).toBe(2); // tie at 90 → "Alpha" before "Bravo"
    expect(ranks.get("a")).toBe(3);
  });

  it("does not mutate the input array", () => {
    const input = [p("a", "A", 1), p("b", "B", 2)];
    const snapshot = input.map((x) => x.id);
    rankByComposite(input);
    expect(input.map((x) => x.id)).toEqual(snapshot);
  });
});

describe("defaultDirFor", () => {
  it("name defaults ascending, numeric columns descending", () => {
    expect(defaultDirFor("name")).toBe("asc");
    expect(defaultDirFor("composite")).toBe("desc");
    expect(defaultDirFor("delta")).toBe("desc");
  });
});

describe("sortPersonas", () => {
  it("sorts a numeric field with name as the deterministic tiebreaker", () => {
    const asc = sortPersonas([p("a", "Bravo", 90), p("b", "Alpha", 90), p("c", "Cara", 80)], "composite", "asc");
    expect(asc.map((x) => x.id)).toEqual(["c", "b", "a"]); // 80, then 90 tie Alpha<Bravo
    const desc = sortPersonas([p("a", "Bravo", 90), p("b", "Alpha", 90), p("c", "Cara", 80)], "composite", "desc");
    expect(desc.map((x) => x.id)).toEqual(["b", "a", "c"]); // 90 tie Alpha<Bravo, then 80
  });

  it("sorts the name column alphabetically and is symmetric under dir flip", () => {
    const asc = sortPersonas([p("a", "Cara", 1), p("b", "Alpha", 2)], "name", "asc").map((x) => x.name);
    expect(asc).toEqual(["Alpha", "Cara"]);
    const desc = sortPersonas([p("a", "Cara", 1), p("b", "Alpha", 2)], "name", "desc").map((x) => x.name);
    expect(desc).toEqual(["Cara", "Alpha"]);
  });
});
