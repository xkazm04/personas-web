// Loads a src/i18n TypeScript module: transpile it, run it sandboxed, return its export.
// The one loader behind check-i18n-coverage.mjs (core locales, pending modules and
// catalog section parts), report-identical-values.mjs and ui-ledger.mjs, so no two
// i18n checks can disagree on what a locale "says". listLocaleFiles is the one locale
// selector, shared with check-i18n-encoding.mjs, so they cannot disagree on which
// files are locales either.
//
// The strings come out DECODED (a JS value, not file bytes), which is what any hash of
// catalog content must be taken over: some files carry mojibake on disk.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

// A locale file is <lang>[-<Region|Script>].ts - e.g. en.ts, pt-BR.ts, zh-Hant.ts.
// One selector for every check: a region-coded locale added later is read by all of
// them or fails all of them loudly, never skipped by some while the others pass.
const LOCALE_FILE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*\.ts$/;
// Modules that live in src/i18n but are not locale message files.
const NON_LOCALE_FILES = new Set(["useTranslation.ts", "index.ts", "types.ts"]);

/** The locale message files directly in `i18nDir` (`en.ts`, `de.ts`, ...), sorted. */
export function listLocaleFiles(i18nDir) {
  return fs
    .readdirSync(i18nDir)
    .filter((f) => !NON_LOCALE_FILES.has(f) && LOCALE_FILE.test(f))
    .sort();
}

/** The locale codes in `i18nDir` (`en`, `de`, ...), sorted. */
export function listLocales(i18nDir) {
  return listLocaleFiles(i18nDir).map((f) => path.basename(f, ".ts"));
}

/** Runs a transpiled TS file and returns its CommonJS exports object. */
export function evalTsModule(filename) {
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
      throw new Error(`Unexpected runtime import "${specifier}" while loading ${filename}`);
    },
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled, sandbox, { filename });
  return sandbox.module.exports;
}

export function loadLocale(i18nDir, locale) {
  const filename = path.join(i18nDir, `${locale}.ts`);
  const exported = evalTsModule(filename);
  const translations = exported[locale];
  if (!translations || typeof translations !== "object") {
    throw new Error(`Could not load exported locale "${locale}" from ${filename}`);
  }
  return translations;
}

/** The English-only `<namespace>Copy` const of each src/i18n/pending/*.ts module. */
export function loadPendingNamespaces(i18nDir) {
  const dir = path.join(i18nDir, "pending");
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
    const namespace = path.basename(file, ".ts");
    const exported = evalTsModule(path.join(dir, file));
    const copy = exported[`${namespace}Copy`];
    if (!copy || typeof copy !== "object") {
      throw new Error(`pending/${file} does not export "${namespace}Copy"`);
    }
    out[namespace] = copy;
  }
  return out;
}
