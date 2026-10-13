import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keeps the flaky-e2e register honest (docs/testing/flaky-e2e.md).
 *
 * Under CI a flaky Playwright result already fails the run
 * (`failOnFlakyTests`); e2e/flaky-register.json is where the flake is written
 * down afterwards, with an owner and a deadline. This spec fails `test:unit`
 * on an entry nobody owns, one that points at a spec that no longer exists,
 * one whose window is longer than MAX_WINDOW_DAYS, and one that has expired,
 * so a recorded flake has to be fixed or deleted rather than forgotten.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const REGISTER = "e2e/flaky-register.json";
const DOC = "docs/testing/flaky-e2e.md";
const MAX_WINDOW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface FlakyEntry {
  spec: string;
  test: string;
  owner: string;
  addedOn: string;
  expiresOn: string;
  seenIn: string;
}

const register = JSON.parse(read(REGISTER)) as { entries: FlakyEntry[] };
const entries = register.entries;
const label = (e: FlakyEntry) => `${e.spec} > ${e.test}`;
const dayOf = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

describe("flaky e2e register", () => {
  it("is a list of entries", () => {
    expect(Array.isArray(entries)).toBe(true);
  });

  it("names an owner, a test and the run that showed the flake", () => {
    const incomplete = entries.filter(
      (e) => !e.owner?.trim() || !e.test?.trim() || !/^https?:\/\//.test(e.seenIn ?? ""),
    );
    expect(incomplete.map(label)).toEqual([]);
  });

  it("points only at spec files that exist under e2e/", () => {
    const missing = entries.filter(
      (e) => !e.spec?.startsWith("e2e/") || !existsSync(path.join(REPO_ROOT, e.spec)),
    );
    expect(missing.map(label)).toEqual([]);
  });

  it(`gives each entry a dated window of at most ${MAX_WINDOW_DAYS} days`, () => {
    const bad = entries.filter((e) => {
      if (!ISO_DATE.test(e.addedOn ?? "") || !ISO_DATE.test(e.expiresOn ?? "")) return true;
      const days = (dayOf(e.expiresOn) - dayOf(e.addedOn)) / DAY_MS;
      return !(days >= 0 && days <= MAX_WINDOW_DAYS);
    });
    expect(bad.map(label)).toEqual([]);
  });

  it("holds no expired entry", () => {
    const today = new Date().toISOString().slice(0, 10);
    const expired = entries.filter((e) => e.expiresOn < today);
    expect(expired.map((e) => `${label(e)} (expired ${e.expiresOn}, owner ${e.owner})`)).toEqual([]);
  });

  it("is documented with the same window", () => {
    const doc = read(DOC);
    expect(doc).toContain("`e2e/flaky-register.json`");
    expect(doc).toContain(`at most ${MAX_WINDOW_DAYS} days`);
  });
});
