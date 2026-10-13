import { describe, it, expect } from "vitest";
import { COST_REVIEW, costFlags, costOf, costReport } from "../../scripts/report-lane-cost.mjs";

/**
 * Pins the lane-cost report in scripts/report-lane-cost.mjs: how a commit's
 * spend trailers are read, and how spend becomes a cost per surviving change.
 * Lanes and rework come from report-agent-rework.mjs (pinned by
 * agentRework.test.ts), so these cases only build histories whose rework is
 * unambiguous: a second commit resolving the same Ascent id on the same file.
 */

const CLAUDE = "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";
const lane = (id: string) => `\n\nAscent-Resolves: ${id}`;
const spend = (tokens: number, seconds?: number) =>
  `\nAscent-Tokens: ${tokens}` + (seconds === undefined ? "" : `\nAscent-Wall-Clock: ${seconds}`);

const commit = (sha: string, message: string, files: string[]) => ({ sha, message, files });

describe("costOf", () => {
  it("reads both spend trailers", () => {
    expect(costOf("fix: Added x" + lane("a") + spend(412000, 540))).toEqual({ tokens: 412000, seconds: 540 });
  });

  it("accepts a seconds suffix on the wall-clock trailer", () => {
    expect(costOf("fix: Added x\n\nAscent-Tokens: 10\nAscent-Wall-Clock: 90s").seconds).toBe(90);
  });

  it("answers null, never 0, for a missing or malformed trailer", () => {
    expect(costOf("fix: Added x" + lane("a"))).toEqual({ tokens: null, seconds: null });
    expect(costOf("fix: Added x\n\nAscent-Tokens: lots")).toEqual({ tokens: null, seconds: null });
    expect(costOf("fix: Added x\n\nAscent-Tokens: 0").tokens).toBe(0);
  });

  it("does not read a trailer name quoted mid-line", () => {
    expect(costOf("docs: explain the Ascent-Tokens: 5 trailer").tokens).toBeNull();
  });
});

describe("costReport", () => {
  const history = [
    commit("c1", "fix: Added x" + lane("a") + spend(1000, 60), ["src/x.ts"]),
    commit("c2", "fix: Added x again" + lane("a") + spend(3000, 120), ["src/x.ts"]),
    commit("c3", "fix: Added y" + lane("b"), ["src/y.ts"]),
    commit("c4", "docs: z", ["docs/z.md"]),
    commit("c5", "chore: tidy" + spend(500) + CLAUDE, ["src/w.ts"]),
  ];

  it("charges reworked spend to the changes that survived, per agent lane", () => {
    expect(costReport(history)).toEqual([
      {
        lane: "ascent",
        commits: 3,
        costed: 2,
        survivors: 1,
        tokens: 4000,
        seconds: 180,
        tokensPerSurvivor: 4000,
        secondsPerSurvivor: 180,
      },
      {
        lane: "agent-other",
        commits: 1,
        costed: 1,
        survivors: 1,
        tokens: 500,
        seconds: 0,
        tokensPerSurvivor: 500,
        secondsPerSurvivor: 0,
      },
    ]);
  });

  it("leaves human commits out: they carry no spend to compare", () => {
    expect(costReport(history).map((r) => r.lane)).not.toContain("human");
  });

  it("reports a lane without trailers as unmeasured, not free", () => {
    expect(costReport([history[2]])).toEqual([
      {
        lane: "ascent",
        commits: 1,
        costed: 0,
        survivors: 0,
        tokens: 0,
        seconds: 0,
        tokensPerSurvivor: null,
        secondsPerSurvivor: null,
      },
    ]);
  });
});

describe("costFlags", () => {
  it("judges no lane on fewer costed commits than the review line asks for", () => {
    expect(COST_REVIEW.minCosted).toBeGreaterThan(1);
    expect(costFlags([{ lane: "ascent", costed: 1, tokensPerSurvivor: COST_REVIEW.tokensPerSurvivor * 10 }])).toEqual(
      [],
    );
  });

  it("flags a lane whose surviving change costs more than the line", () => {
    const rows = [
      { lane: "ascent", costed: 10, tokensPerSurvivor: COST_REVIEW.tokensPerSurvivor + 1 },
      { lane: "agent-other", costed: 10, tokensPerSurvivor: COST_REVIEW.tokensPerSurvivor },
    ];
    expect(costFlags(rows).map((f) => f.lane)).toEqual(["ascent"]);
  });

  it("flags a lane where nothing it paid for survived", () => {
    expect(costFlags([{ lane: "ascent", costed: 10, tokensPerSurvivor: null }]).map((f) => f.lane)).toEqual([
      "ascent",
    ]);
  });

  it("takes an override for a measured line", () => {
    const flagged = costFlags(costReport([
      commit("c1", "fix: Added x" + lane("a") + spend(1000, 60), ["src/x.ts"]),
      commit("c2", "fix: Added x again" + lane("a") + spend(3000, 120), ["src/x.ts"]),
      commit("c5", "chore: tidy" + spend(500) + CLAUDE, ["src/w.ts"]),
    ]), { tokensPerSurvivor: 1000, minCosted: 1 });
    expect(flagged.map((f) => f.lane)).toEqual(["ascent"]);
  });
});
