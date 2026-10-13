#!/usr/bin/env node
/**
 * The one after-change command: runs the gates CI's `checks` job runs, in the
 * same order, and stops at the first failure.
 *
 *   node scripts/verify.mjs          # every check before `npm run build`
 *   node scripts/verify.mjs --full   # also build and the bundle budget
 *   node scripts/verify.mjs --list   # print the steps, run nothing
 *
 * The step list is read from .github/workflows/ci.yml at run time, not copied
 * here, so a gate added to CI is a gate this command runs the same day. The
 * split is the build: everything before `npm run build` is the fast tier
 * (about the time CI's checks take minus the build), the build and every step
 * after it (the bundle budget reads the build's output) run only with --full.
 *
 * Exits 0 when every step passed, 1 on the first failing step, 2 when ci.yml
 * has no readable `checks` job.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CI_FILE = path.join(REPO_ROOT, ".github", "workflows", "ci.yml");

/** Steps that set the runner up rather than check anything. */
const SETUP_STEPS = new Set(["npm ci"]);

/** The step that starts the slow tier. */
const BUILD_STEP = "npm run build";

/**
 * The `run:` commands of the `checks` job in a workflow file, split at the
 * build into `fast` and `full` (the build and everything after it).
 *
 * @param {string} yaml
 * @returns {{ fast: string[], full: string[] }}
 */
export function ciSteps(yaml) {
  const fast = [];
  const full = [];
  let inChecks = false;
  let slow = false;
  for (const line of yaml.split(/\r?\n/)) {
    if (/^ {2}checks:\s*$/.test(line)) {
      inChecks = true;
      continue;
    }
    if (inChecks && /^ {2}\S/.test(line)) break;
    if (!inChecks) continue;
    const m = /^\s+- run:\s*(.+?)\s*$/.exec(line);
    if (!m || SETUP_STEPS.has(m[1])) continue;
    if (m[1] === BUILD_STEP) slow = true;
    (slow ? full : fast).push(m[1]);
  }
  return { fast, full };
}

/** The npm script names a list of commands calls (`npm run <name>`). */
export function npmScriptsOf(commands) {
  const out = [];
  for (const c of commands) {
    const m = /^npm run (\S+)/.exec(c);
    if (m) out.push(m[1]);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const { fast, full } = ciSteps(fs.readFileSync(CI_FILE, "utf8"));
  if (!fast.length) {
    console.error(`verify: no \`checks\` job steps found in ${path.relative(REPO_ROOT, CI_FILE)}`);
    process.exit(2);
  }
  const steps = args.includes("--full") ? [...fast, ...full] : fast;
  if (args.includes("--list")) {
    for (const s of steps) console.log(s);
    return;
  }

  const results = [];
  let failed = null;
  for (const step of steps) {
    console.log(`\n> ${step}`);
    const started = Date.now();
    const r = spawnSync(step, { cwd: REPO_ROOT, shell: true, stdio: "inherit" });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    const ok = r.status === 0;
    results.push({ step, seconds, ok });
    if (!ok) {
      failed = step;
      break;
    }
  }

  console.log("\nverify summary");
  for (const r of results) console.log(`  ${r.ok ? "pass" : "FAIL"}  ${r.seconds.padStart(6)}s  ${r.step}`);
  const skipped = steps.length - results.length;
  if (skipped) console.log(`  (${skipped} later step(s) not run)`);
  if (!args.includes("--full")) console.log(`  build + bundle budget not run; add --full for: ${full.join(", ")}`);
  if (failed) {
    console.error(`\nverify failed at: ${failed}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
