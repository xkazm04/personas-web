#!/usr/bin/env node
/**
 * Component-module → feature-doc coverage.
 *
 *   node scripts/check-feature-index.mjs [--list]
 *
 * `src/lib/featureDocsCoverage.test.ts` holds docs/features/ to the app at the
 * route level: every INDEX link resolves, every doc is indexed, every
 * dashboard view and every page route is named by a doc. A route is coarse,
 * though. The landing page alone is assembled from dozens of section modules,
 * and a new one can ship with no doc naming it while every route check stays
 * green. This meter goes one level down.
 *
 * A MODULE is a first-level directory under one of MODULE_ROOTS, which is the
 * grain `context-map.json` partitions the components by. It counts as indexed
 * when some doc under docs/features/ names its path in backticks
 * (`src/components/sections/get-started/`), with or without the trailing slash, or names
 * a file inside it.
 *
 * Output: a summary line ending in `= <pct>%`; unindexed modules on stderr (or
 * stdout with `--list`). Exit code is 0 — this is a visibility meter in the
 * shape of scripts/check-route-coverage.mjs, not a gate. It exits 1 only when
 * it scanned nothing, so it can never report 100% of an empty set.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const FEATURES = path.join(repoRoot, "docs", "features");

/** Directories whose immediate children are feature modules. */
export const MODULE_ROOTS = [
  "src/components/sections",
  "src/components/feature-sections",
  "src/components/dashboard/views",
];

/** First-level directories under each root, as repo-relative posix paths. */
function modules() {
  const out = [];
  for (const root of MODULE_ROOTS) {
    const abs = path.join(repoRoot, root);
    if (!fs.existsSync(abs)) continue;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (entry.isDirectory()) out.push(`${root}/${entry.name}`);
    }
  }
  return out.sort();
}

/** Every backticked repo path in docs/features/**.md, trailing slash removed. */
function namedPaths() {
  const named = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const text = fs.readFileSync(full, "utf8");
        for (const m of text.matchAll(/`(src\/[^`\s]+)`/g)) named.add(m[1].replace(/:\d+(-\d+)?$/, "").replace(/\/$/, ""));
      }
    }
  };
  if (fs.existsSync(FEATURES)) walk(FEATURES);
  return named;
}

const all = modules();
if (all.length === 0) {
  console.error(
    `[feature-index] BROKEN CHECKER: found 0 module directories under ${MODULE_ROOTS.join(", ")}.\n` +
      "  A coverage meter that scans nothing cannot honestly report a percentage.",
  );
  process.exit(1);
}

const named = [...namedPaths()];
const missing = all.filter((m) => !named.some((p) => p === m || p.startsWith(`${m}/`)));
const hit = all.length - missing.length;

const wantList = process.argv.includes("--list");
for (const m of missing) (wantList ? console.log : console.error)(`  unindexed: ${m}/`);

console.log(
  `[feature-index] ${hit}/${all.length} component modules named by a docs/features doc = ${((hit / all.length) * 100).toFixed(1)}%`,
);
