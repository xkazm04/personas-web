// node --test scripts/i18n/ui-ledger-lib.mutants.test.mjs
//
// Tests written to kill mutants of ui-ledger-lib.mjs that ui-ledger-lib.test.mjs let
// survive (scripts/mutation/ledger-mutants.mjs names each one and the test that kills it).
// Run the mutation check with `node scripts/mutation/mutate.mjs`.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LEDGER_VERSION,
  buildLedger,
  evaluate,
  hashValue,
  ratchetBreaches,
  ratchetCounts,
} from "./ui-ledger-lib.mjs";

const leaves = (obj) => new Map(Object.entries(obj));

test("hash treats composed and decomposed forms as one value", () => {
  assert.equal(hashValue("é"), hashValue("é"));
});

test("buildLedger: sorted locales, passthrough fields, no pin for a missing locale string", () => {
  const ratchet = { stale: 0, pending: 3, identical: 0 };
  const ledger = buildLedger({
    enLeaves: leaves({ k: "K" }),
    localeLeaves: { fr: leaves({ k: "Ka" }), de: leaves({}) },
    pendingNamespaces: { p: 3 },
    ratchet,
  });
  assert.equal(ledger.version, LEDGER_VERSION);
  assert.deepEqual(ledger.locales, ["de", "fr"]);
  assert.deepEqual(ledger.ratchet, ratchet);
  assert.deepEqual(ledger.pending, { p: 3 });
  assert.equal(ledger.keys.k.en, hashValue("K"));
  assert.deepEqual(ledger.keys.k.pins, { fr: `${hashValue("K")}:${hashValue("Ka")}` });
});

test("ratchetBreaches: no recorded ceiling breaches nothing; a new count is held at zero", () => {
  assert.deepEqual(ratchetBreaches({ stale: 1 }, undefined), []);
  assert.deepEqual(ratchetBreaches({ stale: 0, fresh: 1 }, { stale: 0 }), ["fresh"]);
});

test("without pending namespaces the ratchet's pending count is the catalog's own", () => {
  const enLeaves = leaves({ a: "A word" });
  const localeLeaves = { de: leaves({}) };
  const result = evaluate({ enLeaves, localeLeaves, ledger: { keys: {} } });
  assert.equal(result.pendingNamespacePairs, 0);
  assert.equal(ratchetCounts(result).pending, 1);
});
