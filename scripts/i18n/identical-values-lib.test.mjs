// node --test scripts/i18n/identical-values-lib.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  auditLocale,
  classifyNonTranslatable,
  collectLeaves,
  identicalInEveryLocale,
} from "./identical-values-lib.mjs";

test("each non-translatable class is decided on the whole value", () => {
  const cases = [
    ["", "empty"],
    ["   ", "empty"],
    ["42", "numeric"],
    ["1,000", "numeric"],
    ["-3.5", "numeric"],
    ["true", "boolean"],
    ["false", "boolean"],
    ["2026-09-14", "iso-date"],
    ["2026-09-14T10:00:00Z", "iso-date"],
    ["https://example.com/docs", "url"],
    ["mailto:team@example.com", "url"],
    ["claude-opus-4-7", "identifier"],
    ["AES-256-GCM", "identifier"],
    ["README.md", "identifier"],
    ["snake_case_key", "identifier"],
    ["KpiTileRenderer", "identifier"],
  ];
  for (const [value, expected] of cases) {
    assert.equal(classifyNonTranslatable(value), expected, JSON.stringify(value));
  }
});

test("errs toward translating: short tokens and ordinary words are language", () => {
  for (const value of ["OK", "NEW", "ON", "SSO", "Personas", "Event-Based", "auto-scaling", "input/output", "Menu"]) {
    assert.equal(classifyNonTranslatable(value), null, value);
  }
});

test("never classifies a substring: a sentence containing a number, URL or identifier is language", () => {
  for (const value of [
    "1,000 executions/mo",
    "Visit https://example.com for details",
    "Run claude-opus-4-7 locally",
    "{count} comments",
    "Released 2026-09-14",
  ]) {
    assert.equal(classifyNonTranslatable(value), null, value);
  }
});

test("accepted terms exclude only an exact whole value", () => {
  const accepted = new Set(["Personas", "Claude Code"]);
  assert.equal(classifyNonTranslatable("Personas", accepted), "accepted-term");
  assert.equal(classifyNonTranslatable("Claude Code", accepted), "accepted-term");
  assert.equal(classifyNonTranslatable("Personas app", accepted), null);
});

test("auditLocale counts checked, excluded, identical, excluded-but-differs and not-compared", () => {
  const en = collectLeaves({
    nav: { home: "Home", docs: "Docs" },
    brand: "Personas",
    stats: { runs: "1,000" },
    list: ["First", "Second"],
    onlyEnglish: "Missing here",
  });
  const de = collectLeaves({
    nav: { home: "Startseite", docs: "Docs" },
    brand: "Personas",
    stats: { runs: "1.000" },
    list: ["Erste", "Second"],
  });
  const result = auditLocale(en, de, new Set(["Personas"]));
  assert.equal(result.checked, 6);
  assert.equal(result.notCompared, 1);
  assert.equal(result.excluded, 2);
  assert.equal(result.byClass["accepted-term"], 1);
  assert.equal(result.byClass.numeric, 1);
  assert.equal(result.excludedButDiffers, 1);
  assert.deepEqual(result.differs, ["stats.runs"]);
  assert.deepEqual(result.identical, ["nav.docs", "list.1"]);
});

test("identicalInEveryLocale intersects the per-locale identical keys", () => {
  const results = {
    de: { identical: ["a", "b", "c"] },
    ja: { identical: ["b", "c"] },
    cs: { identical: ["c", "b", "z"] },
  };
  assert.deepEqual(identicalInEveryLocale(results), ["b", "c"]);
});
