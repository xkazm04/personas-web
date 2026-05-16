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

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

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

/** sha1 of a string — used purely as a content identity, not for security. */
function hashContent(s) {
  return crypto.createHash("sha1").update(s, "utf8").digest("hex").slice(0, 12);
}

/**
 * Parse the English content for a category file. The file is a tagged-template
 * literal map of topicId -> markdown string; we use a regex extraction rather
 * than dynamic import because this script runs as a plain node script outside
 * the Next.js build.
 */
function parseContentFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = {};
  // Match:   "topic-id": `\n  ...body...\n  `,
  // The body is delimited by unescaped backticks; topic IDs are kebab-case.
  const re = /"([a-z][a-z0-9-]+)":\s*`([\s\S]*?)`\s*,/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out[m[1]] = m[2];
  }
  return out;
}

/**
 * Parse topics.ts (English titles + descriptions). Same regex-extraction
 * approach as parseContentFile — we only need the topic id, title, and
 * description fields here.
 */
function parseTopicsFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = {};
  // Match a topic object literal: { id: "...", categoryId: "...", title: "...", description: "...", ... }
  // We tolerate the fields appearing in any order and allow other fields between them.
  const blockRe = /\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]*(?:\\.[^"]*)*)"[\s\S]*?description:\s*\n?\s*"([^"]*(?:\\.[^"]*)*)"/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    out[m[1]] = {
      title: m[2].replace(/\\"/g, '"'),
      description: m[3].replace(/\\"/g, '"'),
    };
  }
  return out;
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

  const guideContentDir = path.join(REPO_ROOT, "src", "data", "guide", "content");
  const topicsFile = path.join(REPO_ROOT, "src", "data", "guide", "topics.ts");
  const localesDir = path.join(REPO_ROOT, "src", "data", "guide", "locales");

  // Build English source-of-truth hashes per topic.
  const englishTopics = parseTopicsFile(topicsFile);
  const englishContent = {};

  for (const file of fs.readdirSync(guideContentDir)) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const parsed = parseContentFile(path.join(guideContentDir, file));
    Object.assign(englishContent, parsed);
  }

  const englishHashes = {};
  for (const topicId of Object.keys(englishTopics)) {
    const body = englishContent[topicId] ?? "";
    const meta = englishTopics[topicId];
    // Combined hash so a title/description change also triggers re-translation.
    const combined = JSON.stringify({ title: meta.title, description: meta.description, body });
    englishHashes[topicId] = hashContent(combined);
  }

  // Compute drift per locale.
  const localesToCheck = flags.locale ? [flags.locale] : LOCALES;
  const report = { generated: new Date().toISOString(), locales: {} };
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
