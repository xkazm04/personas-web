import { describe, it, expect } from "vitest";
import { ARENA_ROUNDS, EVAL_DIMENSIONS, GENOME_NODES } from "./data";
import {
  DIMENSIONS,
  EVAL_BASELINE_NODE,
  EXPERIMENT_VERSIONS,
  INPUTS,
  LEDGER_NODE,
  dimensionScore,
  evalDimensions,
  versionFitness,
} from "./experiment";
import { initialLedger } from "./ledger";

describe("lab experiment matrix", () => {
  it("is 10 versions x 5 inputs x 6 dimensions, every cell 0-100", () => {
    expect(EXPERIMENT_VERSIONS).toHaveLength(10);
    for (const v of EXPERIMENT_VERSIONS) {
      expect(v.scores).toHaveLength(INPUTS.length);
      for (const row of v.scores) {
        expect(row).toHaveLength(DIMENSIONS.length);
        for (const c of row) expect(c >= 0 && c <= 100).toBe(true);
      }
    }
  });

  it("the ledger rating of a version equals its genome node fitness", () => {
    for (const row of initialLedger().rows) {
      const node = GENOME_NODES.find((n) => n.id === LEDGER_NODE[row.id as keyof typeof LEDGER_NODE]);
      expect(node?.fitness).toBe(row.rating);
    }
  });

  it("v4.2 -> v4.3: arena mean = rail rating = genome fitness, and v4.3 still loses", () => {
    const rows = Object.fromEntries(initialLedger().rows.map((r) => [r.id, r.rating]));
    expect(rows["v4.2"]).toBe(versionFitness("g4a"));
    expect(rows["v4.3"]).toBe(versionFitness("g4b"));
    expect(rows["v4.3"]).toBeLessThan(rows["v4.2"]);
    expect(ARENA_ROUNDS.filter((r) => r.winner === "A")).toHaveLength(3);
  });

  it("the eval radar equals the live version's dimension means", () => {
    const live = LEDGER_NODE[initialLedger().liveId as keyof typeof LEDGER_NODE];
    expect(EVAL_DIMENSIONS).toEqual(evalDimensions(live, EVAL_BASELINE_NODE));
    EVAL_DIMENSIONS.forEach((d, i) => {
      expect(d.key).toBe(DIMENSIONS[i]);
      expect(d.score).toBe(dimensionScore(live, i));
    });
  });

  it("every node is a version of the same tree: parents exist, one best", () => {
    const ids = new Set(EXPERIMENT_VERSIONS.map((v) => v.id));
    for (const v of EXPERIMENT_VERSIONS) if (v.parent) expect(ids.has(v.parent)).toBe(true);
    expect(EXPERIMENT_VERSIONS.filter((v) => v.best)).toHaveLength(1);
    expect(GENOME_NODES.find((n) => n.best)?.fitness).toBe(94);
  });
});
