import { describe, it, expect } from "vitest";
import { GENOME_NODES } from "./data";
import type { GenomeNode } from "./types";
import { bestLineage, genomeSummary, nodeTone, bestNode } from "./genome";

const node = (
  id: string,
  gen: number,
  fitness: number,
  parent: string | null,
  extra: Partial<GenomeNode> = {},
): GenomeNode => ({ id, gen, x: 0.5, fitness, parent, alive: true, best: false, ...extra });

describe("genome best lineage", () => {
  it("is the parent chain of the best node, root last-in-order", () => {
    expect([...bestLineage(GENOME_NODES)]).toEqual(["g5a", "g4a", "g3a", "g2a", "g1a", "g0"]);
  });

  it("excludes a high-fitness sibling branch that is not an ancestor (g4b, 85, alive)", () => {
    const lineage = bestLineage(GENOME_NODES);
    expect(lineage.has("g4b")).toBe(false);
    expect(lineage.has("g3b")).toBe(false);
  });

  it("includes low-fitness ancestors the old heuristic painted grey (g1a 68, g2a 74)", () => {
    const lineage = bestLineage(GENOME_NODES);
    expect(lineage.has("g1a")).toBe(true);
    expect(lineage.has("g2a")).toBe(true);
  });

  it("falls back to the fittest alive node when none is flagged best", () => {
    const nodes = [node("r", 0, 50, null), node("a", 1, 70, "r"), node("b", 1, 90, "r", { alive: false })];
    expect(bestNode(nodes)?.id).toBe("a");
    expect([...bestLineage(nodes)]).toEqual(["a", "r"]);
  });

  it("terminates on a parent cycle and on a dangling parent", () => {
    const cyclic = [node("a", 1, 80, "b", { best: true }), node("b", 0, 60, "a")];
    expect([...bestLineage(cyclic)]).toEqual(["a", "b"]);
    const dangling = [node("a", 1, 80, "missing", { best: true })];
    expect([...bestLineage(dangling)]).toEqual(["a"]);
  });

  it("is empty for an empty population", () => {
    expect(bestLineage([]).size).toBe(0);
    expect(genomeSummary([])).toEqual({ generation: 0, best: 0, lineageGainPct: 0 });
  });
});

describe("genome header summary", () => {
  it("derives Gen / Best / Lineage gain from the nodes", () => {
    // 94 vs the lineage root's 62 -> +51.6% -> 52.
    expect(genomeSummary(GENOME_NODES)).toEqual({ generation: 5, best: 94, lineageGainPct: 52 });
  });

  it("tracks the data: a new best changes every header figure", () => {
    const nodes = [node("r", 0, 40, null), node("a", 1, 50, "r"), node("b", 2, 60, "a", { best: true })];
    expect(genomeSummary(nodes)).toEqual({ generation: 2, best: 60, lineageGainPct: 50 });
  });
});

describe("genome node tone (legend <-> node colour)", () => {
  it("every node maps to exactly one legend entry", () => {
    const lineage = bestLineage(GENOME_NODES);
    const tones = Object.fromEntries(GENOME_NODES.map((n) => [n.id, nodeTone(n, lineage)]));
    expect(tones).toEqual({
      g0: "lineage",
      g1a: "lineage",
      g1b: "culled",
      g2a: "lineage",
      g2b: "culled",
      g3a: "lineage",
      g3b: "alive",
      g4a: "lineage",
      g4b: "alive",
      g5a: "lineage",
    });
  });
});
