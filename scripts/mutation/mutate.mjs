#!/usr/bin/env node
// Mutation check for the i18n ledger logic (scripts/i18n/ui-ledger-lib.mjs).
//
// Coverage says a line ran; it does not say a test would notice the line being wrong. This
// applies each mutant in ledger-mutants.mjs to a temporary copy of the library, runs the
// library's tests against the copy, and expects them to FAIL. A mutant they pass is a
// survivor: a wrong edit nobody would catch.
//
// The bar is every mutant killed. Adding a mutant that survives means adding the test that
// kills it (or, if no test could ever tell it from the original, dropping it as equivalent);
// never an allowance. No dependency and no extra runner: plain `node --test`.
//
// Run: `node scripts/mutation/mutate.mjs`. Exit code 1 on a survivor, a stale mutant (its
// `find` text no longer occurs exactly once), or tests that fail on the unmutated copy.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { MUTANTS, SUPPORT, TARGET, TESTS } from "./ledger-mutants.mjs";

const root = process.cwd();

function countOccurrences(haystack, needle) {
  let count = 0;
  for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, i + needle.length)) count += 1;
  return count;
}

function runTests(dir) {
  const files = TESTS.map((t) => path.join(dir, path.basename(t)));
  const res = spawnSync(process.execPath, ["--test", "--test-reporter=dot", ...files], {
    encoding: "utf8",
    timeout: 60_000,
  });
  return { passed: res.status === 0, output: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

function main() {
  const source = fs.readFileSync(path.join(root, TARGET), "utf8");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ledger-mutants-"));
  const targetCopy = path.join(dir, path.basename(TARGET));
  try {
    for (const file of [...SUPPORT, ...TESTS]) {
      fs.copyFileSync(path.join(root, file), path.join(dir, path.basename(file)));
    }

    fs.writeFileSync(targetCopy, source);
    const clean = runTests(dir);
    if (!clean.passed) {
      console.error("mutate: the tests fail on the UNMUTATED library; fix them first.\n");
      console.error(clean.output);
      process.exitCode = 1;
      return;
    }

    const stale = MUTANTS.filter((m) => countOccurrences(source, m.find) !== 1);
    if (stale.length) {
      console.error(`mutate: ${stale.length} mutant(s) no longer match ${TARGET} exactly once:`);
      for (const m of stale) console.error(`  - ${m.id}: ${JSON.stringify(m.find)}`);
      process.exitCode = 1;
      return;
    }

    const survivors = [];
    for (const m of MUTANTS) {
      fs.writeFileSync(targetCopy, source.replace(m.find, () => m.replace));
      const { passed } = runTests(dir);
      console.log(`${passed ? "SURVIVED" : "killed  "}  ${m.id}`);
      if (passed) survivors.push(m);
    }

    const killed = MUTANTS.length - survivors.length;
    const score = ((killed / MUTANTS.length) * 100).toFixed(1);
    console.log(`\nmutate: ${killed}/${MUTANTS.length} mutants killed (${score}%) in ${TARGET}`);
    if (survivors.length) {
      console.error("mutate: survivors (the tests pass against this wrong code):");
      for (const m of survivors) console.error(`  - ${m.id}: expected killer: ${m.killedBy}`);
      process.exitCode = 1;
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

main();
