#!/usr/bin/env node
/**
 * The one entry point for i18n checks: each check is a mode, and `all` runs
 * every gate in one go with a pass/fail table.
 *
 *   node scripts/i18n/check.mjs all          # every gate mode below, in order
 *   node scripts/i18n/check.mjs coverage     # one mode (several may be named)
 *   node scripts/i18n/check.mjs --list       # print the modes, run nothing
 *
 * The checks stay separate scripts because they read different things: coverage
 * and ledger read decoded locale values through ./load-locale.mjs, encoding reads
 * raw bytes (mojibake is invisible once decoded), guide reads the guide markdown
 * and its git history, and hardcoded reads the TSX source. They share one locale
 * selector (listLocaleFiles in ./load-locale.mjs). Each mode runs the body of
 * its package.json script, so the command is defined in one place.
 *
 * `hardcoded` is a report, not a gate: it always exits 0, so `all` leaves it out.
 *
 * Exits 0 when every mode passed, 1 when one failed, 2 on an unknown mode.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Mode name -> the package.json script it runs. */
export const MODES = Object.freeze({
  coverage: "check:i18n-coverage",
  encoding: "check:i18n-encoding",
  ledger: "check:i18n-ledger",
  guide: "check:guide-translations",
  hardcoded: "report:i18n-hardcoded",
});

/** The modes `all` runs: every gate, not the report. */
export const GATE_MODES = Object.freeze(["coverage", "encoding", "ledger", "guide"]);

/** The modes an argument list asks for, in order, or the unknown names. */
export function selectModes(args) {
  const names = args.filter((a) => !a.startsWith("--"));
  const wanted = names.flatMap((n) => (n === "all" ? GATE_MODES : [n]));
  const unknown = wanted.filter((n) => !(n in MODES));
  return { modes: [...new Set(wanted)], unknown };
}

function main() {
  const args = process.argv.slice(2);
  const scripts = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).scripts;
  if (args.includes("--list")) {
    for (const [mode, script] of Object.entries(MODES)) console.log(`${mode.padEnd(10)} ${scripts[script]}`);
    return;
  }

  const { modes, unknown } = selectModes(args.length ? args : ["all"]);
  if (unknown.length) {
    console.error(`i18n check: unknown mode(s) ${unknown.join(", ")}; known: all, ${Object.keys(MODES).join(", ")}`);
    process.exit(2);
  }

  const results = [];
  for (const mode of modes) {
    const command = scripts[MODES[mode]];
    console.log(`\n> ${mode}: ${command}`);
    const started = Date.now();
    const r = spawnSync(command, { cwd: REPO_ROOT, shell: true, stdio: "inherit" });
    results.push({ mode, ok: r.status === 0, seconds: ((Date.now() - started) / 1000).toFixed(1) });
  }

  console.log("\ni18n check summary");
  for (const r of results) console.log(`  ${r.ok ? "pass" : "FAIL"}  ${r.seconds.padStart(6)}s  ${r.mode}`);
  if (results.some((r) => !r.ok)) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
