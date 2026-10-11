#!/usr/bin/env node
/**
 * Field-performance ratchet (companion to check-bundle-budget.mjs).
 *
 * Compares real-user p75 LCP / INP / CLS per route against field-budget.json.
 * The client emits them as Sentry distributions `web_vital.{lcp,inp,cls}` tagged
 * by `route` (src/components/WebVitalsReporter.tsx), only for visitors who
 * consented. This script does not talk to Sentry: export the per-route p75 and
 * sample count into a snapshot and pass it in, so the check stays offline and
 * testable.
 *
 *   node scripts/check-field-budget.mjs --input field-snapshot.json
 *
 * Snapshot shape: { "/features": { "INP": { "p75": 240, "n": 120 }, ... }, ... }
 *
 * Cells with n < minSamples are listed as "insufficient" and never gate. With
 * `warnOnly: true` (the initial state) breaches are reported but exit 0.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const METRICS = ["LCP", "INP", "CLS"];
const root = process.cwd();
const budget = JSON.parse(fs.readFileSync(path.join(root, "field-budget.json"), "utf8"));

const i = process.argv.indexOf("--input");
if (i === -1 || !process.argv[i + 1]) {
  console.error("check:field needs --input <snapshot.json> (per-route p75 + n exported from Sentry).");
  process.exit(2);
}
const snapshot = JSON.parse(fs.readFileSync(path.resolve(root, process.argv[i + 1]), "utf8"));

const fmt = (m, v) => (m === "CLS" ? v.toFixed(3) : `${Math.round(v)}ms`);
let breaches = 0;
let insufficient = 0;
let measured = 0;
let inpGood = 0;
let inpTotal = 0;

for (const [route, cells] of Object.entries(snapshot).sort()) {
  for (const m of METRICS) {
    const c = cells?.[m];
    if (!c || typeof c.p75 !== "number") continue;
    const n = c.n ?? 0;
    if (n < budget.minSamples) {
      insufficient++;
      console.log(`  .  ${route.padEnd(32)} ${m.padEnd(4)} p75 ${fmt(m, c.p75)} (n=${n} < ${budget.minSamples}, not gated)`);
      continue;
    }
    measured++;
    const ceiling = budget.routes?.[route]?.[m] ?? budget.defaults?.[m];
    if (m === "INP") {
      inpTotal++;
      if (c.p75 <= 200) inpGood++;
    }
    const over = ceiling !== undefined && c.p75 > ceiling;
    if (over) breaches++;
    console.log(
      `  ${over ? "!" : "ok"} ${route.padEnd(32)} ${m.padEnd(4)} p75 ${fmt(m, c.p75)} (n=${n}, ceiling ${ceiling === undefined ? "none" : fmt(m, ceiling)})`,
    );
  }
}

console.log(`\n${measured} gated cells, ${insufficient} below n=${budget.minSamples}, ${breaches} over ceiling.`);
if (inpTotal) console.log(`Routes with p75 INP <= 200ms: ${inpGood}/${inpTotal}.`);
if (breaches && !budget.warnOnly) process.exit(1);
if (breaches) console.log("warnOnly is set in field-budget.json: not failing.");
