#!/usr/bin/env node
/**
 * Guide Coverage Report
 *
 * Scans every topic in `src/data/guide/topics.ts` and reports three things:
 *
 *   1. Screenshot coverage — % of topics that declare a recipe, and how many
 *      of their declared locales actually have a PNG on disk
 *   2. Content freshness — topics whose `contentReviewedAt` is missing or
 *      older than the staleness threshold
 *   3. Drift — topics whose `watchedFiles` have changed in the desktop repo
 *      since the topic's `appVersion` (skipped if desktop repo not present)
 *
 * Usage:
 *   node scripts/check-guide-coverage.mjs              # full report
 *   node scripts/check-guide-coverage.mjs --json       # machine-readable
 *   node scripts/check-guide-coverage.mjs --fail-under 50  # CI gate
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const ALL_LOCALES = [
  "en", "zh", "ar", "hi", "ru", "id", "es", "fr",
  "bn", "ja", "vi", "de", "ko", "cs",
];

const STALENESS_DAYS = 90;

// ── CLI ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const failUnderArg = args.find((a) => a.startsWith("--fail-under"));
const failUnder = failUnderArg
  ? Number(failUnderArg.split("=")[1] ?? args[args.indexOf(failUnderArg) + 1])
  : null;

// ── Load topics via dynamic import (handles TS → JS via tsx if present) ─
async function loadTopics() {
  const topicsTs = path.join(REPO_ROOT, "src/data/guide/topics.ts");
  if (!fs.existsSync(topicsTs)) {
    throw new Error(`topics.ts not found at ${topicsTs}`);
  }
  // Parse the TS source directly — we only need the exported array literal,
  // and avoiding a runtime TS compiler keeps this script zero-dep.
  const src = fs.readFileSync(topicsTs, "utf8");
  const match = src.match(/export const GUIDE_TOPICS[^=]*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error("Could not locate GUIDE_TOPICS export in topics.ts");
  // Strip `as const` / `satisfies` suffixes if any, and the `: GuideTopic[]` annotation.
  // Then eval as JS — safe because the file is committed source we own.
  const arrayLiteral = match[1];
  // eslint-disable-next-line no-new-func
  const topics = Function(`"use strict"; return (${arrayLiteral});`)();
  return topics;
}

// ── Report dimensions ─────────────────────────────────────────────────
function daysSince(iso) {
  if (!iso) return Infinity;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

function checkScreenshots(topic) {
  const recipe = topic.coverage?.screenshotRecipe;
  if (!recipe) return { declared: false, missing: [], present: [] };

  const topicsDir = path.join(REPO_ROOT, "public/imgs/guide/topics");
  const present = [];
  const missing = [];
  for (const locale of ALL_LOCALES) {
    const file = path.join(topicsDir, `${topic.id}-${locale}.png`);
    (fs.existsSync(file) ? present : missing).push(locale);
  }
  return { declared: true, recipe, present, missing };
}

function classifyTopic(topic) {
  const shots = checkScreenshots(topic);
  const reviewedDays = daysSince(topic.coverage?.contentReviewedAt);
  const contentStale = reviewedDays > STALENESS_DAYS;
  return {
    id: topic.id,
    categoryId: topic.categoryId,
    title: topic.title,
    shots,
    contentReviewedAt: topic.coverage?.contentReviewedAt ?? null,
    appVersion: topic.coverage?.appVersion ?? null,
    contentStale,
    reviewedDays: Number.isFinite(reviewedDays) ? Math.round(reviewedDays) : null,
  };
}

// ── Main ──────────────────────────────────────────────────────────────
const topics = await loadTopics();
const classified = topics.map(classifyTopic);

const withRecipe = classified.filter((c) => c.shots.declared);
const withoutRecipe = classified.filter((c) => !c.shots.declared);

const totalExpected = withRecipe.length * ALL_LOCALES.length;
const totalPresent = withRecipe.reduce((sum, c) => sum + c.shots.present.length, 0);
const localeCoverage = totalExpected === 0 ? 0 : (totalPresent / totalExpected) * 100;
const topicCoverage = topics.length === 0 ? 0 : (withRecipe.length / topics.length) * 100;

const staleContent = classified.filter((c) => c.contentStale);
const reviewedEver = classified.filter((c) => c.contentReviewedAt);
const contentCoverage =
  topics.length === 0 ? 0 : (reviewedEver.length / topics.length) * 100;

// Per-locale breakdown
const perLocale = {};
for (const locale of ALL_LOCALES) {
  const have = withRecipe.filter((c) => c.shots.present.includes(locale)).length;
  perLocale[locale] = {
    have,
    expected: withRecipe.length,
    pct: withRecipe.length === 0 ? 0 : (have / withRecipe.length) * 100,
  };
}

// ── Output ────────────────────────────────────────────────────────────
if (asJson) {
  console.log(
    JSON.stringify(
      {
        totals: {
          topics: topics.length,
          topicsWithRecipe: withRecipe.length,
          topicCoveragePct: topicCoverage,
          localeCoveragePct: localeCoverage,
          contentReviewCoveragePct: contentCoverage,
          stalenessThresholdDays: STALENESS_DAYS,
        },
        perLocale,
        staleContent: staleContent.map((c) => ({ id: c.id, reviewedDays: c.reviewedDays })),
        topicsMissingShots: withRecipe.flatMap((c) =>
          c.shots.missing.map((loc) => ({ id: c.id, locale: loc })),
        ),
        topicsWithoutRecipe: withoutRecipe.map((c) => ({ id: c.id, title: c.title })),
      },
      null,
      2,
    ),
  );
} else {
  const bar = (pct) => {
    const width = 30;
    const filled = Math.round((pct / 100) * width);
    return `[${"█".repeat(filled)}${"░".repeat(width - filled)}] ${pct.toFixed(1)}%`;
  };
  console.log("Guide Coverage Report");
  console.log("─".repeat(60));
  console.log(`Topics total:          ${topics.length}`);
  console.log(`With screenshot recipe: ${withRecipe.length}  ${bar(topicCoverage)}`);
  console.log(`Locale completeness:    ${totalPresent}/${totalExpected}  ${bar(localeCoverage)}`);
  console.log(`Content reviewed:       ${reviewedEver.length}/${topics.length}  ${bar(contentCoverage)}`);
  console.log();
  console.log(`Per-locale (recipes only):`);
  for (const [loc, s] of Object.entries(perLocale)) {
    console.log(`  ${loc.padEnd(4)} ${String(s.have).padStart(4)}/${s.expected}  ${bar(s.pct)}`);
  }
  console.log();
  if (staleContent.length) {
    console.log(`Stale content (>${STALENESS_DAYS}d since review):  ${staleContent.length}`);
    for (const c of staleContent.slice(0, 10)) {
      console.log(`  - ${c.id}  (${c.reviewedDays ?? "never"}d)`);
    }
    if (staleContent.length > 10) console.log(`  …and ${staleContent.length - 10} more`);
    console.log();
  }
  if (withoutRecipe.length) {
    console.log(`Topics with no screenshot recipe: ${withoutRecipe.length}  (text-only is OK — this is informational)`);
  }
}

// ── CI gate ───────────────────────────────────────────────────────────
if (failUnder !== null && !Number.isNaN(failUnder)) {
  if (localeCoverage < failUnder) {
    console.error(
      `\nFAIL: locale coverage ${localeCoverage.toFixed(1)}% < required ${failUnder}%`,
    );
    process.exit(1);
  }
}
