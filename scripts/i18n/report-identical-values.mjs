#!/usr/bin/env node
/**
 * report-identical-values — how many src/i18n values are still identical to English.
 *
 * check-i18n-coverage.mjs prints "xx: 100%" when every English key exists in a
 * locale with a non-empty string. It cannot see a value that was copied across
 * untranslated. This report counts those, per locale, after excluding values that
 * are not language (see identical-values-lib.mjs for the classes).
 *
 * A MEASUREMENT, NOT A GATE. It always exits 0 (unless a locale file cannot be
 * loaded), it is not wired into the git hooks or CI, and it prints counts, never
 * a percentage or pass/fail. Whether to turn it into a ratchet with a reviewed
 * per-key allowlist (the fix sketched in
 * docs/harness/ambiguity-ui-scan-2026-07-16/internationalization.md #1) is the
 * owner's decision. Read before deciding: an identical value in a Latin-script
 * locale is often a correct cognate or brand, so the raw count ranks locales by
 * script, not by quality. Enumerate the floor; never threshold it.
 *
 * Usage (from the repo root):
 *   node scripts/i18n/report-identical-values.mjs
 *   node scripts/i18n/report-identical-values.mjs --keys=de    # identical keys for one locale
 *   node scripts/i18n/report-identical-values.mjs --keys=all   # keys identical in every locale
 *   node scripts/i18n/report-identical-values.mjs --differs=ja # excluded values the locale changed anyway
 * Test:
 *   node --test scripts/i18n/identical-values-lib.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  CLASSES,
  IDENTIFIER_MIN_LENGTH,
  auditLocale,
  collectLeaves,
  identicalInEveryLocale,
} from "./identical-values-lib.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const i18nDir = path.join(repoRoot, "src", "i18n");
const contractPath = path.join(repoRoot, "docs", "i18n", "copy-contract.json");
const sourceLocale = "en";

// Same loading as check-i18n-coverage.mjs: transpile the TS module, run it sandboxed.
function loadLocale(locale) {
  const filename = path.join(i18nDir, `${locale}.ts`);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: (specifier) => {
      throw new Error(`Unexpected runtime import "${specifier}" while loading ${locale}`);
    },
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled, sandbox, { filename });
  const translations = sandbox.module.exports[locale] ?? sandbox.exports[locale];
  if (!translations || typeof translations !== "object") {
    throw new Error(`Could not load exported locale "${locale}" from ${filename}`);
  }
  return translations;
}

function loadAcceptedTerms() {
  if (!fs.existsSync(contractPath)) return { terms: new Set(), note: "no copy contract found" };
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const accepted = contract?.terms?.accept ?? [];
  return { terms: new Set(accepted), note: `${accepted.length} terms from docs/i18n/copy-contract.json` };
}

const keysArg = process.argv.find((arg) => arg.startsWith("--keys="))?.slice("--keys=".length);
const differsArg = process.argv.find((arg) => arg.startsWith("--differs="))?.slice("--differs=".length);

const locales = fs
  .readdirSync(i18nDir)
  .filter((filename) => /^[a-z]{2}\.ts$/.test(filename))
  .map((filename) => path.basename(filename, ".ts"))
  .filter((locale) => locale !== sourceLocale)
  .sort((a, b) => a.localeCompare(b));

const { terms: acceptedTerms, note: termsNote } = loadAcceptedTerms();
const sourceLeaves = collectLeaves(loadLocale(sourceLocale));

const results = {};
for (const locale of locales) {
  results[locale] = auditLocale(sourceLeaves, collectLeaves(loadLocale(locale)), acceptedTerms);
}
const everywhere = identicalInEveryLocale(results);

if (keysArg) {
  const keys = keysArg === "all" ? everywhere : results[keysArg]?.identical;
  if (!keys) {
    console.error(`Unknown locale "${keysArg}". Use one of: ${locales.join(", ")}, all`);
  } else {
    for (const key of keys) console.log(key);
  }
  process.exit(0);
}

if (differsArg) {
  const result = results[differsArg];
  if (!result) {
    console.error(`Unknown locale "${differsArg}". Use one of: ${locales.join(", ")}`);
  } else {
    const targetLeaves = collectLeaves(loadLocale(differsArg));
    for (const key of result.differs) {
      console.log(`${key}\t${JSON.stringify(sourceLeaves.get(key))} -> ${JSON.stringify(targetLeaves.get(key))}`);
    }
  }
  process.exit(0);
}

const pad = (value, width) => String(value).padStart(width);
console.log("i18n identical-to-English report (measurement, not a gate; exits 0)");
console.log(
  `Whole-value exclusions: ${CLASSES.join(", ")} ` +
    `(identifier floor ${IDENTIFIER_MIN_LENGTH} chars; accepted terms: ${termsNote})`,
);
console.log(`English string leaves: ${sourceLeaves.size}\n`);

const header =
  "locale  checked  excluded  identical  excluded-but-differs  not-compared   " +
  CLASSES.map((name) => name).join(" ");
console.log(header);
const totals = { checked: 0, excluded: 0, identical: 0, excludedButDiffers: 0, notCompared: 0 };
for (const locale of locales) {
  const r = results[locale];
  totals.checked += r.checked;
  totals.excluded += r.excluded;
  totals.identical += r.identical.length;
  totals.excludedButDiffers += r.excludedButDiffers;
  totals.notCompared += r.notCompared;
  console.log(
    `${locale.padEnd(6)}  ${pad(r.checked, 7)}  ${pad(r.excluded, 8)}  ${pad(r.identical.length, 9)}  ` +
      `${pad(r.excludedButDiffers, 20)}  ${pad(r.notCompared, 12)}   ` +
      CLASSES.map((name) => `${name}=${r.byClass[name]}`).join(" "),
  );
}
console.log(
  `${"total".padEnd(6)}  ${pad(totals.checked, 7)}  ${pad(totals.excluded, 8)}  ${pad(totals.identical, 9)}  ` +
    `${pad(totals.excludedButDiffers, 20)}  ${pad(totals.notCompared, 12)}`,
);
console.log(`\nIdentical in all ${locales.length} locales: ${everywhere.length} keys (list with --keys=all)`);
console.log(
  "checked = English strings the locale file carries; not-compared = missing there " +
    "(renders English via the runtime fallback). identical is candidate evidence of an " +
    "untranslated value, not a verdict: brands, initialisms and cognates are legitimately identical.",
);
