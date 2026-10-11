// Loads a src/i18n TypeScript module the way the coverage checker does: transpile it,
// run it sandboxed, return its export. Shared by report-identical-values.mjs and
// ui-ledger.mjs so the two cannot disagree on what a locale "says".
//
// The strings come out DECODED (a JS value, not file bytes), which is what any hash of
// catalog content must be taken over: some files carry mojibake on disk.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

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
