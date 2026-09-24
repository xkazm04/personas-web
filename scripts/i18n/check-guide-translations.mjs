#!/usr/bin/env node
// Drift detector for guide-content translations - a thin CLI over the
// history-anchored classifier in ./guide-drift.mjs.
//
// Each locale's src/data/guide/locales/<lang>/_meta.json pins, per topic, the
// hash of the English unit the translation was made from. A pin that differs
// from today's hash is NOT assumed stale: the classifier finds the English
// revision the pin was taken from (verifying it byte-for-byte under a closed
// set of instrument variants), and reports only a real English change as
// stale. Line-ending and extractor churn is named (instrument:eol,
// instrument:extractor) and folded into fresh; a pin it cannot verify is
// stale/unverified, never fresh. No pin is rewritten.
//
// Output:
//   default        - human-readable summary, every verdict with its cause
//   --json         - machine-readable JSON (findings carry both hashes, the
//                    anchor revision and, for content-stale, the English diff)
//   --work-order   - per-topic re-translation list with the English line diff
//                    since the anchor (feeds the refresh mode of
//                    translate-guide-subagent-prompt.md); with --json, as JSON
//   --strict       - exit 1 on stale (content | unverified) or missing;
//                    instrument-only differences exit 0
//   --locale=<l>   - restrict to one locale
//   --topic=<id>   - restrict to one topic across all locales
//
// Exit codes: 0 ok, 1 drift under --strict, 2 usage / broken instrument,
// 3 history unavailable (shallow clone, no git). A checkout without full
// history gets exit 3 and no numbers - never a clean report.
//
// Companion: scripts/i18n/translate-guide-subagent-prompt.md
// (the prompt template subagents use when bootstrapping or refreshing
// a locale).
//
// Source extraction and hashing live in ./guide-source.mjs, shared verbatim
// with emit-source-hashes.mjs. Do not re-implement either here: the two sides
// must agree on the EXTRACTION as well as the digest, and a hand-copied
// duplicate is exactly how they previously stayed identically wrong.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { readEnglishGuide } from "./guide-source.mjs";
import { createGitHistory, currentHashes, runDriftCheck, GUIDE_LOCALES, EXIT } from "./guide-drift.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function parseArgs(argv) {
  const flags = { json: false, strict: false, workOrder: false, locale: null, topic: null };
  for (const a of argv) {
    if (a === "--json") flags.json = true;
    else if (a === "--strict") flags.strict = true;
    else if (a === "--work-order") flags.workOrder = true;
    else if (a.startsWith("--locale=")) flags.locale = a.slice("--locale=".length);
    else if (a.startsWith("--topic=")) flags.topic = a.slice("--topic=".length);
  }
  return flags;
}

function fail(message) {
  console.error(`[guide-translations] ${message}`);
  process.exitCode = EXIT.USAGE;
}

function main() {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.locale && !GUIDE_LOCALES.includes(flags.locale)) {
    return fail(`Unknown locale "${flags.locale}". Known: ${GUIDE_LOCALES.join(", ")}`);
  }

  // readEnglishGuide asserts the instrument (non-empty corpus, every declared
  // topic has a body) and is the pin definition emit-source-hashes.mjs uses.
  let english;
  try {
    english = readEnglishGuide(REPO_ROOT);
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
  if (flags.topic && !english.hashes[flags.topic]) {
    return fail(`Unknown topic "${flags.topic}" - not present in topics.ts.`);
  }

  const history = createGitHistory(REPO_ROOT);

  // The classifier reads the working tree itself; it must hash it exactly as
  // the emitter does, or every "exact" verdict is meaningless.
  const mine = currentHashes(history);
  const disagree = Object.keys(english.hashes).filter((id) => mine[id] !== english.hashes[id]);
  if (disagree.length > 0 || Object.keys(mine).length !== Object.keys(english.hashes).length) {
    return fail(`Classifier and emitter disagree on today's hash for ${disagree.length} topic(s): ${disagree.slice(0, 5).join(", ")}`);
  }

  const out = runDriftCheck({
    history,
    locales: flags.locale ? [flags.locale] : GUIDE_LOCALES,
    flags,
    now: new Date().toISOString(),
  });
  if (out.stdout) console.log(out.stdout);
  if (out.stderr) console.error(out.stderr);
  // exitCode, not exit(): exit() can truncate a large --json write to a pipe.
  process.exitCode = out.exitCode;
}

main();
