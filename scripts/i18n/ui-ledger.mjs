#!/usr/bin/env node
/**
 * ui-ledger — per-key hash-pinned provenance for the UI catalog (src/i18n/*.ts).
 *
 * Writes/reads docs/i18n/ui-ledger.json. See ui-ledger-lib.mjs for the model.
 *
 *   node scripts/i18n/ui-ledger.mjs            # same as --check
 *   node scripts/i18n/ui-ledger.mjs --check    # CI gate: exit 1 on unpinned pairs, orphan keys,
 *                                              #   or a stale/pending/identical count above the ratchet
 *   node scripts/i18n/ui-ledger.mjs --update   # pin new/retranslated strings, drop removed keys,
 *                                              #   lower the ratchet (never raises it)
 *   node scripts/i18n/ui-ledger.mjs --update --accept-ratchet-raise   # owner call: a new pending
 *                                              #   namespace, or deliberately leaving stale pairs
 *   node scripts/i18n/ui-ledger.mjs --report
 *   node scripts/i18n/ui-ledger.mjs --keys=<locale>:<status>
 *
 * Test: node --test scripts/i18n/ui-ledger-lib.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "../atomic-write.mjs";
import { collectLeaves } from "./identical-values-lib.mjs";
import { listLocales, loadLocale, loadPendingNamespaces } from "./load-locale.mjs";
import {
  STATUSES,
  buildLedger,
  evaluate,
  ratchetBreaches,
  ratchetCounts,
} from "./ui-ledger-lib.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const i18nDir = path.join(repoRoot, "src", "i18n");
const ledgerPath = path.join(repoRoot, "docs", "i18n", "ui-ledger.json");
const contractPath = path.join(repoRoot, "docs", "i18n", "copy-contract.json");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const keysArg = args.find((a) => a.startsWith("--keys="))?.slice("--keys=".length);

const acceptedTerms = fs.existsSync(contractPath)
  ? new Set(JSON.parse(fs.readFileSync(contractPath, "utf8"))?.terms?.accept ?? [])
  : new Set();

const locales = listLocales(i18nDir).filter((l) => l !== "en");

const enLeaves = collectLeaves(loadLocale(i18nDir, "en"));
const localeLeaves = Object.fromEntries(
  locales.map((l) => [l, collectLeaves(loadLocale(i18nDir, l))]),
);
const pendingNamespaces = Object.fromEntries(
  Object.entries(loadPendingNamespaces(i18nDir)).map(([ns, copy]) => [ns, collectLeaves(copy).size]),
);
const pendingKeyCount = Object.values(pendingNamespaces).reduce((a, b) => a + b, 0);

const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, "utf8")) : null;
const evaluateWith = (l) =>
  evaluate({ enLeaves, localeLeaves, ledger: l, acceptedTerms, pendingKeyCount });

function printTable(result) {
  console.log("locale  current  identical  stale  pending  unpinned");
  const row = (name, c) =>
    `${name.padEnd(6)}  ${String(c.current).padStart(7)}  ${String(c.identical).padStart(9)}  ` +
    `${String(c.stale).padStart(5)}  ${String(c.pending).padStart(7)}  ${String(c.unpinned).padStart(8)}`;
  for (const locale of result.locales) console.log(row(locale, result.perLocale[locale]));
  console.log(row("total", result.totals));
  console.log(
    `\nEnglish-only namespaces (src/i18n/pending/): ${Object.keys(pendingNamespaces).length} namespaces, ` +
      `${pendingKeyCount} keys, ${result.pendingNamespacePairs} locale-key pairs pending`,
  );
}

// One line per key so a ledger diff reads as the keys that changed.
function serialize(l) {
  const { keys, ...head } = l;
  const body = Object.entries(keys).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  const headJson = JSON.stringify(head, null, 1).slice(0, -2);
  return `${headJson},\n "keys": {\n${body.join(",\n")}\n }\n}\n`;
}

if (flag("--update")) {
  const before = ledger ? evaluateWith(ledger) : null;
  const baseline = buildLedger({
    enLeaves,
    localeLeaves,
    previous: ledger,
    pendingNamespaces,
    ratchet: ledger?.ratchet,
  });
  const after = evaluateWith(baseline);
  const current = ratchetCounts(after);
  const recorded = ledger?.ratchet;
  const breaches = ratchetBreaches(current, recorded);
  if (breaches.length > 0 && !flag("--accept-ratchet-raise")) {
    console.error(
      `ui-ledger: refusing to raise the ratchet (${breaches
        .map((n) => `${n} ${recorded[n]} -> ${current[n]}`)
        .join(", ")}). Translate the stale keys, or pass --accept-ratchet-raise if the owner ` +
        "decided to leave them.",
    );
    process.exit(1);
  }
  // Lowering is automatic; raising only with the flag. First run records today's numbers.
  const next = {
    ...baseline,
    ratchet: recorded
      ? Object.fromEntries(
          Object.keys(current).map((n) => [
            n,
            flag("--accept-ratchet-raise")
              ? current[n]
              : Math.min(recorded[n] ?? current[n], current[n]),
          ]),
        )
      : current,
  };
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  writeFileAtomic(ledgerPath, serialize(next));
  console.log(`ui-ledger: wrote ${path.relative(repoRoot, ledgerPath)} (${enLeaves.size} keys)`);
  if (before) console.log(`  before: ${JSON.stringify(before.totals)}`);
  console.log(`  after:  ${JSON.stringify(after.totals)}`);
  console.log(`  ratchet: ${JSON.stringify(next.ratchet)}`);
  process.exit(0);
}

if (!ledger) {
  console.error(`ui-ledger: ${path.relative(repoRoot, ledgerPath)} is missing. Run with --update.`);
  process.exit(1);
}
const result = evaluateWith(ledger);

if (keysArg) {
  const [locale, status] = keysArg.split(":");
  if (!result.keysByStatus[locale] || !STATUSES.includes(status)) {
    console.error(`Use --keys=<locale>:<${STATUSES.join("|")}>`);
    process.exit(2);
  }
  for (const key of result.keysByStatus[locale][status]) console.log(key);
  process.exit(0);
}

printTable(result);
if (flag("--report")) process.exit(0);

const problems = [];
if (result.totals.unpinned > 0) {
  problems.push(
    `${result.totals.unpinned} unpinned pair(s): new keys or retranslated strings not recorded. ` +
      "Run `npm run i18n:ledger`. List with --keys=<locale>:unpinned.",
  );
}
if (result.orphans.length > 0) {
  problems.push(
    `${result.orphans.length} ledger key(s) no longer in en.ts (e.g. ${result.orphans[0]}). Run \`npm run i18n:ledger\`.`,
  );
}
const current = ratchetCounts(result);
const breaches = ratchetBreaches(current, ledger.ratchet);
for (const name of breaches) {
  problems.push(
    `${name} pairs rose to ${current[name]} (ratchet ${ledger.ratchet[name]}). ` +
      (name === "stale"
        ? "An English value changed without its translations: re-translate (list with --keys=<locale>:stale)."
        : "Counts may only fall."),
  );
}
if (problems.length > 0) {
  console.error("\nui-ledger: FAIL");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
const lowered = Object.keys(current).filter((n) => current[n] < (ledger.ratchet?.[n] ?? 0));
console.log(
  lowered.length
    ? `\nui-ledger: ok (ratchet can drop: ${lowered.join(", ")}; run \`npm run i18n:ledger\` to bank it)`
    : "\nui-ledger: ok",
);
