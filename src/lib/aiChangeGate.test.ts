import { describe, it, expect } from "vitest";
import {
  addedMarkdownLines,
  anchorProblems,
  anchorsOf,
  formatAdvice,
  isAgentCommit,
  overrideOf,
  protectedPathProblems,
  scopeProblems,
} from "../../scripts/check-ai-change.mjs";

/**
 * Pins the pure rules of scripts/check-ai-change.mjs, the review gate that
 * .github/workflows/ai-change-gate.yml runs on every pull request against the
 * commits an agent authored.
 */

const TOP = new Set(["src", "docs", "scripts", ".ai"]);
const FILES = new Set(["src/lib/sentry-pii.ts", "docs/threat-model.md", "docs/decisions/a.md", ".ai/manifest.yaml"]);
const DIRS = new Set(["src", "src/lib", "docs", "docs/decisions", ".ai"]);
const CTX = {
  topLevel: TOP,
  tracked: (p: string) => FILES.has(p) || DIRS.has(p),
  lineCount: () => 100,
};

describe("isAgentCommit / overrideOf", () => {
  it("recognises the Claude co-author and Ascent trailers, nothing else", () => {
    expect(isAgentCommit("fix: x\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")).toBe(true);
    expect(isAgentCommit("fix: x\n\nAscent-Resolves: 1234")).toBe(true);
    expect(isAgentCommit("fix: x\n\nCo-Authored-By: Jane <jane@example.com>")).toBe(false);
    expect(isAgentCommit("mentions Claude in prose")).toBe(false);
  });

  it("reads an override reason only from its own line", () => {
    expect(overrideOf("x\n\nAI-Gate-Override: owner asked for the route")).toBe("owner asked for the route");
    expect(overrideOf("x\n\nAI-Gate-Override:   ")).toBeNull();
    expect(overrideOf("x")).toBeNull();
  });
});

describe("protectedPathProblems", () => {
  it("fails env files and .claude/ writes, allows .env.example and deletions", () => {
    const problems = protectedPathProblems([
      { status: "A", file: ".env.local" },
      { status: "M", file: "apps/.env" },
      { status: "A", file: ".env.example" },
      { status: "M", file: ".claude/CLAUDE.md" },
      { status: "D", file: ".claude/old.md" },
      { status: "M", file: "src/lib/x.ts" },
    ]);
    expect(problems).toHaveLength(3);
    expect(problems.join("\n")).toMatch(/\.env\.local/);
    expect(problems.join("\n")).toMatch(/apps\/\.env/);
    expect(problems.join("\n")).toMatch(/\.claude\/CLAUDE\.md/);
  });
});

describe("scopeProblems", () => {
  it("fails a new API route or SQL file, not an edit to one", () => {
    expect(scopeProblems([{ status: "A", file: "src/app/api/admin/route.ts" }])).toHaveLength(1);
    expect(scopeProblems([{ status: "A", file: "scripts/new-table.sql" }])).toHaveLength(1);
    expect(scopeProblems([{ status: "M", file: "src/app/api/votes/route.ts" }])).toEqual([]);
    expect(scopeProblems([{ status: "A", file: "src/lib/helper.ts" }])).toEqual([]);
  });
});

describe("formatAdvice", () => {
  it("accepts the CLAUDE.md format and names what is missing otherwise", () => {
    expect(formatAdvice("B.2/lint: fix rules\n\nWhy: a\nRisk: low\nVerified: tsc")).toEqual([]);
    const advice = formatAdvice("fix: Added threat model\n\nWhy: a");
    expect(advice).toHaveLength(3);
  });
});

describe("anchorsOf", () => {
  it("takes backticked repo paths with optional lines and relative links", () => {
    const a = anchorsOf(
      "See `src/lib/sentry-pii.ts:12`, `docs/` and [record](decisions/a.md#why), not `npm run lint`.",
      "docs/threat-model.md",
      TOP,
    );
    expect(a).toEqual([
      { path: "src/lib/sentry-pii.ts", line: 12 },
      { path: "docs", line: null },
      { path: "docs/decisions/a.md", line: null },
    ]);
  });

  it("skips globs, placeholders, absolute routes, URLs and untracked roots", () => {
    const line =
      "`src/**/*.test.ts` `.claude/<skill>/config.md` `/dashboard/home` `node_modules/x/y.js` `../ai-registry` [x](https://a.b/c) [y](#top)";
    expect(anchorsOf(line, "README.md", TOP)).toEqual([]);
  });

  it("reads the end of a line range", () => {
    expect(anchorsOf("`src/lib/sentry-pii.ts:10-140`", "README.md", TOP)).toEqual([
      { path: "src/lib/sentry-pii.ts", line: 140 },
    ]);
  });
});

describe("anchorProblems", () => {
  it("flags a path that does not exist and a line past the end", () => {
    const problems = anchorProblems(
      "docs/AI_HARNESS.md",
      ["Gate lives in `src/lib/imaginary.ts`.", "Scrubber at `src/lib/sentry-pii.ts:101`.", "Fine: `src/lib/sentry-pii.ts:7`."],
      CTX,
    );
    expect(problems).toEqual([
      "docs/AI_HARNESS.md: `src/lib/imaginary.ts` does not exist",
      "docs/AI_HARNESS.md: `src/lib/sentry-pii.ts:101` is past the end of the file (100 lines)",
    ]);
  });

  it("passes when every anchor resolves", () => {
    expect(anchorProblems("docs/threat-model.md", ["[r](decisions/a.md) and `.ai/manifest.yaml`"], CTX)).toEqual([]);
  });
});

describe("addedMarkdownLines", () => {
  it("collects only added lines of markdown files from a zero-context diff", () => {
    const diff = [
      "diff --git a/docs/x.md b/docs/x.md",
      "--- a/docs/x.md",
      "+++ b/docs/x.md",
      "@@ -1,0 +2,2 @@",
      "+new line one",
      "+new line two",
      "-old line",
      "diff --git a/src/a.ts b/src/a.ts",
      "--- a/src/a.ts",
      "+++ b/src/a.ts",
      "+const x = 1;",
      "diff --git a/docs/gone.md b/docs/gone.md",
      "--- a/docs/gone.md",
      "+++ /dev/null",
      "-bye",
    ].join("\n");
    expect(addedMarkdownLines(diff)).toEqual({ "docs/x.md": ["new line one", "new line two"] });
  });
});
