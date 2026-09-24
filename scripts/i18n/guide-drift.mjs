#!/usr/bin/env node
/**
 * History-anchored drift classifier for guide translations.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 * Each locale's _meta.json pins, per topic, the sha1 of the English unit the
 * translation was made from (`translatedFromHash`, see ./guide-source.mjs). The
 * old detector compared that pin to TODAY'S hash with bare string inequality,
 * so three unrelated events all read as "stale translation":
 *   1. line endings - the pin is over raw disk text, and a checkout's EOL is
 *      not a property of the English (2 of 11 content files are LF on the
 *      very Windows checkout the CRLF pins were taken on);
 *   2. an extractor fix - 071c13d stopped truncating 11 bodies, so pins taken
 *      over the truncated prefix no longer match a body that never changed;
 *   3. a real English edit - the only one a translator has to act on.
 * And a topic that IS translated but was never stamped in _meta.json read as
 * "missing", i.e. untranslated.
 *
 * ── What it does instead ───────────────────────────────────────────────────
 * For every pin that is not byte-equal to today's hash:
 *   - ANCHOR: walk the English guide revisions committed at or before the
 *     pin's translatedAt, newest first (at most MAX_CANDIDATES);
 *   - VERIFY: at each, recompute the pin under the CLOSED variant set
 *     {scanner, legacy} x {crlf, lf} (./guide-source.mjs). The first revision
 *     and variant that reproduce the pin byte-for-byte is the anchor - the
 *     English the translator actually saw;
 *   - COMPARE the NORMALISED unit (title, description, full scanner body with
 *     LF endings) at the anchor to the working tree.
 * A pin no variant reproduces at any candidate is `stale / unverified` - it is
 * never folded into fresh. No pin is rewritten, re-stamped or "repaired": the
 * CRLF decision in guide-source.mjs and all stored hashes stand.
 *
 * ── Verdicts (the registry's four) and their causes ─────────────────────────
 *   fresh    exact                 pin === today's hash (no history read)
 *            instrument:eol        verified; English unchanged; EOL differs
 *            instrument:extractor  verified under the legacy extractor; unchanged
 *   stale    content               verified; English title/description/body changed
 *            unverified            no variant reproduces the pin at any candidate
 *   missing  present-unpinned      locale carries the body, _meta.json has no pin;
 *                                  anchorRev = commit that introduced the key there
 *            absent                locale has no body for the topic
 *   orphaned                       pin for a topic English no longer has
 * `--strict` fails on stale (any cause) or missing; instrument:* is fresh.
 *
 * ── Public API (consumed by check-guide-translations.mjs; reusable) ─────────
 *   createGitHistory(repoRoot)                -> GuideHistory over real git
 *   classifyPin({ history, topicId, pin })    -> Finding
 *   classifyGuide({ history, locales, topic? })-> Report
 *   strictFails(report)                       -> boolean
 *   formatReport(report) / formatWorkOrder(report) / workOrder(report)
 *   runDriftCheck({ history, locales, flags }) -> { exitCode, stdout, stderr }
 *   currentHashes(history)                    -> topicId -> today's pin hash
 *   EXIT, CAUSE, SUB, VARIANTS, GUIDE_LOCALES, HistoryUnavailableError
 *
 * Any failure to read history (a shallow clone, git missing, an unknown
 * revision) surfaces as HistoryUnavailableError, and runDriftCheck turns it
 * into EXIT.HISTORY_UNAVAILABLE with no report: a classifier that cannot
 * anchor must not print numbers, least of all the old bare-hash ones.
 *
 * @typedef {object} GuideHistory
 * @property {(rev: string | null, relPath: string) => string | null} readAt
 *   File text at `rev` (null = working tree), or null when the path is absent.
 * @property {(rev: string | null, relDir: string) => string[]} listAt
 *   Entry names directly under `relDir` at `rev` (null = working tree).
 * @property {(opts: { until: string }) => Array<{ rev: string, time: string }>} revisions
 *   Commits touching the English guide source, committed at or before `until`.
 * @property {(relPath: string, key: string) => ({ rev: string, time: string } | null)} introducedIn
 *   The commit whose diff first added the `"key": \`` line to `relPath`.
 * @property {() => void} [assertAvailable]
 *   Throws HistoryUnavailableError when history cannot be trusted (shallow).
 *
 * @typedef {object} Finding
 * @property {string} topicId
 * @property {"fresh" | "stale" | "missing" | "orphaned"} verdict
 * @property {string} [cause]   fresh/stale: a CAUSE value
 * @property {string} [sub]     missing: a SUB value
 * @property {string} [recordedHash] the stored pin
 * @property {string} [currentHash]  today's hash under the pin definition
 * @property {string | null} [anchorRev] the English revision the pin verified at
 * @property {string} [variant] "<extractor>/<eol>" the pin verified under
 * @property {{ title?: string[], description?: string[], body: string[] }} [diff]
 *   English anchor -> working tree; body is a line diff (" ", "-", "+" prefixed)
 *
 * @typedef {{ fresh: Finding[], stale: Finding[], missing: Finding[], orphaned: Finding[] }} LocaleReport
 * @typedef {object} Report
 * @property {string | null} generated
 * @property {{ contentFiles: number, topicCount: number, bodyCount: number }} source
 * @property {Record<string, LocaleReport>} locales
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  extractBodies,
  extractBodiesLegacy,
  parseTopicsSource,
  normaliseEol,
  hashContent,
  topicHashInput,
} from "./guide-source.mjs";

export const GUIDE_LOCALES = Object.freeze(["zh", "ar", "hi", "ru", "id", "es", "fr", "bn", "ja", "vi", "de", "ko", "cs"]);

const CONTENT_DIR = "src/data/guide/content";
const TOPICS_FILE = "src/data/guide/topics.ts";
const localeDir = (lang) => `src/data/guide/locales/${lang}`;

export const EXIT = Object.freeze({ OK: 0, DRIFT: 1, USAGE: 2, HISTORY_UNAVAILABLE: 3 });

export const CAUSE = Object.freeze({
  EXACT: "exact",
  EOL: "instrument:eol",
  EXTRACTOR: "instrument:extractor",
  CONTENT: "content",
  UNVERIFIED: "unverified",
});

export const SUB = Object.freeze({ PRESENT_UNPINNED: "present-unpinned", ABSENT: "absent" });

/** The closed instrument variant set a pin may be verified under. Order matters:
 * the scanner is tried first, so the legacy extractor is only ever blamed for a
 * pin the scanner cannot reproduce. */
export const VARIANTS = Object.freeze([
  Object.freeze({ extractor: "scanner", eol: "crlf" }),
  Object.freeze({ extractor: "scanner", eol: "lf" }),
  Object.freeze({ extractor: "legacy", eol: "crlf" }),
  Object.freeze({ extractor: "legacy", eol: "lf" }),
]);

/** Candidate English revisions walked per pin before it is called unverified. */
export const MAX_CANDIDATES = 16;

const NORMAL = Object.freeze({ extractor: "scanner", eol: "lf" });
const RAW = "raw";

export class HistoryUnavailableError extends Error {
  /** @param {string} reason @param {{ cause?: unknown }} [options] */
  constructor(reason, options) {
    super(`history unavailable: ${reason}`, options);
    this.name = "HistoryUnavailableError";
    this.reason = reason;
  }
}

// ── History access ──────────────────────────────────────────────────────────

/** Every error out of a history call becomes HistoryUnavailableError. */
function viaHistory(fn, what) {
  try {
    return fn();
  } catch (err) {
    if (err instanceof HistoryUnavailableError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new HistoryUnavailableError(`${what} (${msg.split("\n")[0]})`, { cause: err });
  }
}

const caches = new WeakMap();
function cacheFor(history) {
  let c = caches.get(history);
  if (!c) {
    c = { snapshots: new Map(), candidates: new Map() };
    caches.set(history, c);
  }
  return c;
}

/** The English guide as it stood at `rev` (null = working tree). Cached. */
function snapshotAt(history, rev) {
  const c = cacheFor(history);
  const key = rev ?? "\0worktree";
  const hit = c.snapshots.get(key);
  if (hit) return hit;
  const read = (p) =>
    rev === null ? history.readAt(null, p) : viaHistory(() => history.readAt(rev, p), `reading ${p} at ${rev}`);
  const list = (d) =>
    rev === null ? history.listAt(null, d) : viaHistory(() => history.listAt(rev, d), `listing ${d} at ${rev}`);
  const topicsSrc = read(TOPICS_FILE);
  const files = {};
  for (const name of list(CONTENT_DIR)) {
    if (!name.endsWith(".ts") || name === "index.ts") continue;
    const text = read(`${CONTENT_DIR}/${name}`);
    if (text != null) files[name] = text;
  }
  const snap = { rev, topics: topicsSrc == null ? {} : parseTopicsSource(topicsSrc), files, bodies: new Map() };
  c.snapshots.set(key, snap);
  return snap;
}

/** topicId -> body for one reading of a snapshot: RAW (disk bytes, scanner) or a variant. */
function bodiesOf(snap, form) {
  const key = form === RAW ? RAW : `${form.extractor}/${form.eol}`;
  const hit = snap.bodies.get(key);
  if (hit) return hit;
  const out = {};
  for (const [name, raw] of Object.entries(snap.files)) {
    const text = form === RAW ? raw : normaliseEol(raw, form.eol);
    Object.assign(out, form !== RAW && form.extractor === "legacy" ? extractBodiesLegacy(text) : extractBodies(text, name));
  }
  snap.bodies.set(key, out);
  return out;
}

/** The normalised unit a translator translates: title, description, full body, LF. */
function unitAt(snap, topicId) {
  const meta = snap.topics[topicId];
  const body = bodiesOf(snap, NORMAL)[topicId];
  if (!meta || body === undefined) return null;
  return { title: meta.title, description: meta.description, body };
}

/** The pin a variant instrument would have recorded for this topic at this snapshot. */
function variantHash(snap, topicId, variant) {
  const meta = snap.topics[topicId];
  if (!meta) return null;
  const body = bodiesOf(snap, variant)[topicId];
  // The legacy emitter hashed a body it could not find as "" (`?? ""`).
  if (body === undefined && variant.extractor !== "legacy") return null;
  return hashContent(topicHashInput(meta, body ?? ""));
}

/** topicId -> today's hash under the pin definition (identical to readEnglishGuide). */
export function currentHashes(history) {
  const head = snapshotAt(history, null);
  const raw = bodiesOf(head, RAW);
  const out = {};
  for (const [id, meta] of Object.entries(head.topics)) out[id] = hashContent(topicHashInput(meta, raw[id] ?? ""));
  return out;
}

function candidatesFor(history, until) {
  const c = cacheFor(history);
  let list = c.candidates.get(until);
  if (!list) {
    const revs = viaHistory(() => history.revisions({ until }), "listing English guide revisions");
    list = [...revs]
      .sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
      .slice(0, MAX_CANDIDATES);
    c.candidates.set(until, list);
  }
  return list;
}

function findAnchor(history, topicId, pinHash, until) {
  for (const cand of candidatesFor(history, until)) {
    const snap = snapshotAt(history, cand.rev);
    for (const variant of VARIANTS) {
      if (variantHash(snap, topicId, variant) === pinHash) return { ...cand, snap, variant };
    }
  }
  return null;
}

const sameUnit = (a, b) => a.title === b.title && a.description === b.description && a.body === b.body;

// ── Line diff ───────────────────────────────────────────────────────────────

/**
 * Line diff of `a` -> `b` (LCS), as " "/"-"/"+" prefixed lines. Unchanged runs
 * longer than 2*context collapse to a single "@@" line.
 */
export function lineDiff(a, b, context = 2) {
  const x = a.split("\n");
  const y = b.split("\n");
  const n = x.length;
  const m = y.length;
  const w = m + 1;
  const lcs = new Int32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * w + j] = x[i] === y[j] ? lcs[(i + 1) * w + j + 1] + 1 : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      ops.push(" " + x[i]);
      i++;
      j++;
    } else if (lcs[(i + 1) * w + j] >= lcs[i * w + j + 1]) ops.push("-" + x[i++]);
    else ops.push("+" + y[j++]);
  }
  while (i < n) ops.push("-" + x[i++]);
  while (j < m) ops.push("+" + y[j++]);

  const keep = ops.map(() => false);
  ops.forEach((op, k) => {
    if (op[0] === " ") return;
    for (let d = Math.max(0, k - context); d <= Math.min(ops.length - 1, k + context); d++) keep[d] = true;
  });
  const out = [];
  let gap = false;
  ops.forEach((op, k) => {
    if (keep[k]) {
      out.push(op);
      gap = false;
    } else if (!gap) {
      out.push("@@");
      gap = true;
    }
  });
  return out;
}

function unitDiff(then, now) {
  const d = { body: then.body === now.body ? [] : lineDiff(then.body, now.body) };
  if (then.title !== now.title) d.title = [then.title, now.title];
  if (then.description !== now.description) d.description = [then.description, now.description];
  return d;
}

// ── Classification ──────────────────────────────────────────────────────────

/**
 * Classify one stored pin for a topic that exists in today's English.
 * @param {{ history: GuideHistory, topicId: string, pin: { translatedFromHash: string, translatedAt: string } }} args
 * @returns {Finding & Record<string, unknown>}
 */
export function classifyPin({ history, topicId, pin }) {
  const head = snapshotAt(history, null);
  const recordedHash = pin.translatedFromHash;
  const base = { topicId, recordedHash, translatedAt: pin.translatedAt };
  if (!head.topics[topicId]) return { ...base, verdict: "orphaned" };
  const currentHash = currentHashes(history)[topicId];
  const found = { ...base, currentHash };
  if (recordedHash === currentHash) return { ...found, verdict: "fresh", cause: CAUSE.EXACT };

  const anchor = findAnchor(history, topicId, recordedHash, pin.translatedAt);
  if (!anchor) {
    return {
      ...found,
      verdict: "stale",
      cause: CAUSE.UNVERIFIED,
      anchorRev: null,
      candidatesTried: candidatesFor(history, pin.translatedAt).length,
    };
  }
  const { variant } = anchor;
  const anchored = {
    ...found,
    anchorRev: anchor.rev,
    anchorTime: anchor.time,
    variant: `${variant.extractor}/${variant.eol}`,
  };
  const then = unitAt(anchor.snap, topicId);
  const now = unitAt(head, topicId);
  if (!then || !now || !sameUnit(then, now)) {
    return {
      ...anchored,
      verdict: "stale",
      cause: CAUSE.CONTENT,
      diff: then && now ? unitDiff(then, now) : { body: [] },
    };
  }
  // English unchanged since the anchor: name the instrument difference(s).
  const instruments = [];
  if (variant.extractor === "legacy") {
    const legacy = bodiesOf(anchor.snap, variant)[topicId] ?? "";
    const scanner = bodiesOf(anchor.snap, { extractor: "scanner", eol: variant.eol })[topicId];
    if (legacy !== scanner) instruments.push(CAUSE.EXTRACTOR);
  }
  if (bodiesOf(head, RAW)[topicId] !== normaliseEol(now.body, variant.eol)) instruments.push(CAUSE.EOL);
  if (instruments.length === 0) {
    // Unreachable if the variant set is closed and the units are equal (the
    // pin would then equal today's hash). Never guess fresh for it.
    return { ...anchored, verdict: "stale", cause: CAUSE.UNVERIFIED };
  }
  return { ...anchored, verdict: "fresh", cause: instruments[0], instruments };
}

function readLocaleMeta(history, lang) {
  const src = history.readAt(null, `${localeDir(lang)}/_meta.json`);
  if (src == null) return { topics: {} };
  try {
    return JSON.parse(src.replace(/^﻿/, ""));
  } catch {
    return { topics: {} };
  }
}

/** topicId -> locale content file name, for every body the locale carries. */
function localeBodyFiles(history, lang) {
  const dir = `${localeDir(lang)}/content`;
  const out = {};
  for (const name of history.listAt(null, dir)) {
    if (!name.endsWith(".ts") || name === "index.ts") continue;
    const text = history.readAt(null, `${dir}/${name}`);
    if (text == null) continue;
    for (const id of Object.keys(extractBodies(text, `${dir}/${name}`))) out[id] ??= name;
  }
  return out;
}

function classifyMissing(history, lang, topicId, bodyFiles) {
  const file = bodyFiles[topicId];
  if (!file) return { topicId, verdict: "missing", sub: SUB.ABSENT };
  const rel = `${localeDir(lang)}/content/${file}`;
  const intro = viaHistory(() => history.introducedIn(rel, topicId), `finding where ${topicId} entered ${rel}`);
  const finding = { topicId, verdict: "missing", sub: SUB.PRESENT_UNPINNED, localeFile: rel, anchorRev: intro?.rev ?? null };
  if (!intro) return finding;
  const then = unitAt(snapshotAt(history, intro.rev), topicId);
  const now = unitAt(snapshotAt(history, null), topicId);
  if (!then || !now) return { ...finding, anchorTime: intro.time, englishChangedSinceAnchor: null };
  const changed = !sameUnit(then, now);
  return {
    ...finding,
    anchorTime: intro.time,
    englishChangedSinceAnchor: changed,
    ...(changed ? { diff: unitDiff(then, now) } : {}),
  };
}

/**
 * Classify every locale in `locales` against today's English.
 * @param {{ history: GuideHistory, locales: readonly string[], topic?: string | null, now?: string | null }} args
 * @returns {Report}
 */
export function classifyGuide({ history, locales, topic = null, now = null }) {
  const head = snapshotAt(history, null);
  const englishIds = Object.keys(head.topics);
  /** @type {Report} */
  const report = {
    generated: now,
    source: {
      contentFiles: Object.keys(head.files).length,
      topicCount: englishIds.length,
      bodyCount: Object.keys(bodiesOf(head, RAW)).length,
    },
    locales: {},
  };
  for (const lang of locales) {
    const meta = readLocaleMeta(history, lang);
    const pins = meta.topics ?? {};
    const r = { fresh: [], stale: [], missing: [], orphaned: [] };
    let bodyFiles = null;
    for (const topicId of englishIds) {
      if (topic && topic !== topicId) continue;
      const pin = pins[topicId];
      if (!pin) {
        bodyFiles ??= localeBodyFiles(history, lang);
        r.missing.push(classifyMissing(history, lang, topicId, bodyFiles));
        continue;
      }
      const f = classifyPin({ history, topicId, pin });
      r[f.verdict].push(f);
    }
    for (const topicId of Object.keys(pins)) {
      if (!head.topics[topicId]) r.orphaned.push({ topicId, verdict: "orphaned", recordedHash: pins[topicId].translatedFromHash });
    }
    report.locales[lang] = r;
  }
  return report;
}

/** `--strict` fails on stale (content | unverified) or missing. Instrument causes are fresh. */
export function strictFails(report) {
  return Object.values(report.locales).some((r) => r.stale.length > 0 || r.missing.length > 0);
}

// ── Reporting ───────────────────────────────────────────────────────────────

function countBy(list, key) {
  const out = {};
  for (const f of list) out[f[key]] = (out[f[key]] ?? 0) + 1;
  return out;
}

function tally(r) {
  const fresh = countBy(r.fresh, "cause");
  const stale = countBy(r.stale, "cause");
  const missing = countBy(r.missing, "sub");
  const instrument = (fresh[CAUSE.EOL] ?? 0) + (fresh[CAUSE.EXTRACTOR] ?? 0);
  return { fresh, stale, missing, instrument };
}

const idList = (list) => list.slice(0, 5).map((f) => f.topicId).join(", ") + (list.length > 5 ? ", ..." : "");

function staleLine(r, t) {
  const parts = [`content ${t.stale[CAUSE.CONTENT] ?? 0}`];
  if (t.stale[CAUSE.UNVERIFIED]) parts.push(`unverified ${t.stale[CAUSE.UNVERIFIED]}`);
  const fold = t.instrument ? `; instrument ${t.instrument} folded into fresh` : "";
  return `stale ${r.stale.length} (${parts.join(", ")}${fold})`;
}

function missingLine(r, t) {
  const parts = [];
  if (t.missing[SUB.PRESENT_UNPINNED]) parts.push(`${t.missing[SUB.PRESENT_UNPINNED]} present-unpinned`);
  if (t.missing[SUB.ABSENT]) parts.push(`${t.missing[SUB.ABSENT]} absent`);
  return `missing ${r.missing.length} (${parts.join(", ")})`;
}

function freshLine(r, t) {
  const inst = [];
  if (t.fresh[CAUSE.EOL]) inst.push(`eol ${t.fresh[CAUSE.EOL]}`);
  if (t.fresh[CAUSE.EXTRACTOR]) inst.push(`extractor ${t.fresh[CAUSE.EXTRACTOR]}`);
  const tail = t.instrument ? `, instrument ${t.instrument}: ${inst.join(", ")}` : "";
  return `fresh ${r.fresh.length} (exact ${t.fresh[CAUSE.EXACT] ?? 0}${tail})`;
}

/** Human-readable report. */
export function formatReport(report) {
  const lines = [];
  const s = report.source;
  lines.push(`English source: ${s.topicCount} topics, ${s.bodyCount} bodies, ${s.contentFiles} content file(s)`, "");
  const total = { stale: 0, missing: 0, orphaned: 0, content: 0, unverified: 0, unpinned: 0, absent: 0, eol: 0, extractor: 0 };
  for (const [lang, r] of Object.entries(report.locales)) {
    const t = tally(r);
    total.stale += r.stale.length;
    total.missing += r.missing.length;
    total.orphaned += r.orphaned.length;
    total.content += t.stale[CAUSE.CONTENT] ?? 0;
    total.unverified += t.stale[CAUSE.UNVERIFIED] ?? 0;
    total.unpinned += t.missing[SUB.PRESENT_UNPINNED] ?? 0;
    total.absent += t.missing[SUB.ABSENT] ?? 0;
    total.eol += t.fresh[CAUSE.EOL] ?? 0;
    total.extractor += t.fresh[CAUSE.EXTRACTOR] ?? 0;
    const issues = r.stale.length + r.missing.length + r.orphaned.length;
    if (issues === 0) {
      lines.push(`${lang}: clean (${freshLine(r, t)})`);
      continue;
    }
    lines.push(`${lang}: ${issues} issue(s)`);
    if (r.stale.length) lines.push(`  ${staleLine(r, t)}: ${idList(r.stale)}`);
    if (r.missing.length) lines.push(`  ${missingLine(r, t)}: ${idList(r.missing)}`);
    if (r.orphaned.length) lines.push(`  orphaned ${r.orphaned.length}: ${idList(r.orphaned)}`);
    lines.push(`  ${freshLine(r, t)}`);
  }
  const drift = total.stale + total.missing;
  const n = Object.keys(report.locales).length;
  lines.push("");
  if (drift === 0) lines.push("All locales fresh.");
  lines.push(
    `Total drift: ${drift} topic(s) across ${n} locale(s)` +
      ` - stale ${total.stale} (content ${total.content}${total.unverified ? `, unverified ${total.unverified}` : ""})` +
      `, missing ${total.missing} (${total.unpinned} present-unpinned${total.absent ? `, ${total.absent} absent` : ""})`,
  );
  if (total.eol + total.extractor > 0) {
    lines.push(
      `Instrument churn folded into fresh: ${total.eol + total.extractor} (eol ${total.eol}, extractor ${total.extractor}); ` +
        `a bare hash comparison would report ${drift + total.eol + total.extractor}.`,
    );
  }
  if (total.orphaned) lines.push(`Orphaned pins: ${total.orphaned}.`);
  return lines.join("\n");
}

/**
 * The re-translation work order: one entry per topic whose English changed
 * since the translation's anchor, with the locales that carry it and the
 * English delta. Pins are identical across locales, so entries group them.
 */
export function workOrder(report) {
  const groups = new Map();
  for (const [lang, r] of Object.entries(report.locales)) {
    const items = [
      ...r.stale.filter((f) => f.cause === CAUSE.CONTENT).map((f) => ({ kind: "stale", f })),
      ...r.missing.filter((f) => f.englishChangedSinceAnchor).map((f) => ({ kind: "present-unpinned", f })),
    ];
    for (const { kind, f } of items) {
      const key = `${kind}\0${f.topicId}\0${f.anchorRev}\0${f.recordedHash ?? ""}`;
      if (!groups.has(key)) {
        groups.set(key, {
          kind,
          topicId: f.topicId,
          anchorRev: f.anchorRev,
          anchorTime: f.anchorTime ?? null,
          recordedHash: f.recordedHash ?? null,
          currentHash: f.currentHash ?? null,
          locales: [],
          diff: f.diff,
        });
      }
      groups.get(key).locales.push(lang);
    }
  }
  return [...groups.values()];
}

export function formatWorkOrder(report) {
  const entries = workOrder(report);
  const lines = [
    "# Guide re-translation work order",
    "",
    `${entries.length} entr${entries.length === 1 ? "y" : "ies"}. Each is a topic whose English changed after it was translated.`,
    "Apply the English delta below to the EXISTING translation in each listed locale; do not re-translate",
    "unchanged passages. Only after a topic is refreshed, set its _meta.json pin to the current hash",
    "from emit-source-hashes.mjs. Instrument-only differences (eol, extractor) are not listed: nothing to translate.",
  ];
  // Work is assigned per locale, so lead with the locale axis; the diffs below
  // are identical across locales and appear once per topic.
  const byLocale = new Map();
  for (const e of entries) {
    for (const lang of e.locales) {
      if (!byLocale.has(lang)) byLocale.set(lang, []);
      byLocale.get(lang).push(e.topicId);
    }
  }
  if (byLocale.size > 0) {
    lines.push("", "## By locale", "");
    for (const [lang, ids] of byLocale) lines.push(`- ${lang} (${ids.length}): ${ids.join(", ")}`);
  }
  for (const e of entries) {
    lines.push("", `## ${e.topicId}`, "");
    lines.push(
      e.kind === "stale"
        ? `- status: stale (English changed since the pinned translation)`
        : `- status: present-unpinned (translated, never pinned; English changed since the translation landed)`,
    );
    lines.push(`- locales (${e.locales.length}): ${e.locales.join(", ")}`);
    lines.push(`- English anchor: ${e.anchorRev ?? "unknown"}${e.anchorTime ? ` (${e.anchorTime})` : ""} -> working tree`);
    if (e.recordedHash) lines.push(`- pin: ${e.recordedHash} -> current ${e.currentHash}`);
    if (e.diff?.title) lines.push(`- title: "${e.diff.title[0]}" -> "${e.diff.title[1]}"`);
    if (e.diff?.description) lines.push(`- description: "${e.diff.description[0]}" -> "${e.diff.description[1]}"`);
    if (e.diff?.body?.length) lines.push("", "```diff", ...e.diff.body, "```");
  }
  return lines.join("\n");
}

const HISTORY_HELP =
  "The classifier verifies every translation pin against the English revision it was taken from. " +
  "Without git history it cannot separate instrument churn from real English edits, so it reports " +
  "nothing instead of guessing. Fetch full history (git fetch --unshallow; in GitHub Actions, " +
  "actions/checkout with fetch-depth: 0) and re-run.";

/**
 * The whole check as a pure function of an injected history: the CLI is a
 * thin wrapper that prints stdout/stderr and exits with exitCode.
 * @param {{ history: GuideHistory, locales: readonly string[], flags?: { json?: boolean, strict?: boolean, workOrder?: boolean, topic?: string | null }, now?: string | null }} args
 */
export function runDriftCheck({ history, locales, flags = {}, now = null }) {
  let report;
  try {
    if (history.assertAvailable) viaHistory(() => history.assertAvailable?.(), "checking git history");
    report = classifyGuide({ history, locales, topic: flags.topic ?? null, now });
  } catch (err) {
    if (err instanceof HistoryUnavailableError) {
      return {
        exitCode: EXIT.HISTORY_UNAVAILABLE,
        stdout: "",
        stderr: `[guide-translations] ${err.message}\n${HISTORY_HELP}`,
      };
    }
    throw err;
  }
  let stdout;
  if (flags.workOrder) {
    stdout = flags.json ? JSON.stringify({ generated: now, workOrder: workOrder(report) }, null, 2) : formatWorkOrder(report);
  } else {
    stdout = flags.json ? JSON.stringify(report, null, 2) : formatReport(report);
  }
  return { exitCode: flags.strict && strictFails(report) ? EXIT.DRIFT : EXIT.OK, stdout, stderr: "" };
}

// ── Git-backed history ──────────────────────────────────────────────────────

/**
 * GuideHistory over a real git checkout. Revision reads use `git show
 * <rev>:<path>` (the blob, never EOL-converted), so a revision always reads the
 * same on every OS; the VARIANTS supply the EOL a checkout may have had.
 * @param {string} repoRoot
 * @returns {GuideHistory & { assertAvailable(): void }}
 */
export function createGitHistory(repoRoot) {
  const git = (args) =>
    execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 512 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
  const firstLine = (err) => String(err?.stderr || err?.message || err).trim().split("\n")[0];
  let revisionLog = null;
  const introduced = new Map();

  return {
    assertAvailable() {
      let shallow;
      try {
        shallow = git(["rev-parse", "--is-shallow-repository"]).trim();
      } catch (err) {
        throw new HistoryUnavailableError(`git cannot read ${repoRoot} (${firstLine(err)})`, { cause: err });
      }
      if (shallow !== "false") {
        throw new HistoryUnavailableError(
          "shallow clone - the English revisions the pins were taken from are not in this checkout",
        );
      }
    },
    readAt(rev, rel) {
      if (rev === null) {
        const p = path.join(repoRoot, rel);
        return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
      }
      try {
        return git(["show", `${rev}:${rel}`]);
      } catch (err) {
        if (/does not exist in|exists on disk, but not in/.test(String(err?.stderr ?? ""))) return null;
        throw new HistoryUnavailableError(`cannot read ${rel} at ${rev} (${firstLine(err)})`, { cause: err });
      }
    },
    listAt(rev, dir) {
      if (rev === null) {
        const p = path.join(repoRoot, dir);
        return fs.existsSync(p) ? fs.readdirSync(p) : [];
      }
      return git(["ls-tree", "--name-only", rev, "--", `${dir}/`])
        .split("\n")
        .filter(Boolean)
        .map((p) => p.slice(p.lastIndexOf("/") + 1));
    },
    revisions({ until }) {
      revisionLog ??= git(["log", "--format=%H%x09%cI", "--", CONTENT_DIR, TOPICS_FILE])
        .split("\n")
        .filter(Boolean)
        .map((l) => {
          const [rev, time] = l.split("\t");
          return { rev, time };
        });
      const cutoff = Date.parse(until);
      return revisionLog.filter((r) => Date.parse(r.time) <= cutoff);
    },
    introducedIn(rel, key) {
      const dir = path.posix.dirname(rel);
      let seen = introduced.get(dir);
      if (!seen) {
        seen = new Map();
        const log = git(["log", "--reverse", "--format=>%H%x09%cI", "-p", "-U0", "--no-renames", "--no-color", "--", dir]);
        let commit = null;
        let file = null;
        let inHeader = false;
        for (const line of log.split("\n")) {
          if (line.startsWith(">")) {
            const [rev, time] = line.slice(1).trim().split("\t");
            commit = { rev, time };
            file = null;
            inHeader = false;
          } else if (line.startsWith("diff --git ")) {
            inHeader = true;
            file = null;
          } else if (inHeader && line.startsWith("+++ ")) {
            file = line.startsWith("+++ b/") ? line.slice(6).trimEnd() : null;
          } else if (line.startsWith("@@")) {
            inHeader = false;
          } else if (!inHeader && commit && file && line.startsWith("+")) {
            const m = /^\+\s*"([a-z][a-z0-9-]+)":\s*`/.exec(line);
            if (m && !seen.has(`${file}\0${m[1]}`)) seen.set(`${file}\0${m[1]}`, commit);
          }
        }
        introduced.set(dir, seen);
      }
      return seen.get(`${rel}\0${key}`) ?? null;
    },
  };
}
