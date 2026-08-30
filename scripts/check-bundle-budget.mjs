#!/usr/bin/env node
/**
 * Bundle-size ratchet.
 *
 * Reads the per-route first-load JS that `next build` writes to
 * `.next/diagnostics/route-bundle-stats.json` and compares it against the
 * committed budget in `bundle-budget.json`. Fails when a route grows past its
 * ceiling, so the code-splitting work can't silently erode.
 *
 * Why this exists: Next 16's build output no longer prints Size / First Load JS
 * columns, so nothing in the repo could see bundle weight at all. A 344 KB
 * recharts chunk sat in three dashboard routes' first load for months without
 * anything noticing.
 *
 *   npm run build && npm run check:bundle    # verify
 *   npm run check:bundle -- --update         # re-baseline after a deliberate change
 *
 * The budget stores a ceiling per route (measured + TOLERANCE_KB) rather than
 * the exact number, so ordinary churn doesn't cause noise. A route that comes
 * in far UNDER its ceiling is reported too — that's a win worth re-baselining.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const STATS = path.join(repoRoot, ".next", "diagnostics", "route-bundle-stats.json");
const BUDGET = path.join(repoRoot, "bundle-budget.json");

/** Headroom over the measured value, per route. */
const TOLERANCE_KB = 40;
/** Report (don't fail) when a route is this far under its ceiling. */
const SLACK_REPORT_KB = 80;

const update = process.argv.includes("--update");
const kb = (bytes) => bytes / 1024;
const fmt = (n) => n.toFixed(0).padStart(5);

if (!fs.existsSync(STATS)) {
  console.error(
    "check:bundle — no build stats found at .next/diagnostics/route-bundle-stats.json\n" +
      "Run `npm run build` first (the stats are a build artifact, not checked in).",
  );
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(STATS, "utf8"));
const rows = Object.values(stats);
if (!rows.length) {
  console.error("check:bundle — build stats are empty; the build may have failed.");
  process.exit(1);
}

const measured = new Map(rows.map((r) => [r.route, kb(r.firstLoadUncompressedJsBytes)]));

// Chunks every route loads: the floor nothing can avoid paying.
const sets = rows.map((r) => new Set(r.firstLoadChunkPaths));
const sharedChunks = [...sets[0]].filter((c) => sets.every((s) => s.has(c)));
let sharedKB = 0;
for (const c of sharedChunks) {
  try {
    sharedKB += kb(fs.statSync(c).size);
  } catch {
    /* chunk hashed away between build and check; the route totals still hold */
  }
}

if (update) {
  const budget = {
    $comment:
      "Ceilings for first-load uncompressed JS, in KB. Regenerate with `npm run check:bundle -- --update` " +
      "after a deliberate change, and say why in the commit message.",
    generatedAt: new Date().toISOString().slice(0, 10),
    toleranceKB: TOLERANCE_KB,
    sharedBaselineKB: Math.round(sharedKB + TOLERANCE_KB),
    routes: Object.fromEntries(
      [...measured.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([route, v]) => [route, Math.round(v + TOLERANCE_KB)]),
    ),
  };
  fs.writeFileSync(BUDGET, JSON.stringify(budget, null, 2) + "\n");
  console.log(
    `check:bundle — wrote ${path.basename(BUDGET)}: ${measured.size} routes, ` +
      `shared baseline ${sharedKB.toFixed(0)} KB (ceiling ${budget.sharedBaselineKB} KB).`,
  );
  process.exit(0);
}

if (!fs.existsSync(BUDGET)) {
  console.error("check:bundle — no bundle-budget.json. Create it with `npm run check:bundle -- --update`.");
  process.exit(1);
}

const budget = JSON.parse(fs.readFileSync(BUDGET, "utf8"));
const over = [];
const under = [];
const unbudgeted = [];

for (const [route, value] of measured) {
  const ceiling = budget.routes[route];
  if (ceiling === undefined) {
    unbudgeted.push([route, value]);
    continue;
  }
  if (value > ceiling) over.push([route, value, ceiling]);
  else if (ceiling - value > SLACK_REPORT_KB) under.push([route, value, ceiling]);
}

const removed = Object.keys(budget.routes).filter((r) => !measured.has(r));

if (budget.sharedBaselineKB && sharedKB > budget.sharedBaselineKB) {
  over.push(["(shared baseline — every route pays this)", sharedKB, budget.sharedBaselineKB]);
}

if (under.length) {
  console.log("check:bundle — routes now well under budget (re-baseline to lock the win in):");
  for (const [route, v, c] of under) console.log(`  ${fmt(v)} KB  (ceiling ${c})  ${route}`);
  console.log("");
}
if (unbudgeted.length) {
  console.log("check:bundle — routes with no budget entry (add one with --update):");
  for (const [route, v] of unbudgeted) console.log(`  ${fmt(v)} KB  ${route}`);
  console.log("");
}
if (removed.length) {
  console.log(`check:bundle — ${removed.length} budgeted route(s) no longer built: ${removed.join(", ")}\n`);
}

if (over.length) {
  console.error("check:bundle — FAILED. First-load JS grew past its ceiling:\n");
  for (const [route, v, c] of over) {
    console.error(`  ${fmt(v)} KB  exceeds ${c} KB by ${(v - c).toFixed(0)} KB  ${route}`);
  }
  console.error(
    "\nIf the growth is intended, re-baseline with `npm run check:bundle -- --update` and say why in the\n" +
      "commit message. If it is not, the usual cause is a heavy module imported statically into a route:\n" +
      "defer it with `dynamic(() => import(...), { ssr: false })` — see the chart cards under\n" +
      "src/components/dashboard/ for the established shape.",
  );
  process.exit(1);
}

console.log(
  `check:bundle — OK. ${measured.size} routes within budget; ` +
    `shared baseline ${sharedKB.toFixed(0)} KB / ${budget.sharedBaselineKB} KB.`,
);
