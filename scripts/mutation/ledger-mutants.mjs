// Mutants of scripts/i18n/ui-ledger-lib.mjs, the logic behind the i18n ratchet that CI
// enforces with `npm run check:i18n-ledger`. If its tests passed against broken code, a
// stale translation could be laundered into "current" and the ratchet would hold nothing.
//
// Each mutant is one small, plausible wrong edit: `find` must occur exactly once in the
// source (mutate.mjs refuses a stale or ambiguous mutant rather than skip it), `replace` is
// the wrong code, `killedBy` names the test expected to fail. A mutant that is equivalent
// to the original (no test could ever tell them apart) does not belong in this list.

export const TARGET = "scripts/i18n/ui-ledger-lib.mjs";

// Files copied next to the mutated source: its import and the two test files run against it.
export const SUPPORT = ["scripts/i18n/identical-values-lib.mjs"];
export const TESTS = ["scripts/i18n/ui-ledger-lib.test.mjs", "scripts/i18n/ui-ledger-lib.mutants.test.mjs"];

const BASE = "ui-ledger-lib.test.mjs";
const KILLERS = "ui-ledger-lib.mutants.test.mjs";

export const MUTANTS = [
  { id: "hash-length", find: ".slice(0, 10)", replace: ".slice(0, 9)", killedBy: `${BASE}: hash is NFC-stable and short` },
  { id: "hash-no-nfc", find: 'update(value.normalize("NFC"), "utf8")', replace: 'update(value, "utf8")', killedBy: `${KILLERS}: composed and decomposed forms` },
  { id: "parse-pin-no-type-guard", find: '  if (typeof raw !== "string") return null;', replace: "", killedBy: `${BASE}: first build pins everything` },
  { id: "missing-string-unpinned", find: 'if (typeof localeValue !== "string") return "pending";', replace: 'if (typeof localeValue !== "string") return "unpinned";', killedBy: `${BASE}: missing locale string is pending` },
  { id: "no-pin-stale", find: 'if (!pin) return "unpinned";', replace: 'if (!pin) return "stale";', killedBy: `${BASE}: new key is unpinned` },
  { id: "val-check-inverted", find: 'if (pin.val !== hashValue(localeValue)) return "unpinned";', replace: 'if (pin.val === hashValue(localeValue)) return "unpinned";', killedBy: `${BASE}: first build pins everything` },
  { id: "stale-as-unpinned", find: 'if (pin.pin !== hashValue(enValue)) return "stale";', replace: 'if (pin.pin !== hashValue(enValue)) return "unpinned";', killedBy: `${BASE}: changed English value turns the pair stale` },
  { id: "identical-inverted", find: "if (localeValue === enValue && !classifyNonTranslatable(enValue, acceptedTerms))", replace: "if (localeValue !== enValue && !classifyNonTranslatable(enValue, acceptedTerms))", killedBy: `${BASE}: identical value is flagged` },
  { id: "accepted-term-inverted", find: "if (localeValue === enValue && !classifyNonTranslatable(enValue, acceptedTerms))", replace: "if (localeValue === enValue && classifyNonTranslatable(enValue, acceptedTerms))", killedBy: `${BASE}: identical value is flagged` },
  { id: "count-double", find: "perLocale[locale][status] += 1;", replace: "perLocale[locale][status] += 2;", killedBy: `${BASE}: first build pins everything` },
  { id: "keys-by-status-dropped", find: "keysByStatus[locale][status].push(key);", replace: "", killedBy: `${BASE}: changed English value turns the pair stale` },
  { id: "ledger-entry-ignored", find: "const entry = ledger?.keys?.[key];", replace: "const entry = undefined;", killedBy: `${BASE}: first build pins everything` },
  { id: "orphans-inverted", find: ".filter((key) => !enLeaves.has(key))", replace: ".filter((key) => enLeaves.has(key))", killedBy: `${BASE}: removed key is an orphan` },
  { id: "pending-namespaces-per-locale", find: "pendingKeyCount * locales.length", replace: "pendingKeyCount", killedBy: `${BASE}: ratchet counts include pending namespaces` },
  { id: "pending-key-count-default", find: "pendingKeyCount = 0 }", replace: "pendingKeyCount = 1 }", killedBy: `${KILLERS}: ratchet's pending count is the catalog's own` },
  { id: "ratchet-drops-namespaces", find: "pending: result.totals.pending + result.pendingNamespacePairs,", replace: "pending: result.totals.pending,", killedBy: `${BASE}: ratchet counts include pending namespaces` },
  { id: "ratchet-wrong-identical", find: "identical: result.totals.identical,", replace: "identical: result.totals.current,", killedBy: `${BASE}: ratchet counts include pending namespaces` },
  { id: "locales-unsorted", find: "const locales = Object.keys(localeLeaves).sort();", replace: "const locales = Object.keys(localeLeaves);", killedBy: `${KILLERS}: buildLedger: sorted locales` },
  { id: "pin-missing-string", find: 'if (typeof localeValue !== "string") continue;', replace: "", killedBy: `${KILLERS}: no pin for a missing locale string` },
  { id: "update-launders-stale", find: "`${priorPin.pin}:${valHash}`", replace: "`${enHash}:${valHash}`", killedBy: `${BASE}: --update never launders a stale translation` },
  { id: "entry-en-hash", find: "keys[key] = { en: enHash, pins };", replace: "keys[key] = { en: hashValue(key), pins };", killedBy: `${KILLERS}: buildLedger passthrough fields` },
  { id: "ledger-version", find: "version: LEDGER_VERSION,", replace: "version: LEDGER_VERSION + 1,", killedBy: `${KILLERS}: buildLedger passthrough fields` },
  { id: "ledger-ratchet-dropped", find: "    ratchet,", replace: "    ratchet: null,", killedBy: `${KILLERS}: buildLedger passthrough fields` },
  { id: "ledger-pending-dropped", find: "pending: pendingNamespaces,", replace: "pending: {},", killedBy: `${KILLERS}: buildLedger passthrough fields` },
  { id: "breaches-without-ceiling", find: "if (!recorded) return [];", replace: "if (!recorded) return Object.keys(current);", killedBy: `${KILLERS}: no recorded ceiling breaches nothing` },
  { id: "breach-at-ceiling", find: "current[name] > (recorded[name] ?? 0)", replace: "current[name] >= (recorded[name] ?? 0)", killedBy: `${BASE}: breaches name what rose` },
  { id: "breach-new-count-free", find: "current[name] > (recorded[name] ?? 0)", replace: "current[name] > (recorded[name] ?? Infinity)", killedBy: `${KILLERS}: a new count is held at zero` },
];
