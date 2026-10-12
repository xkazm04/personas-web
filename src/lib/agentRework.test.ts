import { describe, it, expect } from "vitest";
import {
  isReworkOf,
  laneOf,
  parseLog,
  resolvesOf,
  reworkReport,
  skillNames,
} from "../../scripts/report-agent-rework.mjs";

/**
 * Pins the rework meter in scripts/report-agent-rework.mjs: which commits are
 * agent work, which lane they belong to, and what counts as a follow-up fix.
 * Lane commits are typed `fix:` whatever they do, so an additive `fix:` must
 * not read as a repair, or every lane commit would "rework" the one before it.
 */

const CLAUDE = "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";
const lane = (id: string) => `\n\nAscent-Resolves: ${id}`;

const commit = (sha: string, message: string, files: string[]) => ({ sha, message, files });

describe("parseLog", () => {
  it("splits git's record/field separators into commits with files", () => {
    const text =
      "\x1eaaa\x1ffeat: one\n\nbody\x1f\n\nsrc/a.ts\nsrc/b.ts\n" + "\x1ebbb\x1fdocs: two\x1f\n\ndocs/x.md\n";
    expect(parseLog(text)).toEqual([
      { sha: "aaa", message: "feat: one\n\nbody", files: ["src/a.ts", "src/b.ts"] },
      { sha: "bbb", message: "docs: two", files: ["docs/x.md"] },
    ]);
  });
});

describe("laneOf", () => {
  const skills = ["native-copy", "icon-gen"];

  it("separates human, ascent, skill and other agent commits", () => {
    expect(laneOf("fix: typo", skills)).toBe("human");
    expect(laneOf("fix: Added gate" + lane("abc-1"), skills)).toBe("ascent");
    expect(laneOf("copy: tightened hero via /native-copy" + CLAUDE, skills)).toBe("skill:native-copy");
    expect(laneOf("feat: new favicon set (icon-gen skill)" + CLAUDE, skills)).toBe("skill:icon-gen");
    expect(laneOf("feat: favicons from `icon-gen`" + CLAUDE, skills)).toBe("skill:icon-gen");
    expect(laneOf("feat: something" + CLAUDE, skills)).toBe("agent-other");
  });

  it("does not match a skill name used as a plain word or inside another word", () => {
    expect(laneOf("feat: reworked /icon-generator" + CLAUDE, ["icon-gen"])).toBe("agent-other");
    expect(laneOf("feat: a perfect fit for the hero" + CLAUDE, ["perfect"])).toBe("agent-other");
  });
});

describe("resolvesOf", () => {
  it("collects every Ascent-Resolves id", () => {
    expect(resolvesOf("x\n\nAscent-Resolves: a\nAscent-Resolves: b")).toEqual(["a", "b"]);
  });
});

describe("isReworkOf", () => {
  const first = commit("1", "feat: feed" + CLAUDE, ["src/data/feed.json", "package.json"]);

  it("counts a repairing fix: or a revert that touches the same file", () => {
    expect(isReworkOf(first, commit("2", "fix: regenerate truncated feed", ["src/data/feed.json"]))).toBe(true);
    expect(isReworkOf(first, commit("2", 'Revert "feat: feed"', ["src/data/feed.json"]))).toBe(true);
  });

  it("ignores an additive fix:, a different file, and noise files", () => {
    expect(isReworkOf(first, commit("2", "fix: Added a feed test", ["src/data/feed.json"]))).toBe(false);
    expect(isReworkOf(first, commit("2", "fix: regenerate", ["src/data/other.json"]))).toBe(false);
    expect(isReworkOf(first, commit("2", "fix: bump", ["package.json"]))).toBe(false);
  });

  it("counts a second commit resolving the same Ascent item", () => {
    const a = commit("1", "fix: Added gate" + lane("rec-9"), ["scripts/x.mjs"]);
    expect(isReworkOf(a, commit("2", "chore: gate again" + lane("rec-9"), ["scripts/x.mjs"]))).toBe(true);
    expect(isReworkOf(a, commit("2", "chore: other" + lane("rec-10"), ["scripts/x.mjs"]))).toBe(false);
  });
});

describe("reworkReport", () => {
  const commits = [
    commit("a1", "feat: feed" + CLAUDE, ["src/feed.ts"]),
    commit("h1", "feat: page", ["src/page.tsx"]),
    commit("h2", "fix: feed half-written", ["src/feed.ts"]),
    commit("a2", "fix: Added test" + lane("r1"), ["src/x.test.ts"]),
  ];

  it("rates each lane and puts the human baseline last", () => {
    const { rows, pairs } = reworkReport(commits, { window: 10 });
    expect(rows.at(-1)?.lane).toBe("human");
    expect(rows.find((r) => r.lane === "agent-other")).toEqual({ lane: "agent-other", commits: 1, reworked: 1, rate: 1 });
    expect(rows.find((r) => r.lane === "ascent")).toEqual({ lane: "ascent", commits: 1, reworked: 0, rate: 0 });
    expect(rows.find((r) => r.lane === "human")).toMatchObject({ commits: 2, reworked: 0 });
    expect(pairs).toEqual([{ sha: "a1", by: "h2", lane: "agent-other" }]);
  });

  it("only looks inside the follow-up window", () => {
    const { rows } = reworkReport(commits, { window: 1 });
    expect(rows.find((r) => r.lane === "agent-other")?.reworked).toBe(0);
  });
});

describe("skillNames", () => {
  it("reads the manifest skills: list and adds project-owned skills", () => {
    const manifest = "repo:\n  name: x\nskills:\n  - conform\n  - native-copy\n\nscope:\n  does: []\n";
    expect(skillNames(manifest, ["icon-gen", "conform"])).toEqual(["conform", "native-copy", "icon-gen"]);
  });
});
