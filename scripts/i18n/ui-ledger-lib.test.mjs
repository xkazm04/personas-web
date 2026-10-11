// node --test scripts/i18n/ui-ledger-lib.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildLedger,
  evaluate,
  hashValue,
  pairStatus,
  ratchetBreaches,
  ratchetCounts,
} from "./ui-ledger-lib.mjs";

const leaves = (obj) => new Map(Object.entries(obj));

function setup(en, de) {
  const enLeaves = leaves(en);
  const localeLeaves = { de: leaves(de) };
  return { enLeaves, localeLeaves };
}

test("hash is NFC-stable and short", () => {
  assert.equal(hashValue("é"), hashValue("é"));
  assert.equal(hashValue("x").length, 10);
});

test("first build pins everything as current; a changed English value turns the pair stale", () => {
  const { enLeaves, localeLeaves } = setup({ "nav.features": "Features" }, { "nav.features": "Funktionen" });
  const ledger = buildLedger({ enLeaves, localeLeaves, pendingNamespaces: {} });
  assert.equal(evaluate({ enLeaves, localeLeaves, ledger }).totals.current, 1);

  const edited = leaves({ "nav.features": "Capabilities" });
  const result = evaluate({ enLeaves: edited, localeLeaves, ledger });
  assert.equal(result.totals.stale, 1);
  assert.deepEqual(result.keysByStatus.de.stale, ["nav.features"]);
});

test("--update never launders a stale translation; retranslating does clear it", () => {
  const { localeLeaves } = setup({}, { k: "Alt" });
  const v1 = buildLedger({ enLeaves: leaves({ k: "Old" }), localeLeaves, pendingNamespaces: {} });
  const enNew = leaves({ k: "New" });
  const v2 = buildLedger({ enLeaves: enNew, localeLeaves, previous: v1, pendingNamespaces: {} });
  assert.equal(evaluate({ enLeaves: enNew, localeLeaves, ledger: v2 }).totals.stale, 1);

  const retranslated = { de: leaves({ k: "Neu" }) };
  assert.equal(evaluate({ enLeaves: enNew, localeLeaves: retranslated, ledger: v2 }).totals.unpinned, 1);
  const v3 = buildLedger({ enLeaves: enNew, localeLeaves: retranslated, previous: v2, pendingNamespaces: {} });
  assert.equal(evaluate({ enLeaves: enNew, localeLeaves: retranslated, ledger: v3 }).totals.current, 1);
});

test("missing locale string is pending; new key is unpinned; removed key is an orphan", () => {
  const enLeaves = leaves({ a: "A word", b: "B word" });
  const localeLeaves = { de: leaves({ a: "Ein Wort" }) };
  const ledger = { keys: { gone: { en: "x", pins: {} } } };
  const result = evaluate({ enLeaves, localeLeaves, ledger });
  assert.equal(result.totals.pending, 1);
  assert.equal(result.totals.unpinned, 1);
  assert.deepEqual(result.orphans, ["gone"]);
});

test("identical value is flagged unless it is an accepted term", () => {
  const entry = (en) => ({ pins: { de: `${hashValue(en)}:${hashValue(en)}` } });
  const base = { locale: "de", acceptedTerms: new Set(["Personas"]) };
  assert.equal(
    pairStatus({ ...base, enValue: "Save changes", localeValue: "Save changes", entry: entry("Save changes") }),
    "identical",
  );
  assert.equal(
    pairStatus({ ...base, enValue: "Personas", localeValue: "Personas", entry: entry("Personas") }),
    "current",
  );
});

test("ratchet counts include pending namespaces; breaches name what rose", () => {
  const enLeaves = leaves({ a: "A word" });
  const localeLeaves = { de: leaves({ a: "Ein Wort" }), fr: leaves({ a: "Un mot" }) };
  const ledger = buildLedger({ enLeaves, localeLeaves, pendingNamespaces: { p: 5 } });
  const counts = ratchetCounts(evaluate({ enLeaves, localeLeaves, ledger, pendingKeyCount: 5 }));
  assert.deepEqual(counts, { stale: 0, pending: 10, identical: 0 });
  assert.deepEqual(ratchetBreaches({ stale: 1, pending: 10, identical: 0 }, counts), ["stale"]);
  assert.deepEqual(ratchetBreaches({ stale: 0, pending: 9, identical: 0 }, counts), []);
});
