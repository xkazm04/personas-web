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
 *      since the topic's `contentReviewedAt` (NOT `appVersion`, which is
 *      recorded for display only and is never queried). Skipped when the
 *      desktop repo, the watch list, or the review date is missing.
 *
 * Reporting contract — a skip is never a pass:
 *   A check that could not run must be spelled differently from a check that
 *   ran and found nothing, in every output format. In `--json`:
 *     - `drift.driftedTopics: null`  → the question was never asked
 *       (`drift.available` is false; `drift.unavailableReason` says why).
 *     - `drift.driftedTopics: []`    → asked for `topicsChecked` topics,
 *       none drifted.
 *     - `drift.complete`             → false when any topic was skipped, so a
 *       non-empty array is still readable as a lower bound.
 *   Every skip carries a class (see SKIP below) and a count, so "0 drifted"
 *   can always be traced to either a real answer or a named silence.
 *
 * Usage:
 *   node scripts/check-guide-coverage.mjs                  # full report
 *   node scripts/check-guide-coverage.mjs --json           # machine-readable
 *   node scripts/check-guide-coverage.mjs --fail-under 50  # gate: locale coverage %
 *   node scripts/check-guide-coverage.mjs --fail-stale-over 20   # opt-in, default off
 *   node scripts/check-guide-coverage.mjs --fail-drift-over 10   # opt-in, default off
 *   node scripts/check-guide-coverage.mjs --fail-unresolved-over 0   # opt-in, default off
 *
 * Claim-anchored check (nav claims): every TOPIC_MODULE_MAP breadcrumb label
 * is resolved against the desktop's own registries (navigation/registry.ts,
 * sidebarData.ts, locales/en.json). Unlike directory-level drift this names
 * the false sentence ("topic X: 'Team Canvas' exists nowhere on the
 * desktop"). Same contract: no desktop checkout means
 * `navClaims.unresolved: null`, never [].
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

// ── Drift skip classes ────────────────────────────────────────────────
// Every reason the drift check can decline to answer. A skip is not a clean
// result — it means the question was never asked — so each reason is counted
// separately instead of collapsing into one number with one hard-coded story.
const SKIP = {
  REPO_UNAVAILABLE: "desktop-repo-unavailable",
  NO_WATCHED_FILES: "no-watched-files",
  NO_REVIEW_DATE: "no-content-reviewed-at",
  QUERY_FAILED: "history-query-failed",
};

const SKIP_LABEL = {
  [SKIP.REPO_UNAVAILABLE]: "desktop repo not available — nothing could be queried",
  [SKIP.NO_WATCHED_FILES]: "topic declares no coverage.watchedFiles",
  [SKIP.NO_REVIEW_DATE]: "topic declares no coverage.contentReviewedAt",
  [SKIP.QUERY_FAILED]: "git history query failed (see queryFailures for stderr)",
};

// Desktop repo (drift source). PERSONAS_DESKTOP_REPO is authoritative when
// set: an explicit override that silently falls back to a sibling checkout
// would report confident numbers for a repo the caller never asked about.
const DESKTOP = (() => {
  const isRepo = (p) => Boolean(p) && fs.existsSync(path.join(p, ".git"));
  const override = process.env.PERSONAS_DESKTOP_REPO;
  if (override) {
    if (isRepo(override)) {
      return { path: override, source: "PERSONAS_DESKTOP_REPO", reason: null };
    }
    return {
      path: null,
      source: "PERSONAS_DESKTOP_REPO",
      reason: `PERSONAS_DESKTOP_REPO="${override}" is not a git checkout (no .git inside) — refusing to fall back to a sibling repo the caller did not name`,
    };
  }
  const candidates = [
    path.resolve(REPO_ROOT, "../personas"),
    path.resolve(REPO_ROOT, "../../../../personas"), // from a .claude/worktrees/* checkout
  ];
  for (const c of candidates) {
    if (isRepo(c)) return { path: c, source: "sibling-checkout", reason: null };
  }
  return {
    path: null,
    source: null,
    reason: `no desktop checkout found (looked in ${candidates.join(", ")}) — set PERSONAS_DESKTOP_REPO`,
  };
})();

const ALL_LOCALES = [
  "en", "zh", "ar", "hi", "ru", "id", "es", "fr",
  "bn", "ja", "vi", "de", "ko", "cs",
];

const STALENESS_DAYS = 90;

// ── CLI ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const asJson = args.includes("--json");

// A malformed gate flag used to be swallowed (`Number("abc")` → NaN → the gate
// quietly never ran). A gate that cannot be read is a gate that is not there,
// so say so loudly instead.
function numericFlag(name) {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i === -1) return null;
  const raw = args[i].includes("=") ? args[i].slice(name.length + 1) : args[i + 1];
  const n = Number(raw);
  if (raw === undefined || raw === "" || Number.isNaN(n)) {
    console.error(`FAIL: ${name} needs a number, got ${raw === undefined ? "(nothing)" : `"${raw}"`}`);
    process.exit(2);
  }
  return n;
}

const failUnder = numericFlag("--fail-under");
const failStaleOver = numericFlag("--fail-stale-over");
const failDriftOver = numericFlag("--fail-drift-over");
const failUnresolvedOver = numericFlag("--fail-unresolved-over");

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
  const topics = Function(`"use strict"; return (${arrayLiteral});`)();
  return topics;
}

// ── Nav claims ────────────────────────────────────────────────────────
// Resolve each TOPIC_MODULE_MAP breadcrumb label against the desktop's own
// label registries. The label pool is deliberately generous (every string in
// the desktop's English catalog plus the sidebar/registry literals), so a
// reported miss means the label exists NOWHERE on the desktop: high
// precision, lower recall (a label that exists but in an unrelated place
// still resolves).
const DESKTOP_NAV_SOURCES = {
  registry: "src/lib/navigation/registry.ts",
  sidebar: "src/features/shared/chrome/sidebar/sidebarData.ts",
  catalog: "src/i18n/locales/en.json",
};

function resolveNavClaims(topicIds) {
  const none = (reason) => ({ available: false, unavailableReason: reason, checked: 0, unresolved: null });
  if (!DESKTOP.path) return none(DESKTOP.reason);
  const read = (rel) => {
    const p = path.join(DESKTOP.path, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  };
  const sources = {
    registry: read(DESKTOP_NAV_SOURCES.registry),
    sidebar: read(DESKTOP_NAV_SOURCES.sidebar),
    catalog: read(DESKTOP_NAV_SOURCES.catalog),
  };
  const missingSources = Object.entries(sources).filter(([, v]) => v === null).map(([k]) => k);
  if (missingSources.length) {
    return none(
      `desktop label source(s) not found: ${missingSources.join(", ")} - the desktop moved them; update DESKTOP_NAV_SOURCES`,
    );
  }
  const pool = new Set();
  const LABEL_RE = /label:\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
  for (const m of (sources.registry + sources.sidebar).matchAll(LABEL_RE)) {
    pool.add(m[2].replace(/\\(['"`])/g, "$1"));
  }
  try {
    const walk = (o) => {
      for (const v of Object.values(o)) {
        if (typeof v === "string") pool.add(v);
        else if (v && typeof v === "object") walk(v);
      }
    };
    walk(JSON.parse(sources.catalog));
  } catch (e) {
    return none(`could not parse ${DESKTOP_NAV_SOURCES.catalog}: ${e.message}`);
  }
  if (pool.size < 100) return none(`label pool has only ${pool.size} entries - extraction is broken, not the guide`);

  const mapSrc = fs.readFileSync(path.join(REPO_ROOT, "src/data/guide/desktop-modules.ts"), "utf8");
  const start = mapSrc.indexOf("export const TOPIC_MODULE_MAP");
  if (start === -1) return none("TOPIC_MODULE_MAP export not found in desktop-modules.ts");
  const ENTRY_RE = /"([\w-]+)":\s*\{\s*moduleId:\s*"[^"]+",\s*path:\s*\[([^\]]*)\]/g;
  const refs = [...mapSrc.slice(start).matchAll(ENTRY_RE)];
  if (refs.length === 0) return none("no TOPIC_MODULE_MAP entries parsed - the file shape changed");
  const unresolved = [];
  for (const [, id, rawPath] of refs) {
    if (!topicIds.has(id)) continue;
    const missing = [...rawPath.matchAll(/"([^"]*)"/g)].map((x) => x[1]).filter((l) => !pool.has(l));
    if (missing.length) unresolved.push({ id, missing });
  }
  return { available: true, unavailableReason: null, checked: refs.length, unresolved };
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
    reviewDerived: topic.coverage?.reviewBasis === "history-backfill",
    // Display only — drift is measured from contentReviewedAt, never from this.
    appVersion: topic.coverage?.appVersion ?? null,
    contentStale,
    reviewedDays: Number.isFinite(reviewedDays) ? Math.round(reviewedDays) : null,
  };
}

// ── Drift — desktop commits touching a topic's watchedFiles since review ─
// One `git log` per unique (watchedFiles, since) pair; topics sharing a
// category-level watch set reuse the same query.
function computeDrift(allTopics) {
  const skips = new Map(); // skip class → { count, examples: string[] }
  const noteSkip = (cls, topicId) => {
    let entry = skips.get(cls);
    if (!entry) {
      entry = { count: 0, examples: [] };
      skips.set(cls, entry);
    }
    entry.count++;
    if (entry.examples.length < 10) entry.examples.push(topicId);
  };

  if (!DESKTOP.path) {
    for (const topic of allTopics) noteSkip(SKIP.REPO_UNAVAILABLE, topic.id);
    return {
      available: false,
      unavailableReason: DESKTOP.reason,
      desktopRepo: null,
      desktopRepoSource: DESKTOP.source,
      checked: 0,
      skips,
      queryFailures: [],
      // null, not [] — nothing was asked, so there is no answer to report.
      topics: null,
    };
  }

  const cache = new Map();
  const queryFailures = [];
  const results = [];
  let checked = 0;

  for (const topic of allTopics) {
    const watched = topic.coverage?.watchedFiles;
    const since = topic.coverage?.contentReviewedAt;
    // Two distinct silences that used to share one counter.
    if (!watched?.length) {
      noteSkip(SKIP.NO_WATCHED_FILES, topic.id);
      continue;
    }
    if (!since) {
      noteSkip(SKIP.NO_REVIEW_DATE, topic.id);
      continue;
    }

    const key = `${since} ${watched.join(" ")}`;
    let hit = cache.get(key);
    if (hit === undefined) {
      try {
        const out = execFileSync(
          "git",
          ["-C", DESKTOP.path, "log", "--oneline", `--since=${since}`, "--", ...watched],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        );
        hit = { commits: out.split("\n").filter(Boolean).length, error: null };
      } catch (err) {
        // Keep the error stream. A discarded stderr is the difference between
        // a diagnosable skip and a mysterious zero.
        const stderr = String(err?.stderr ?? "").trim();
        hit = {
          commits: null,
          error: {
            exitCode: typeof err?.status === "number" ? err.status : null,
            stderr: stderr || null,
            message: stderr || String(err?.message ?? "unknown git failure"),
          },
        };
        queryFailures.push({
          since,
          watchedFiles: watched,
          exitCode: hit.error.exitCode,
          stderr: hit.error.stderr,
          message: hit.error.message,
          affectedTopics: [],
        });
        hit.failureRecord = queryFailures[queryFailures.length - 1];
      }
      cache.set(key, hit);
    }

    if (hit.commits === null) {
      noteSkip(SKIP.QUERY_FAILED, topic.id);
      if (hit.failureRecord && hit.failureRecord.affectedTopics.length < 10) {
        hit.failureRecord.affectedTopics.push(topic.id);
      }
      continue;
    }

    checked++;
    if (hit.commits > 0) {
      results.push({ id: topic.id, commits: hit.commits, since, watchedFiles: watched });
    }
  }

  results.sort((a, b) => b.commits - a.commits);
  return {
    available: true,
    unavailableReason: null,
    desktopRepo: DESKTOP.path,
    desktopRepoSource: DESKTOP.source,
    checked,
    skips,
    queryFailures,
    topics: results,
  };
}

function summarizeSkips(skips) {
  const byClass = [...skips.entries()]
    .map(([cls, entry]) => ({
      class: cls,
      label: SKIP_LABEL[cls] ?? cls,
      count: entry.count,
      exampleTopics: entry.examples,
    }))
    .sort((a, b) => b.count - a.count);
  return { total: byClass.reduce((n, c) => n + c.count, 0), byClass };
}

// ── Main ──────────────────────────────────────────────────────────────
const topics = await loadTopics();
const classified = topics.map(classifyTopic);
const drift = computeDrift(topics);
const driftSkips = summarizeSkips(drift.skips);
const navClaims = resolveNavClaims(new Set(topics.map((t) => t.id)));
// "Measured" means at least one topic was actually answered. Finding the repo
// is not the same as getting an answer out of it: if every query failed, the
// result set is as empty of meaning as if the repo had been missing.
const driftMeasured = drift.topics !== null && drift.checked > 0;
const driftComplete = driftMeasured && driftSkips.total === 0;

const withRecipe = classified.filter((c) => c.shots.declared);
const withoutRecipe = classified.filter((c) => !c.shots.declared);

const totalExpected = withRecipe.length * ALL_LOCALES.length;
const totalPresent = withRecipe.reduce((sum, c) => sum + c.shots.present.length, 0);
const localeCoverage = totalExpected === 0 ? 0 : (totalPresent / totalExpected) * 100;
const topicCoverage = topics.length === 0 ? 0 : (withRecipe.length / topics.length) * 100;

const staleContent = classified.filter((c) => c.contentStale);
const reviewedEver = classified.filter((c) => c.contentReviewedAt && !c.reviewDerived);
const reviewDerived = classified.filter((c) => c.contentReviewedAt && c.reviewDerived);
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

// ── Which signals actually gate anything ──────────────────────────────
// Only a signal with a threshold passed on this invocation can fail the run.
// Everything else is advisory: a number to read, not a number that bites.
const enforcement = {
  screenshotLocaleCoverage: {
    flag: "--fail-under",
    unit: "percent",
    enforced: failUnder !== null,
    threshold: failUnder,
    measured: localeCoverage,
  },
  staleContent: {
    flag: "--fail-stale-over",
    unit: "topics",
    enforced: failStaleOver !== null,
    threshold: failStaleOver,
    measured: staleContent.length,
  },
  desktopDrift: {
    flag: "--fail-drift-over",
    unit: "topics",
    enforced: failDriftOver !== null,
    threshold: failDriftOver,
    measured: driftMeasured ? drift.topics.length : null,
    measurementComplete: driftComplete,
  },
  unresolvedNavClaims: {
    flag: "--fail-unresolved-over",
    unit: "topics",
    enforced: failUnresolvedOver !== null,
    threshold: failUnresolvedOver,
    measured: navClaims.available ? navClaims.unresolved.length : null,
  },
};

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
          contentReviewedByHuman: reviewedEver.length,
          contentReviewDerivedFromHistory: reviewDerived.length,
          stalenessThresholdDays: STALENESS_DAYS,
        },
        // Which of the numbers above can fail this run, and which are FYI.
        enforcement,
        perLocale,
        drift: {
          available: drift.available,
          unavailableReason: drift.unavailableReason,
          desktopRepo: drift.desktopRepo,
          desktopRepoSource: drift.desktopRepoSource,
          topicsChecked: drift.checked,
          topicsSkipped: driftSkips.total,
          skippedByClass: driftSkips.byClass,
          queryFailures: drift.queryFailures,
          // true only when every topic was answered. False means the arrays
          // below cover `topicsChecked` topics only and are a lower bound.
          measured: driftMeasured,
          complete: driftComplete,
          // null  → not one topic was answered; there is no "no drift" here.
          // []    → topics were answered and none of them drifted.
          // A consumer that does .length/.map on null crashes instead of
          // silently reading a blackout as a clean bill of health.
          driftedTopicCount: driftMeasured ? drift.topics.length : null,
          driftedTopics: driftMeasured ? drift.topics : null,
        },
        // unresolved: null -> never asked; [] -> asked, every label resolved.
        navClaims: {
          available: navClaims.available,
          unavailableReason: navClaims.unavailableReason,
          claimsChecked: navClaims.checked,
          unresolvedTopicCount: navClaims.available ? navClaims.unresolved.length : null,
          unresolved: navClaims.unresolved,
        },
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
  const gateTag = (e) =>
    e.enforced ? `[ENFORCED ${e.flag} ${e.threshold}]` : `[advisory — ${e.flag} not set]`;

  console.log("Guide Coverage Report");
  console.log("─".repeat(60));
  console.log(`Topics total:          ${topics.length}`);
  console.log(`With screenshot recipe: ${withRecipe.length}  ${bar(topicCoverage)}`);
  console.log(
    `Locale completeness:    ${totalPresent}/${totalExpected}  ${bar(localeCoverage)}  ${gateTag(enforcement.screenshotLocaleCoverage)}`,
  );
  console.log(`Content reviewed:       ${reviewedEver.length}/${topics.length}  ${bar(contentCoverage)}  (human reviews; ${reviewDerived.length} dates backfilled from history, not counted)`);
  console.log();
  console.log(`Per-locale (recipes only):`);
  for (const [loc, s] of Object.entries(perLocale)) {
    console.log(`  ${loc.padEnd(4)} ${String(s.have).padStart(4)}/${s.expected}  ${bar(s.pct)}`);
  }
  console.log();
  console.log(
    `Stale content (>${STALENESS_DAYS}d since review):  ${staleContent.length}  ${gateTag(enforcement.staleContent)}`,
  );
  for (const c of staleContent.slice(0, 10)) {
    console.log(`  - ${c.id}  (${c.reviewedDays ?? "never"}d)`);
  }
  if (staleContent.length > 10) console.log(`  …and ${staleContent.length - 10} more`);
  console.log();
  if (withoutRecipe.length) {
    console.log(`Topics with no screenshot recipe: ${withoutRecipe.length}  (text-only is OK — this is informational)`);
  }
  console.log();

  // Drift — a skip is reported as a named silence, never as a clean zero.
  if (!drift.available) {
    console.log(`Desktop drift:  NOT MEASURED  ${gateTag(enforcement.desktopDrift)}`);
    console.log(`  reason: ${drift.unavailableReason}`);
    console.log(`  ${driftSkips.total}/${topics.length} topics unchecked — this is NOT "no drift"`);
  } else if (drift.checked === 0) {
    // Repo was found but not a single topic could be answered. "0/0 drifted"
    // would read as a clean bill of health; it is a total blackout.
    console.log(`Desktop drift (repo: ${drift.desktopRepo}  via ${drift.desktopRepoSource}):`);
    console.log(
      `  NOT MEASURED — 0 of ${topics.length} topics could be checked  ${gateTag(enforcement.desktopDrift)}`,
    );
  } else {
    console.log(
      `Desktop drift (repo: ${drift.desktopRepo}  via ${drift.desktopRepoSource}):  ` +
        `${drift.topics.length}/${drift.checked} checked topics drifted  ${gateTag(enforcement.desktopDrift)}`,
    );
    if (!driftComplete) {
      console.log(
        `  PARTIAL: ${driftSkips.total}/${topics.length} topics were not checked — the count above is a lower bound`,
      );
    }
    for (const d of drift.topics.slice(0, 15)) {
      console.log(`  - ${d.id}  (${d.commits} desktop commits since ${d.since})`);
    }
    if (drift.topics.length > 15) console.log(`  …and ${drift.topics.length - 15} more`);
  }
  if (driftSkips.total) {
    console.log(`  Skipped, by class:`);
    for (const c of driftSkips.byClass) {
      console.log(`    ${String(c.count).padStart(4)}  ${c.class} — ${c.label}`);
      console.log(`          e.g. ${c.exampleTopics.slice(0, 3).join(", ")}`);
    }
  }
  if (drift.queryFailures.length) {
    // One failing repo produces one failure per distinct watch set; group by
    // the actual error so the cause is stated once, not twenty-three times.
    const byMessage = new Map();
    for (const f of drift.queryFailures) {
      const line = `exit ${f.exitCode ?? "?"}: ${f.message.split("\n")[0]}`;
      const g = byMessage.get(line) ?? { queries: 0, example: f };
      g.queries++;
      byMessage.set(line, g);
    }
    console.log(`  git history query failures (${drift.queryFailures.length} distinct queries):`);
    for (const [line, g] of byMessage) {
      console.log(`    ${line}`);
      console.log(
        `      ×${g.queries} quer${g.queries === 1 ? "y" : "ies"}, e.g. --since=${g.example.since} -- ${g.example.watchedFiles.join(" ")}`,
      );
    }
  }

  console.log();
  if (!navClaims.available) {
    console.log(`Nav claims:  NOT MEASURED  ${gateTag(enforcement.unresolvedNavClaims)}`);
    console.log(`  reason: ${navClaims.unavailableReason}`);
  } else {
    console.log(
      `Nav claims (breadcrumb labels vs desktop registries):  ${navClaims.unresolved.length}/${navClaims.checked} topics cite a label found nowhere on the desktop  ${gateTag(enforcement.unresolvedNavClaims)}`,
    );
    for (const u of navClaims.unresolved.slice(0, 20)) {
      console.log(`  - ${u.id}: ${u.missing.map((m) => `"${m}"`).join(", ")}`);
    }
    if (navClaims.unresolved.length > 20) console.log(`  ...and ${navClaims.unresolved.length - 20} more (use --json)`);
  }

  console.log();
  console.log("Signals:");
  for (const [name, e] of Object.entries(enforcement)) {
    console.log(
      `  ${name.padEnd(26)} ${e.enforced ? `enforced (${e.flag} ${e.threshold})` : `advisory (pass ${e.flag} to enforce)`}`,
    );
  }
}

// ── CI gates ──────────────────────────────────────────────────────────
// All three default to off. Passing a threshold turns that signal from a
// number you read into a number that fails the run.
const failures = [];

if (failUnder !== null && localeCoverage < failUnder) {
  failures.push(`locale coverage ${localeCoverage.toFixed(1)}% < required ${failUnder}%`);
}

if (failStaleOver !== null && staleContent.length > failStaleOver) {
  failures.push(
    `stale content ${staleContent.length} topics > allowed ${failStaleOver} (>${STALENESS_DAYS}d since review)`,
  );
}

if (failDriftOver !== null) {
  if (!driftMeasured) {
    // Gating on a signal that could not be measured must fail, not pass.
    const why =
      drift.unavailableReason ??
      `every history query failed (${driftSkips.byClass.map((c) => `${c.count} ${c.class}`).join(", ")})`;
    failures.push(`drift gate requested but drift was not measured — ${why}`);
  } else {
    if (!driftComplete) {
      console.error(
        `WARN: drift gate is reading a partial measurement — ${driftSkips.total} topic(s) skipped (${driftSkips.byClass.map((c) => `${c.count} ${c.class}`).join(", ")})`,
      );
    }
    if (drift.topics.length > failDriftOver) {
      failures.push(`drifted topics ${drift.topics.length} > allowed ${failDriftOver}`);
    }
  }
}

if (failUnresolvedOver !== null) {
  if (!navClaims.available) {
    failures.push(`nav-claim gate requested but not measured - ${navClaims.unavailableReason}`);
  } else if (navClaims.unresolved.length > failUnresolvedOver) {
    failures.push(`unresolved nav claims in ${navClaims.unresolved.length} topics > allowed ${failUnresolvedOver}`);
  }
}

if (failures.length > 0) {
  console.error("");
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
