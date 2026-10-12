import { describe, it, expect } from "vitest";
import { budgetFlags, REWORK_BUDGET } from "../../scripts/report-agent-rework.mjs";

/**
 * Pins the rework budget in scripts/report-agent-rework.mjs: which lanes get a
 * FLAG line. The meter itself is pinned by agentRework.test.ts.
 */

const row = (lane: string, commits: number, reworked: number) => ({
  lane,
  commits,
  reworked,
  rate: commits ? reworked / commits : 0,
});

describe("budgetFlags", () => {
  it("leaves a lane under both limits alone", () => {
    expect(budgetFlags([row("ascent", 40, 4), row("human", 40, 2)])).toEqual([]);
  });

  it("flags a lane over the absolute ceiling", () => {
    const flags = budgetFlags([row("ascent", 20, 6), row("human", 5, 2)]);
    expect(flags.map((f) => f.lane)).toEqual(["ascent"]);
    expect(flags[0]?.reason).toMatch(/over the 25\.0% ceiling/);
  });

  it("flags a lane well above the human baseline", () => {
    const flags = budgetFlags([row("skill:native-copy", 20, 4), row("human", 50, 2)]);
    expect(flags.map((f) => f.lane)).toEqual(["skill:native-copy"]);
    expect(flags[0]?.reason).toMatch(/over the human 4\.0%/);
  });

  it("ignores a small human sample as a baseline", () => {
    expect(budgetFlags([row("ascent", 20, 4), row("human", 3, 0)])).toEqual([]);
  });

  it("never judges a lane on fewer than minCommits commits, nor the human row", () => {
    expect(budgetFlags([row("agent-other", REWORK_BUDGET.minCommits - 1, 5), row("human", 30, 15)])).toEqual([]);
  });

  it("takes overrides for each limit", () => {
    expect(budgetFlags([row("ascent", 4, 1)], { minCommits: 2, maxRate: 0.2 }).map((f) => f.lane)).toEqual(["ascent"]);
  });
});
