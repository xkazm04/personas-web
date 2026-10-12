import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Holds bundle-budget.json and field-budget.json to the rule that produced
 * their numbers, as recorded in
 * docs/decisions/2026-10-13-bundle-and-field-budget-rationale.md: a bundle
 * ceiling is a measurement plus the script's tolerance, and the field defaults
 * are the Core Web Vitals "good" thresholds. A hand-edited number, or a
 * tolerance changed in one place only, fails `test:unit`.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const RECORD = "docs/decisions/2026-10-13-bundle-and-field-budget-rationale.md";

interface BundleBudget {
  toleranceKB: number;
  sharedBaselineKB: number;
  routes: Record<string, number>;
}
interface FieldBudget {
  warnOnly: boolean;
  minSamples: number;
  defaults: Record<string, number>;
  routes: Record<string, Record<string, number>>;
}

const bundle = JSON.parse(read("bundle-budget.json")) as BundleBudget;
const field = JSON.parse(read("field-budget.json")) as FieldBudget;
const record = read(RECORD);

/** Core Web Vitals "good" boundaries at p75. */
const CWV_GOOD = { LCP: 2500, INP: 200, CLS: 0.1 };

describe("bundle budget rationale", () => {
  const script = read("scripts/check-bundle-budget.mjs");
  const scriptTolerance = Number(/const TOLERANCE_KB = (\d+);/.exec(script)?.[1]);

  it("uses one tolerance in the script, the budget file and the record", () => {
    expect(scriptTolerance).toBeGreaterThan(0);
    expect(bundle.toleranceKB).toBe(scriptTolerance);
    expect(record).toContain(`\`toleranceKB\` is ${scriptTolerance}`);
  });

  it("keeps every route ceiling at least the tolerance above the shared floor it contains", () => {
    const sharedMeasured = bundle.sharedBaselineKB - bundle.toleranceKB;
    const tooLow = Object.entries(bundle.routes).filter(
      ([, ceiling]) => ceiling - bundle.toleranceKB < sharedMeasured,
    );
    expect(tooLow).toEqual([]);
  });
});

describe("field budget rationale", () => {
  it("defaults to the Core Web Vitals good thresholds", () => {
    expect(field.defaults).toEqual(CWV_GOOD);
  });

  it("matches the thresholds and sample floor the record gives", () => {
    expect(record).toContain("LCP 2500 ms, INP 200 ms, CLS 0.1");
    expect(record).toContain(`\`minSamples\` is ${field.minSamples}`);
  });

  it("never sets a per-route ceiling looser than the default", () => {
    const looser: string[] = [];
    for (const [route, cells] of Object.entries(field.routes)) {
      for (const [metric, ceiling] of Object.entries(cells)) {
        if (ceiling > field.defaults[metric]) looser.push(`${route} ${metric}`);
      }
    }
    expect(looser).toEqual([]);
  });
});
