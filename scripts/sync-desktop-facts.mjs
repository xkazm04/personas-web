#!/usr/bin/env node
/**
 * Snapshot the desktop app's product vocabulary into this repo.
 *
 *   npm run sync:desktop-facts              # read ../personas, rewrite the snapshot
 *   npm run sync:desktop-facts -- --check   # diff ../personas against the snapshot
 *
 * The showcase draws product facts (the memory categories, the eight design
 * dimensions and their order) that the desktop owns. Typed by hand, they drift
 * and nothing notices. This script reads the desktop's own enumerations and
 * writes src/lib/product-facts/desktop-facts.json (generated; never hand-edit,
 * commit it beside the change). src/lib/product-facts/index.ts types them, and
 * its unit test pins the literals and the showcase records to the snapshot.
 *
 * Sources (paths inside the desktop checkout):
 *   memoryCategories  src-tauri/core/src/validation/memory.rs  MEMORY_CATEGORIES
 *   cellKeys          src/lib/constants/dimensionMapping.ts     ALL_CELL_KEYS
 *
 * The desktop checkout resolves as in scripts/check-guide-coverage.mjs:
 * PERSONAS_DESKTOP_REPO when set (authoritative, no fallback), else ../personas
 * or the worktree-relative sibling.
 *
 * --check exits 0 with "skipped" when no checkout exists (a fresh clone, CI),
 * 0 when the desktop matches the snapshot, 1 on drift. Sync without a checkout
 * exits 1: there is nothing to sync from.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
export const SNAPSHOT_PATH = path.join(REPO_ROOT, "src", "lib", "product-facts", "desktop-facts.json");

export const SOURCES = {
  memoryCategories: "src-tauri/core/src/validation/memory.rs",
  cellKeys: "src/lib/constants/dimensionMapping.ts",
};

const quoted = (body) => [...body.matchAll(/"([^"\\]*)"/g)].map((m) => m[1]);

/** The string slice `pub const MEMORY_CATEGORIES: &[&str] = &[ ... ];` of memory.rs. */
export function parseMemoryCategories(text) {
  const m = /pub\s+const\s+MEMORY_CATEGORIES\s*:\s*&\[\s*&str\s*\]\s*=\s*&\[([\s\S]*?)\]\s*;/.exec(text);
  const list = m ? quoted(m[1]) : [];
  if (!list.length) throw new Error("MEMORY_CATEGORIES not found (or empty) in the desktop's memory.rs");
  return list;
}

/** The tuple `export const ALL_CELL_KEYS = [ ... ] as const;` of dimensionMapping.ts. */
export function parseCellKeys(text) {
  const m = /export\s+const\s+ALL_CELL_KEYS\s*=\s*\[([\s\S]*?)\]\s*as\s+const/.exec(text);
  const list = m ? quoted(m[1]) : [];
  if (!list.length) throw new Error("ALL_CELL_KEYS not found (or empty) in the desktop's dimensionMapping.ts");
  return list;
}

/**
 * Snapshot vs live. `live === null` means no desktop checkout: skipped, ok.
 * Membership changes land in added/removed; a same-membership reorder names
 * the list in `reordered` (cell order is part of the fact).
 */
export function diffFacts(snapshot, live) {
  if (live === null) return { ok: true, skipped: true, added: [], removed: [], reordered: [] };
  const added = [];
  const removed = [];
  const reordered = [];
  for (const key of Object.keys(SOURCES)) {
    const a = snapshot[key] ?? [];
    const b = live[key] ?? [];
    const plus = b.filter((x) => !a.includes(x));
    const minus = a.filter((x) => !b.includes(x));
    added.push(...plus);
    removed.push(...minus);
    if (!plus.length && !minus.length && a.join("\n") !== b.join("\n")) reordered.push(key);
  }
  return { ok: !added.length && !removed.length && !reordered.length, skipped: false, added, removed, reordered };
}

function resolveDesktop() {
  const isRepo = (p) => Boolean(p) && fs.existsSync(path.join(p, ".git"));
  const override = process.env.PERSONAS_DESKTOP_REPO;
  if (override) {
    if (isRepo(override)) return { path: override, reason: null, explicit: true };
    return { path: null, explicit: true, reason: `PERSONAS_DESKTOP_REPO="${override}" is not a git checkout` };
  }
  const candidates = [path.resolve(REPO_ROOT, "../personas"), path.resolve(REPO_ROOT, "../../../../personas")];
  for (const c of candidates) if (isRepo(c)) return { path: c, reason: null, explicit: false };
  return { path: null, explicit: false, reason: `no desktop checkout (looked in ${candidates.join(", ")})` };
}

export function readLive(desktop) {
  const read = (rel) => fs.readFileSync(path.join(desktop, rel), "utf8");
  return {
    memoryCategories: parseMemoryCategories(read(SOURCES.memoryCategories)),
    cellKeys: parseCellKeys(read(SOURCES.cellKeys)),
  };
}

function main() {
  const check = process.argv.slice(2).includes("--check");
  const desktop = resolveDesktop();

  if (!desktop.path) {
    // An explicit override that does not resolve is a caller error, not a skip.
    if (check && !desktop.explicit) {
      console.log(`desktop-facts: skipped - ${desktop.reason}; set PERSONAS_DESKTOP_REPO to check drift.`);
      process.exit(0);
    }
    console.error(`desktop-facts: ${desktop.reason}`);
    process.exit(1);
  }

  const live = readLive(desktop.path);

  if (check) {
    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
    const d = diffFacts(snapshot, live);
    if (d.ok) {
      console.log(`desktop-facts: in sync with ${desktop.path}`);
      process.exit(0);
    }
    console.error("desktop-facts: DRIFT between the desktop and src/lib/product-facts/desktop-facts.json");
    if (d.added.length) console.error(`  added in the desktop:   ${d.added.join(", ")}`);
    if (d.removed.length) console.error(`  removed in the desktop: ${d.removed.join(", ")}`);
    if (d.reordered.length) console.error(`  reordered:              ${d.reordered.join(", ")}`);
    console.error("  run `npm run sync:desktop-facts`, then update src/lib/product-facts/index.ts and the showcase records.");
    process.exit(1);
  }

  const out = {
    $generated: "by scripts/sync-desktop-facts.mjs from the personas desktop repo - do not hand-edit; run npm run sync:desktop-facts",
    sources: SOURCES,
    ...live,
  };
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`desktop-facts: wrote ${path.relative(REPO_ROOT, SNAPSHOT_PATH)} from ${desktop.path}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
