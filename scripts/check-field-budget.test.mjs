// node --test scripts/check-field-budget.test.mjs
//
// Pins what a field-budget (real-user p75) failure looks like. The checker
// reads field-budget.json from its cwd, so each case runs it in a temp dir
// holding an inline budget and snapshot.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-field-budget.mjs");

const budget = (over = {}) => ({
  warnOnly: false,
  minSamples: 50,
  defaults: { LCP: 2500, INP: 200, CLS: 0.1 },
  routes: {},
  ...over,
});

function run(budgetJson, snapshot, args = ["--input", "snap.json"]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "field-budget-"));
  try {
    fs.writeFileSync(path.join(dir, "field-budget.json"), JSON.stringify(budgetJson));
    fs.writeFileSync(path.join(dir, "snap.json"), JSON.stringify(snapshot));
    const r = spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: "utf8" });
    return { code: r.status, out: r.stdout, err: r.stderr };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("cells within ceiling pass", () => {
  const r = run(budget(), { "/features": { LCP: { p75: 1800, n: 120 }, INP: { p75: 150, n: 120 } } });
  assert.equal(r.code, 0);
  assert.match(r.out, /2 gated cells, 0 below n=50, 0 over ceiling/);
  assert.match(r.out, /Routes with p75 INP <= 200ms: 1\/1/);
});

test("a breach fails when warnOnly is false", () => {
  const r = run(budget(), { "/features": { INP: { p75: 340, n: 120 } } });
  assert.equal(r.code, 1);
  assert.match(r.out, /! \/features\s+INP\s+p75 340ms \(n=120, ceiling 200ms\)/);
  assert.match(r.out, /1 over ceiling/);
});

test("a breach only reports while warnOnly is true", () => {
  const r = run(budget({ warnOnly: true }), { "/features": { CLS: { p75: 0.25, n: 80 } } });
  assert.equal(r.code, 0);
  assert.match(r.out, /CLS\s+p75 0\.250/);
  assert.match(r.out, /warnOnly is set in field-budget\.json: not failing\./);
});

test("cells below minSamples never gate", () => {
  const r = run(budget(), { "/athena": { LCP: { p75: 9000, n: 10 } } });
  assert.equal(r.code, 0);
  assert.match(r.out, /n=10 < 50, not gated/);
  assert.match(r.out, /0 gated cells, 1 below n=50, 0 over ceiling/);
});

test("a per-route ceiling overrides the default", () => {
  const b = budget({ routes: { "/dashboard": { LCP: 3200 } } });
  assert.equal(run(b, { "/dashboard": { LCP: { p75: 3000, n: 60 } } }).code, 0);
  assert.equal(run(b, { "/blog": { LCP: { p75: 3000, n: 60 } } }).code, 1);
});

test("missing --input is a usage error, not a pass", () => {
  const r = run(budget(), {}, []);
  assert.equal(r.code, 2);
  assert.match(r.err, /needs --input/);
});
