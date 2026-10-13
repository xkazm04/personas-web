import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isLaneShaped } from "../../scripts/check-ai-change.mjs";
import {
  HARD_REWORK_BUDGET,
  REWORK_BUDGET,
  hardBlocks,
  laneOf,
  reworkReport,
} from "../../scripts/report-agent-rework.mjs";

/**
 * Pins the blocking half of the rework budget and the lane-shape fallback.
 *
 * The FLAG band (agentReworkBudget.test.ts) annotates and stays green. The hard
 * band in scripts/report-agent-rework.mjs fails a PR, so this spec holds it to
 * two promises: it sits well past the FLAG band, and it only stops a range that
 * adds commits to the lane over it. .github/workflows/agent-rework-hard-band.yml
 * is the wiring, pinned below.
 *
 * isLaneShaped (scripts/check-ai-change.mjs) names a lane commit that lost its
 * trailer: the AI change gate reports it, and the meter keeps it out of the
 * human baseline instead of counting lane work as a person's.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW = fs.readFileSync(path.join(ROOT, ".github", "workflows", "agent-rework-hard-band.yml"), "utf8");
const METER = fs.readFileSync(path.join(ROOT, "scripts", "report-agent-rework.mjs"), "utf8");
const lane = (id: string) => `\n\nAscent-Resolves: ${id}`;
const row = (name: string, commits: number, reworked: number) => ({ lane: name, commits, reworked, rate: reworked / commits });

describe("HARD_REWORK_BUDGET", () => {
  it("sits past the FLAG band on every axis", () => {
    expect(HARD_REWORK_BUDGET.maxRate).toBeGreaterThan(REWORK_BUDGET.maxRate);
    expect(HARD_REWORK_BUDGET.overHuman).toBeGreaterThan(REWORK_BUDGET.overHuman);
    expect(HARD_REWORK_BUDGET.minCommits).toBeGreaterThan(REWORK_BUDGET.minCommits);
  });
});

describe("hardBlocks", () => {
  it("blocks a lane over the hard ceiling when the range adds to it", () => {
    const blocks = hardBlocks([row("ascent", 20, 11), row("human", 40, 4)], ["ascent", "human"]);
    expect(blocks.map((b) => b.lane)).toEqual(["ascent"]);
    expect(blocks[0].reason).toContain("50.0%");
  });

  it("leaves a lane over the hard ceiling alone when the range has none of its commits", () => {
    expect(hardBlocks([row("ascent", 20, 11), row("human", 40, 4)], ["human"])).toEqual([]);
  });

  it("does not block a lane that only trips the FLAG band", () => {
    expect(hardBlocks([row("ascent", 40, 12), row("human", 40, 4)], ["ascent"])).toEqual([]);
  });

  it("does not judge a lane on fewer commits than the hard band needs", () => {
    expect(hardBlocks([row("ascent", HARD_REWORK_BUDGET.minCommits - 1, 15)], ["ascent"])).toEqual([]);
  });

  it("blocks a lane too far over a large human baseline", () => {
    const blocks = hardBlocks([row("agent-other", 20, 9), row("human", 40, 4)], ["agent-other"]);
    expect(blocks.map((b) => b.lane)).toEqual(["agent-other"]);
  });

  it("never blocks the human row", () => {
    expect(hardBlocks([row("human", 40, 30)], ["human"])).toEqual([]);
  });
});

describe("isLaneShaped", () => {
  it("reads the lane runner's subjects", () => {
    expect(isLaneShaped("fix: Added sharded full-suite PR workflow with 8-minute budget")).toBe(true);
    expect(isLaneShaped("fix: Unified migration runners into scripts/apply-sql-migration.mjs\n\nbody")).toBe(true);
    expect(isLaneShaped("chore: add legible, attributable history starter (via Ascent)")).toBe(true);
  });

  it("does not read a person's imperative subject as a lane's", () => {
    expect(isLaneShaped("fix: add missing alt text")).toBe(false);
    expect(isLaneShaped("feat: Added a page")).toBe(false);
    expect(isLaneShaped("docs: note the Ascent lane")).toBe(false);
    expect(isLaneShaped("fix: typo")).toBe(false);
  });
});

describe("laneOf with a dropped trailer", () => {
  it("counts a lane-shaped commit without a trailer as lane-untrailered, not human", () => {
    expect(laneOf("fix: Added gate", [])).toBe("lane-untrailered");
    expect(laneOf("fix: Added gate" + lane("abc"), [])).toBe("ascent");
    expect(laneOf("fix: typo", [])).toBe("human");
  });

  it("keeps lane-untrailered commits out of the human baseline", () => {
    const { rows } = reworkReport([
      { sha: "l1", message: "fix: Added gate", files: ["scripts/x.mjs"] },
      { sha: "h1", message: "feat: page", files: ["src/page.tsx"] },
    ]);
    expect(rows.find((r) => r.lane === "human")).toMatchObject({ commits: 1 });
    expect(rows.find((r) => r.lane === "lane-untrailered")).toMatchObject({ commits: 1 });
  });
});

describe("agent-rework-hard-band workflow", () => {
  it("runs on pull requests to master over the full history", () => {
    expect(WORKFLOW).toMatch(/^on:\s*\r?\n\s+pull_request:\s*\r?\n\s+branches: \[master\]/m);
    expect(WORKFLOW).toContain("fetch-depth: 0");
  });

  it("names the PR's own commits as the range the hard band blocks", () => {
    expect(WORKFLOW).toContain('node scripts/report-agent-rework.mjs --block-in "origin/${BASE_REF}..HEAD"');
  });

  it("annotates the BLOCK prefix the script prints and keeps its exit status", () => {
    expect(METER).toContain("console.log(`  BLOCK ${b.lane}:");
    expect(WORKFLOW).toContain("grep '^  BLOCK '");
    expect(WORKFLOW).toContain('exit "$status"');
  });
});
