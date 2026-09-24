#!/usr/bin/env node
/**
 * Emit src/data/guide/translation-status.ts: which localized guide topics are
 * NOT current, so the runtime can serve the whole current English unit instead
 * (src/data/guide/getLocalized.ts, resolveTopicUnit).
 *
 * The verdicts come from the history-anchored classifier (./guide-drift.mjs),
 * never from a bare hash comparison: an instrument difference (line endings, the
 * old extractor) is fresh there, so a correct translation is never demoted to
 * English because of how a checkout stores its bytes.
 *
 * Mapping (per locale, per topic; only non-current entries are stored):
 *   stale / content                      -> "stale"
 *   stale / unverified                   -> "unverified"  (never guessed fresh)
 *   missing / present-unpinned, English
 *     changed since the key landed       -> "stale"
 *   missing / present-unpinned, English
 *     unchanged since the key landed     -> (fresh: translated, just never stamped)
 *   missing / present-unpinned, anchor
 *     not found                          -> "unverified"
 *   missing / absent, orphaned, fresh    -> (not stored; the runtime sees an
 *                                           absent body itself)
 *
 * The module also carries GUIDE_STATUS_INPUT_DIGEST, a digest of everything the
 * table depends on that is readable WITHOUT git: every English unit (title,
 * description, body, EOL-normalised), every locale's _meta.json pins, and every
 * locale's set of body keys. src/data/guide/getLocalized.test.ts recomputes it,
 * so an English guide edit that is not followed by a regeneration fails the unit
 * suite even on a shallow clone; with full history the same test re-derives the
 * whole table and deep-compares it.
 *
 * Usage:
 *   node scripts/i18n/emit-guide-status.mjs          write the module (if changed)
 *   node scripts/i18n/emit-guide-status.mjs --check  exit 1 if the module is out of date
 *
 * Exit codes: 0 ok, 1 --check found the module out of date, 2 refused (inputs
 * unreadable / no English), 3 history unavailable (shallow clone, no git). A run
 * that cannot anchor writes NOTHING - an empty or all-fresh table would silently
 * serve every stale translation as current.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  classifyGuide,
  createGitHistory,
  GUIDE_LOCALES,
  HistoryUnavailableError,
  CAUSE,
  SUB,
  EXIT,
} from "./guide-drift.mjs";
import { extractBodies, normaliseEol, parseTopicsSource, topicHashInput } from "./guide-source.mjs";

export const STATUS_MODULE = "src/data/guide/translation-status.ts";
const CONTENT_DIR = "src/data/guide/content";
const TOPICS_FILE = "src/data/guide/topics.ts";
const localeDir = (lang) => `src/data/guide/locales/${lang}`;
const CMD = "node scripts/i18n/emit-guide-status.mjs";

/** @param {Record<string, unknown>} f a classifier Finding */
export function statusOf(f) {
  if (f.verdict === "stale") return f.cause === CAUSE.CONTENT ? "stale" : "unverified";
  if (f.verdict === "missing" && f.sub === SUB.PRESENT_UNPINNED) {
    if (f.englishChangedSinceAnchor === true) return "stale";
    if (f.englishChangedSinceAnchor === false) return null;
    return "unverified";
  }
  return null;
}

const sortKeys = (obj) => Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));

/**
 * lang -> topicId -> "stale" | "unverified", every classified locale present.
 * @param {{ locales: Record<string, { fresh: any[], stale: any[], missing: any[], orphaned: any[] }> }} report
 */
export function buildStatusTable(report) {
  const table = {};
  for (const lang of Object.keys(report.locales).sort()) {
    const r = report.locales[lang];
    const entries = {};
    for (const f of [...r.stale, ...r.missing]) {
      const s = statusOf(f);
      if (s) entries[f.topicId] = s;
    }
    table[lang] = sortKeys(entries);
  }
  return table;
}

/**
 * Digest of the table's git-free inputs, over the working tree of `history`.
 * EOL-normalised, so a CRLF and an LF checkout of the same English agree.
 * @param {{ readAt: (rev: string | null, rel: string) => string | null, listAt: (rev: string | null, dir: string) => string[] }} history
 */
export function inputDigest(history) {
  const read = (rel) => history.readAt(null, rel);
  const tsFiles = (dir) => history.listAt(null, dir).filter((n) => n.endsWith(".ts") && n !== "index.ts").sort();

  const topicsSrc = read(TOPICS_FILE);
  const topics = topicsSrc == null ? {} : parseTopicsSource(normaliseEol(topicsSrc, "lf"));
  const bodies = {};
  for (const name of tsFiles(CONTENT_DIR)) {
    const text = read(`${CONTENT_DIR}/${name}`);
    if (text != null) Object.assign(bodies, extractBodies(normaliseEol(text, "lf"), name));
  }
  const english = Object.keys(topics)
    .sort()
    .map((id) => [id, topicHashInput(topics[id], bodies[id] ?? "")]);

  const locales = [...GUIDE_LOCALES].sort().map((lang) => {
    let pins = {};
    const metaSrc = read(`${localeDir(lang)}/_meta.json`);
    if (metaSrc != null) {
      try {
        pins = JSON.parse(metaSrc.replace(/^\uFEFF/, "")).topics ?? {};
      } catch {
        pins = { "<unparseable>": metaSrc };
      }
    }
    const keys = [];
    for (const name of tsFiles(`${localeDir(lang)}/content`)) {
      const text = read(`${localeDir(lang)}/content/${name}`);
      if (text != null) keys.push(...Object.keys(extractBodies(normaliseEol(text, "lf"), name)));
    }
    return [lang, Object.keys(pins).sort().map((id) => [id, pins[id]]), [...new Set(keys)].sort()];
  });

  return crypto.createHash("sha256").update(JSON.stringify({ english, locales }), "utf8").digest("hex").slice(0, 32);
}

/** The generated TypeScript module. Deterministic: keys sorted, LF, no timestamp. */
export function renderStatusModule({ table, digest }) {
  const lines = [
    `// GENERATED by scripts/i18n/emit-guide-status.mjs - do not edit by hand.`,
    `// Regenerate after any English guide, _meta.json or locale-body change:`,
    `//   ${CMD}`,
    `// (needs full git history; a shallow clone exits 3 and writes nothing).`,
    `//`,
    `// Localized guide topics that are NOT current, per locale. A topic listed here`,
    `// is served as the whole current English unit, with the older translation one`,
    `// tap away (src/data/guide/getLocalized.ts). Verdicts are the history-anchored`,
    `// classifier's (scripts/i18n/guide-drift.mjs): "stale" = the English changed`,
    `// after the translation was made; "unverified" = the pin cannot be tied to any`,
    `// English revision. Topics not listed are served translated when the locale`,
    `// carries a whole unit (title, description and body).`,
    ``,
    `export type GuideTranslationStatus = "stale" | "unverified";`,
    ``,
    `export type GuideTranslationStatusTable = Readonly<Record<string, Readonly<Record<string, GuideTranslationStatus>>>>;`,
    ``,
    `/** Digest of the table's git-free inputs; getLocalized.test.ts recomputes it. */`,
    `export const GUIDE_STATUS_INPUT_DIGEST = ${JSON.stringify(digest)};`,
    ``,
    `export const GUIDE_TRANSLATION_STATUS: GuideTranslationStatusTable = {`,
  ];
  for (const lang of Object.keys(table).sort()) {
    const entries = table[lang];
    const ids = Object.keys(entries).sort();
    if (ids.length === 0) {
      lines.push(`  ${JSON.stringify(lang)}: {},`);
      continue;
    }
    lines.push(`  ${JSON.stringify(lang)}: {`);
    for (const id of ids) lines.push(`    ${JSON.stringify(id)}: ${JSON.stringify(entries[id])},`);
    lines.push(`  },`);
  }
  lines.push(`};`, ``);
  return lines.join("\n");
}

/**
 * The whole emit as a function of an injected history; the CLI only does I/O.
 * @param {{ history: any, locales: readonly string[], write: (text: string) => void, current?: string | null, check?: boolean }} args
 * @returns {{ exitCode: number, stdout: string, stderr: string }}
 */
export function emitGuideStatus({ history, locales, write, current = null, check = false }) {
  let report;
  try {
    history.assertAvailable?.();
    report = classifyGuide({ history, locales });
  } catch (err) {
    if (err instanceof HistoryUnavailableError) {
      return {
        exitCode: EXIT.HISTORY_UNAVAILABLE,
        stdout: "",
        stderr: `[emit-guide-status] ${err.message}\nNothing written. Fetch full history (git fetch --unshallow) and re-run.`,
      };
    }
    throw err;
  }
  if (report.source.topicCount === 0 || report.source.bodyCount === 0) {
    return {
      exitCode: EXIT.USAGE,
      stdout: "",
      stderr: `[emit-guide-status] refusing to write: read ${report.source.topicCount} English topics and ${report.source.bodyCount} bodies.`,
    };
  }
  const table = buildStatusTable(report);
  const text = renderStatusModule({ table, digest: inputDigest(history) });
  const counts = Object.entries(table)
    .map(([lang, e]) => `${lang} ${Object.keys(e).length}`)
    .join(", ");
  const upToDate = current != null && normaliseEol(current, "lf") === text;
  if (check) {
    return upToDate
      ? { exitCode: EXIT.OK, stdout: `${STATUS_MODULE} is up to date (${counts})`, stderr: "" }
      : { exitCode: EXIT.DRIFT, stdout: "", stderr: `[emit-guide-status] ${STATUS_MODULE} is out of date - run ${CMD}` };
  }
  if (!upToDate) write(text);
  return { exitCode: EXIT.OK, stdout: `${upToDate ? "unchanged" : "wrote"} ${STATUS_MODULE} (not current per locale: ${counts})`, stderr: "" };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const target = path.join(repoRoot, STATUS_MODULE);
  const r = emitGuideStatus({
    history: createGitHistory(repoRoot),
    locales: GUIDE_LOCALES,
    current: fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null,
    check: process.argv.includes("--check"),
    write: (text) => fs.writeFileSync(target, text, "utf8"),
  });
  if (r.stdout) console.log(r.stdout);
  if (r.stderr) console.error(r.stderr);
  process.exit(r.exitCode);
}
