import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the PR tier of the Playwright suite (.github/workflows/e2e-smoke.yml).
 *
 * The full suite is nightly-only because it takes about 10 minutes. The smoke tier
 * runs a fixed set of high-risk specs on every PR under a hard time budget. This
 * spec stops the tier from silently emptying (a renamed spec that the CLI filter
 * no longer matches runs nothing), from growing past its budget one spec at a
 * time, or from losing its PR trigger. Rationale: docs/testing/e2e-smoke-tier.md.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW = fs.readFileSync(path.join(ROOT, ".github", "workflows", "e2e-smoke.yml"), "utf8");

const TIER = ["e2e/smoke.spec.ts", "e2e/csp.spec.ts", "e2e/cookie-consent.spec.ts", "e2e/legal.spec.ts"];
const BUDGET_MINUTES = 10;

describe("e2e smoke tier", () => {
  it("runs on every pull request to master", () => {
    expect(WORKFLOW).toMatch(/^on:\r?\n {2}pull_request:\r?\n {4}branches: \[master\]/m);
  });

  it("runs exactly the pinned specs, all of which exist", () => {
    const run = /npx playwright test --project=chromium ([^\r\n]+)/.exec(WORKFLOW);
    expect(run).not.toBeNull();
    const specs = run![1].trim().split(/\s+/);
    expect(specs).toEqual(TIER);
    for (const spec of specs) expect(fs.existsSync(path.join(ROOT, spec)), spec).toBe(true);
  });

  it("stays a strict subset of the nightly suite", () => {
    const all = fs.readdirSync(path.join(ROOT, "e2e")).filter((f) => f.endsWith(".spec.ts"));
    expect(TIER.length).toBeLessThan(all.length / 2);
  });

  it(`holds a hard budget of ${BUDGET_MINUTES} minutes`, () => {
    expect(WORKFLOW).toMatch(new RegExp(`^ {4}timeout-minutes: ${BUDGET_MINUTES}\\r?$`, "m"));
  });

  it("uploads traces when it fails", () => {
    expect(WORKFLOW).toContain("if: failure()");
    expect(WORKFLOW).toContain("path: test-results/");
  });
});
