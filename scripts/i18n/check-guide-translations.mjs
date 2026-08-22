#!/usr/bin/env node
// Drift detector for guide-content translations.
//
// Reads English source (src/data/guide/content/*.ts + topics.ts), computes
// a content hash per topic, and compares against the per-locale
// src/data/guide/locales/<lang>/_meta.json that records the source hash at
// translation time. Any topic whose current hash differs from its locale's
// recorded hash is drift-flagged.
//
// Output:
//   default        — human-readable summary
//   --json         — machine-readable JSON for CI integration
//   --strict       — exit 1 if any drift exists (release gate)
//   --locale=<l>   — restrict to one locale
//   --topic=<id>   — restrict to one topic across all locales
//
// Companion: scripts/i18n/translate-guide-subagent-prompt.md
// (the prompt template subagents use when bootstrapping or refreshing
// a locale).
//
// Source extraction and hashing live in ./guide-source.mjs, shared verbatim
// with emit-source-hashes.mjs. Do not re-implement either here: the two sides
// must agree on the EXTRACTION as well as the digest, and a hand-copied
// duplicate is exactly how they previously stayed identically wrong.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readEnglishGuide } from "./guide-source.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const LOCALES = ["zh", "ar", "hi", "ru", "id", "es", "fr", "bn", "ja", "vi", "de", "ko", "cs"];

function parseArgs(argv) {
  const flags = { json: false, strict: false, locale: null, topic: null };
  for (const a of argv) {
    if (a === "--json") flags.json = true;
    else if (a === "--strict") flags.strict = true;
    else if (a.startsWith("--locale=")) flags.locale = a.slice("--locale=".length);
    else if (a.startsWith("--topic=")) flags.topic = a.slice("--topic=".length);
  }
  return flags;
}

function readMeta(localeDir) {
  const metaPath = path.join(localeDir, "_meta.json");
  if (!fs.existsSync(metaPath)) return { topics: {} };
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    return { topics: {} };
  }
}

function main() {
  const flags = parseArgs(process.argv.slice(2));

  const localesDir = path.join(REPO_ROOT, "src", "data", "guide", "locales");

  // Build English source-of-truth hashes per topic. readEnglishGuide throws if
  // the corpus is empty or a declared topic has no extractable body, so a
  // "clean" report below always means it measured something real.
  const { hashes: englishHashes, stats } = readEnglishGuide(REPO_ROOT);

  // Compute drift per locale.
  if (flags.locale && !LOCALES.includes(flags.locale)) {
    console.error(
      `[guide-translations] Unknown locale "${flags.locale}". Known: ${LOCALES.join(", ")}`,
    );
    process.exit(1);
  }
  if (flags.topic && !englishHashes[flags.topic]) {
    console.error(`[guide-translations] Unknown topic "${flags.topic}" — not present in topics.ts.`);
    process.exit(1);
  }

  const localesToCheck = flags.locale ? [flags.locale] : LOCALES;
  const report = { generated: new Date().toISOString(), source: stats, locales: {} };
  let totalDrift = 0;

  for (const lang of localesToCheck) {
    const localeDir = path.join(localesDir, lang);
    const meta = readMeta(localeDir);
    const localeReport = { stale: [], missing: [], orphaned: [], fresh: [] };

    for (const topicId of Object.keys(englishHashes)) {
      if (flags.topic && flags.topic !== topicId) continue;
      const englishHash = englishHashes[topicId];
      const localeMeta = meta.topics?.[topicId];
      if (!localeMeta) {
        localeReport.missing.push(topicId);
        totalDrift++;
      } else if (localeMeta.translatedFromHash !== englishHash) {
        localeReport.stale.push({
          topicId,
          currentHash: englishHash,
          translatedHash: localeMeta.translatedFromHash,
          translatedAt: localeMeta.translatedAt,
        });
        totalDrift++;
      } else {
        localeReport.fresh.push(topicId);
      }
    }

    // Orphaned: locale has a translation for a topic that no longer exists.
    for (const topicId of Object.keys(meta.topics ?? {})) {
      if (!englishHashes[topicId]) {
        localeReport.orphaned.push(topicId);
      }
    }

    report.locales[lang] = localeReport;
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `English source: ${stats.topicCount} topics, ${stats.bodyCount} bodies, ` +
        `${stats.contentFiles} content file(s)\n`,
    );
    let any = false;
    for (const [lang, r] of Object.entries(report.locales)) {
      const issues = r.stale.length + r.missing.length + r.orphaned.length;
      if (issues === 0) {
        console.log(`${lang}: clean (${r.fresh.length} topics fresh)`);
        continue;
      }
      any = true;
      console.log(`${lang}: ${issues} issue(s)`);
      if (r.missing.length) console.log(`  missing (${r.missing.length}): ${r.missing.slice(0, 5).join(", ")}${r.missing.length > 5 ? ", ..." : ""}`);
      if (r.stale.length) console.log(`  stale   (${r.stale.length}): ${r.stale.slice(0, 5).map((s) => s.topicId).join(", ")}${r.stale.length > 5 ? ", ..." : ""}`);
      if (r.orphaned.length) console.log(`  orphan  (${r.orphaned.length}): ${r.orphaned.slice(0, 5).join(", ")}${r.orphaned.length > 5 ? ", ..." : ""}`);
    }
    if (!any) console.log("\nAll locales fresh.");
    console.log(`\nTotal drift: ${totalDrift} topic(s) across ${localesToCheck.length} locale(s)`);
  }

  if (flags.strict && totalDrift > 0) process.exit(1);
  process.exit(0);
}

main();
