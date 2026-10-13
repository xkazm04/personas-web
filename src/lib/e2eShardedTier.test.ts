import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the full Playwright suite on PRs (.github/workflows/e2e-full-sharded.yml).
 *
 * The workflow only runs on GitHub, so this spec holds what a local run can see.
 * It fails when the job loses its PR trigger or its read-only token, when the
 * shard matrix and the `--shard` denominator disagree (a shard of the suite would
 * silently never run), when a spec list or project filter turns it back into a
 * subset, when the per-shard budget or the duration upload goes, and when an
 * action is used that no other workflow already pins to the same commit SHA.
 * Rationale: docs/testing/e2e-smoke-tier.md § Full suite on PRs.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");

const WORKFLOW = read(".github/workflows/e2e-full-sharded.yml");
const PINNING_WORKFLOWS = [".github/workflows/ci.yml", ".github/workflows/e2e-smoke.yml"];
const SHARDS = 4;
const BUDGET_MINUTES = 8;

/** `uses:` values, comment included (`owner/action@sha # vX`). */
function usesLines(text: string): string[] {
  return Array.from(text.matchAll(/^\s*-?\s*uses:\s*(.+?)\s*$/gm), (m) => m[1]);
}

const RUN = /^ +- run: npx playwright test(.*)$/m.exec(WORKFLOW)?.[1] ?? "";

/** The arguments after `npx playwright test`, each `${{ … }}` expression read as `N`. */
function playwrightArgs(): string[] {
  const args = RUN.replace(/\$\{\{[^}]*\}\}/g, "N").trim();
  return args === "" ? [] : args.split(/\s+/);
}

describe(".github/workflows/e2e-full-sharded.yml", () => {
  it("runs on every pull request to master", () => {
    expect(WORKFLOW).toMatch(/^on:\n {2}pull_request:\n {4}branches: \[master\]$/m);
  });

  it("gives the token read-only contents scope at the top level", () => {
    expect(WORKFLOW).toMatch(/^permissions:\n {2}contents: read$/m);
  });

  it(`splits the suite into ${SHARDS} shards that all run`, () => {
    const matrix = /^ {8}shard: \[([\d, ]+)\]$/m.exec(WORKFLOW);
    expect(matrix).not.toBeNull();
    const shards = matrix![1].split(",").map((s) => Number(s.trim()));
    expect(shards).toEqual(Array.from({ length: SHARDS }, (_, i) => i + 1));
    expect(RUN).toContain(`--shard=\${{ matrix.shard }}/${SHARDS}`);
    expect(playwrightArgs()).toContain(`--shard=N/${SHARDS}`);
    expect(WORKFLOW).toContain("fail-fast: false");
  });

  it("runs the whole suite: no spec list, no project or grep filter", () => {
    const args = playwrightArgs();
    expect(args.length).toBeGreaterThan(0);
    for (const arg of args) {
      expect(arg.startsWith("--"), `${arg} narrows the suite`).toBe(true);
      expect(arg, "a filter makes this a subset of the nightly suite").not.toMatch(/^--(project|grep|grep-invert|last-failed|only-changed)\b/);
    }
  });

  it(`holds a hard budget of ${BUDGET_MINUTES} minutes per shard`, () => {
    expect(WORKFLOW).toMatch(new RegExp(`^ {4}timeout-minutes: ${BUDGET_MINUTES}$`, "m"));
  });

  it("uploads per-test durations from every shard, pass or fail", () => {
    expect(playwrightArgs()).toContain("--reporter=list,json");
    expect(WORKFLOW).toContain("PLAYWRIGHT_JSON_OUTPUT_NAME: playwright-report/durations-${{ matrix.shard }}.json");
    expect(WORKFLOW).toMatch(/^ {8}if: always\(\)\n {8}with:\n {10}name: playwright-durations-\$\{\{ matrix\.shard \}\}\n {10}path: playwright-report\/$/m);
  });

  it("uploads traces when a shard fails", () => {
    expect(WORKFLOW).toContain("if: failure()");
    expect(WORKFLOW).toContain("path: test-results/");
  });

  it("uses only actions another workflow already pins to the same commit SHA", () => {
    const pinned = new Set(PINNING_WORKFLOWS.flatMap((file) => usesLines(read(file))));
    const uses = usesLines(WORKFLOW);
    expect(uses.length).toBeGreaterThan(0);
    for (const use of uses) {
      expect(use).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40} # v[\d.]+$/);
      expect(pinned.has(use), `${use} is not pinned by an existing workflow`).toBe(true);
    }
  });
});
