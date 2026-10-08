#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import ts from "typescript";

const repoRoot = process.cwd();
const i18nDir = path.join(repoRoot, "src", "i18n");
const baselineLocale = "en";

function loadLocaleModule(locale) {
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
      throw new Error(`Unexpected runtime import "${specifier}" while checking ${locale}`);
    },
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled, sandbox, { filename });

  const moduleExports = sandbox.module.exports;
  const translations = moduleExports[locale] ?? sandbox.exports[locale];
  if (!translations || typeof translations !== "object") {
    throw new Error(`Could not load exported locale "${locale}" from ${filename}`);
  }
  return { translations, moduleExports };
}

function loadLocale(locale) {
  return loadLocaleModule(locale).translations;
}

function countLeaves(value) {
  if (typeof value === "string") return 1;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countLeaves(item), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce((sum, item) => sum + countLeaves(item), 0);
  }
  return 0;
}

function listLocaleFiles() {
  return fs
    .readdirSync(i18nDir)
    .filter((filename) => /^[a-z]{2}\.ts$/.test(filename))
    .map((filename) => path.basename(filename, ".ts"))
    .sort((a, b) => a.localeCompare(b));
}

function describe(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function compareShape(expected, actual, pathParts, issues) {
  const keyPath = pathParts.join(".");

  if (typeof expected === "string") {
    if (typeof actual !== "string") {
      issues.push(`${keyPath}: expected string, found ${describe(actual)}`);
    } else if (actual.trim().length === 0) {
      issues.push(`${keyPath}: empty translation`);
    }
    return;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      issues.push(`${keyPath}: expected array, found ${describe(actual)}`);
      return;
    }
    if (actual.length !== expected.length) {
      issues.push(`${keyPath}: expected ${expected.length} items, found ${actual.length}`);
    }

    const length = Math.min(expected.length, actual.length);
    for (let index = 0; index < length; index += 1) {
      compareShape(expected[index], actual[index], [...pathParts, String(index)], issues);
    }
    return;
  }

  if (expected && typeof expected === "object") {
    if (!actual || typeof actual !== "object" || Array.isArray(actual)) {
      issues.push(`${keyPath}: expected object, found ${describe(actual)}`);
      return;
    }

    for (const key of Object.keys(expected)) {
      if (!(key in actual)) {
        issues.push(`${[...pathParts, key].join(".")}: missing translation`);
        continue;
      }
      compareShape(expected[key], actual[key], [...pathParts, key], issues);
    }
    return;
  }

  if (typeof actual !== typeof expected) {
    issues.push(`${keyPath}: expected ${describe(expected)}, found ${describe(actual)}`);
  }
}

const locales = listLocaleFiles();
const { translations: fullBaseline, moduleExports: baselineExports } =
  loadLocaleModule(baselineLocale);
const targetLocales = locales.filter((locale) => locale !== baselineLocale);

// Namespaces the owner decided to ship English-only for now (PLAN M4) live in
// src/i18n/pending/<namespace>.ts, off the shared en.ts bundle (PLAN M22): one
// module per namespace exporting `<namespace>Copy` (the Copy suffix is what
// lets copy:check read it as a dictionary). They are not compared here, only
// counted and reported. What IS failed on: a pending module whose export does
// not match its filename, and a namespace that is both pending and in en.ts or
// a locale (a translated namespace moves back into en.ts and its pending module
// is deleted - never both). en.ts itself carries no pending namespaces any
// more: every namespace in it is held to 100% in all 13 locales.
if ("PENDING_TRANSLATION" in baselineExports) {
  console.error(
    "en.ts exports PENDING_TRANSLATION again. English-only namespaces live in src/i18n/pending/ " +
      "(PLAN M22) so that only their routes bundle them; en.ts holds translated namespaces only.",
  );
  process.exit(1);
}

const pendingDir = path.join(i18nDir, "pending");
const pendingModules = fs.existsSync(pendingDir)
  ? fs
      .readdirSync(pendingDir)
      .filter((filename) => filename.endsWith(".ts") && !filename.endsWith(".test.ts"))
      .sort((a, b) => a.localeCompare(b))
  : [];
const pendingModuleCopy = {};
for (const filename of pendingModules) {
  const ns = path.basename(filename, ".ts");
  const file = path.join(pendingDir, filename);
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  }).outputText;
  const sandbox = { exports: {}, module: { exports: {} } };
  sandbox.exports = sandbox.module.exports;
  sandbox.require = (specifier) => {
    throw new Error(`Unexpected runtime import "${specifier}" in pending module ${filename}`);
  };
  vm.runInNewContext(compiled, sandbox, { filename: file });
  const copy = sandbox.module.exports[`${ns}Copy`];
  if (!copy || typeof copy !== "object") {
    console.error(`src/i18n/pending/${filename} must export a const named "${ns}Copy" (its filename + Copy).`);
    process.exit(1);
  }
  if (ns in fullBaseline) {
    console.error(
      `"${ns}" is both a pending module (src/i18n/pending/${filename}) and a namespace in en.ts. ` +
        "A translated namespace moves back into en.ts and its pending module is deleted.",
    );
    process.exit(1);
  }
  pendingModuleCopy[ns] = copy;
}
for (const locale of targetLocales) {
  const translations = loadLocale(locale);
  for (const ns of Object.keys(pendingModuleCopy)) {
    if (ns in translations) {
      console.error(
        `${locale}.ts carries "${ns}", which is still a pending module (src/i18n/pending/${ns}.ts). ` +
          "Move the namespace back into en.ts before translating it.",
      );
      process.exit(1);
    }
  }
}

const pendingNamespaces = Object.keys(pendingModuleCopy);
const baseline = fullBaseline;

let failed = false;

for (const locale of targetLocales) {
  const issues = [];
  compareShape(baseline, loadLocale(locale), [locale], issues);

  if (issues.length > 0) {
    failed = true;
    console.error(`\n${locale}: ${issues.length} i18n coverage issue${issues.length === 1 ? "" : "s"}`);
    for (const issue of issues) {
      console.error(`  - ${issue}`);
    }
  } else {
    console.log(`${locale}: 100%`);
  }
}

if (pendingNamespaces.length > 0) {
  const pendingKeys = pendingNamespaces.reduce((sum, ns) => sum + countLeaves(pendingModuleCopy[ns]), 0);
  console.log(
    `
pending translation (English only, by owner decision; src/i18n/pending/): ${pendingKeys} keys in ` +
      `${pendingNamespaces.length} namespaces: ${pendingNamespaces.join(", ")}`,
  );
}

if (failed) {
  console.error("\nI18n coverage must be 100% for every non-English locale before pushing.");
  process.exit(1);
}

console.log(`\nI18n coverage is 100% across ${targetLocales.length} locale${targetLocales.length === 1 ? "" : "s"}.`);
