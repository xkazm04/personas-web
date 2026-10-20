#!/usr/bin/env node
/**
 * Doc anchors → code that still exists.
 *
 * Feature docs and ADRs cite code by path and often by line
 * (`src/lib/supabaseApi.ts:831`, `[observability](observability.md)`). Agents
 * refactor constantly; nothing failed when a cited file moved, so docs decayed
 * silently into references a reader (or the next agent) cannot follow.
 *
 * What counts as an anchor:
 *   - a backtick span that is a repo path under src/ scripts/ e2e/ docs/
 *     eslint-rules/ public/, optionally suffixed `:12`, `:12-40` or `#L12`
 *     (globs and placeholders - `*`, `<name>`, `{a,b}` - are not anchors);
 *   - a relative markdown link `[text](path)` (http/mailto/#fragment skipped),
 *     resolved against the doc's folder.
 * An anchor is broken when its file/dir is gone, or when its line number is
 * past the end of the file.
 *
 * Which docs: the LIVING docs - docs/features/**, docs/decisions/**,
 * docs/AI_HARNESS.md, AGENTS.md, .claude/CLAUDE.md. The dated snapshot trees
 * (docs/harness/**, docs/concepts/**) record what was true on their date; they
 * are counted for visibility and never gated.
 *
 * Modes:
 *   node scripts/check-doc-anchors.mjs                → meter: counts over every
 *       living doc + snapshot count, exit 0 (add --list for each broken anchor,
 *       --strict to exit 1 on any broken living anchor).
 *   node scripts/check-doc-anchors.mjs --base <ref>   → GATE for a change set
 *       (<ref>...HEAD). Fails when
 *         (a) a living doc ADDED or MODIFIED in the change has a broken anchor -
 *             touching a doc means leaving its anchors true; or
 *         (b) the change DELETES or RENAMES a path that any living doc still
 *             cites - the refactor that would have orphaned the doc.
 *       Pre-existing breakage in docs the change does not touch is reported,
 *       not failed, so the gate ratchets without a hand-kept baseline.
 *
 * Runs in .github/workflows/agent-guidance.yml on every push and PR.
 * Instrument assertion: zero living docs scanned is a broken checker, not a pass.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const baseIdx = args.indexOf("--base");
const base = baseIdx >= 0 ? args[baseIdx + 1] : null;

const LIVING_DIRS = ["docs/features", "docs/decisions"];
const LIVING_FILES = ["docs/AI_HARNESS.md", "AGENTS.md", ".claude/CLAUDE.md"];
const SNAPSHOT_DIRS = ["docs/harness", "docs/concepts"];

const PATH_SPAN = /^(?:src|scripts|e2e|docs|eslint-rules|public)\/[^\s*<>{}$|`'"]+$/;

const toPosix = (p) => p.replace(/\\/g, "/");

function walkMd(dirRel, acc = []) {
  const abs = path.join(repoRoot, dirRel);
  if (!fs.existsSync(abs)) return acc;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dirRel}/${e.name}`;
    if (e.isDirectory()) walkMd(rel, acc);
    else if (e.name.endsWith(".md")) acc.push(rel);
  }
  return acc;
}

const livingDocs = [
  ...LIVING_DIRS.flatMap((d) => walkMd(d)),
  ...LIVING_FILES.filter((f) => fs.existsSync(path.join(repoRoot, f))),
].sort();

/** Split `path:12-40` / `path#L12` / `path:fnName` into { file, line }. */
function splitAnchor(raw) {
  let file = raw;
  let line = null;
  const hash = file.match(/#L(\d+)(?:-L?\d+)?$/);
  if (hash) {
    line = Number(hash[1]);
    file = file.slice(0, hash.index);
  }
  const colon = file.indexOf(":");
  if (colon >= 0) {
    const m = file.slice(colon + 1).match(/^L?(\d+)(?:-L?(\d+))?/);
    if (m) line = Number(m[2] ?? m[1]);
    file = file.slice(0, colon);
  }
  return { file: file.replace(/[.,;)]+$/, ""), line };
}

/** Every anchor in one doc, as repo-relative { target, line, docLine, raw }. */
function anchorsOf(docRel) {
  const text = fs.readFileSync(path.join(repoRoot, docRel), "utf8").replace(/\r\n?/g, "\n");
  const out = [];
  let fenced = false;
  text.split("\n").forEach((lineText, i) => {
    if (/^\s*(```|~~~)/.test(lineText)) {
      fenced = !fenced;
      return;
    }
    if (fenced) return;
    for (const m of lineText.matchAll(/`([^`\n]+)`/g)) {
      const span = m[1].trim();
      if (!PATH_SPAN.test(span)) continue;
      const { file, line } = splitAnchor(span);
      out.push({ target: file.replace(/\/+$/, ""), line, docLine: i + 1, raw: span });
    }
    // Inline-code spans are not links; blank them before reading links.
    const noCode = lineText.replace(/`[^`\n]*`/g, "");
    for (const m of noCode.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const href = m[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#") || href.startsWith("/")) continue;
      const { file, line } = splitAnchor(href.split("?")[0]);
      let decoded = file;
      try {
        decoded = decodeURI(file);
      } catch {
        // leave as written
      }
      const target = toPosix(path.normalize(path.join(path.dirname(docRel), decoded))).replace(/\/+$/, "");
      if (target.startsWith("..")) continue; // outside the repo
      out.push({ target, line, docLine: i + 1, raw: href });
    }
  });
  return out;
}

const lineCounts = new Map();
function brokenReason({ target, line }) {
  const abs = path.join(repoRoot, target);
  if (!fs.existsSync(abs)) return "missing";
  if (line == null || fs.statSync(abs).isDirectory()) return null;
  if (!lineCounts.has(target)) {
    lineCounts.set(target, fs.readFileSync(abs, "utf8").split("\n").length);
  }
  const n = lineCounts.get(target);
  return line > n ? `line ${line} > ${n} lines` : null;
}

function scan(docs) {
  const broken = [];
  let total = 0;
  for (const doc of docs) {
    for (const a of anchorsOf(doc)) {
      total++;
      const reason = brokenReason(a);
      if (reason) broken.push({ doc, ...a, reason });
    }
  }
  return { total, broken };
}

const fmt = (b) => `  ${b.doc}:${b.docLine}  ${b.raw}  (${b.reason})`;

// ── Instrument assertion ──────────────────────────────────────────────────────
if (livingDocs.length === 0) {
  console.error("[doc-anchors] BROKEN CHECKER: found 0 living docs to scan. Refusing to report clean.");
  process.exit(1);
}

const living = scan(livingDocs);
const snapshot = scan(SNAPSHOT_DIRS.flatMap((d) => walkMd(d)));
const summary =
  `[doc-anchors] living docs: ${livingDocs.length} docs, ${living.total} anchors, ${living.broken.length} broken` +
  ` | snapshots (not gated): ${snapshot.total} anchors, ${snapshot.broken.length} broken`;

function changeSet(ref) {
  const out = execFileSync("git", ["diff", "--name-status", "-M", `${ref}...HEAD`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const touched = new Set();
  const removed = new Set();
  for (const row of out.split("\n").filter(Boolean)) {
    const [status, a, b] = row.split("\t");
    if (status.startsWith("R")) {
      removed.add(toPosix(a));
      touched.add(toPosix(b));
    } else if (status === "D") removed.add(toPosix(a));
    else touched.add(toPosix(a));
  }
  return { touched, removed };
}

if (!base) {
  console.log(summary);
  if (flag("--list")) for (const b of living.broken) console.log(fmt(b));
  else if (living.broken.length) console.log("  (pass --list to print each broken anchor)");
  process.exit(flag("--strict") && living.broken.length ? 1 : 0);
}

let change;
try {
  change = changeSet(base);
} catch (err) {
  console.error(
    `[doc-anchors] BROKEN CHECKER: cannot diff ${base}...HEAD (${String(err.message).split("\n")[0]}).\n` +
      "  Fetch enough history (actions/checkout fetch-depth: 0) or pass a reachable --base.",
  );
  process.exit(1);
}

const failures = [];
// (a) docs touched by this change must leave every anchor true.
for (const b of living.broken) {
  if (change.touched.has(b.doc)) failures.push({ ...b, why: "doc changed here" });
}
// (b) paths removed by this change must not still be cited by a living doc.
for (const doc of livingDocs) {
  for (const a of anchorsOf(doc)) {
    for (const gone of change.removed) {
      const hit = a.target === gone || gone.startsWith(`${a.target}/`);
      if (hit && brokenReason(a)) {
        failures.push({ doc, ...a, reason: `${gone} removed/renamed here`, why: "path removed here" });
      }
    }
  }
}

console.log(summary);
const seen = new Set();
const unique = failures.filter((f) => {
  const k = `${f.doc}:${f.docLine}:${f.raw}`;
  return seen.has(k) ? false : (seen.add(k), true);
});
if (unique.length) {
  console.error(`[doc-anchors] FAIL - ${unique.length} anchor(s) broken by changes in ${base}...HEAD:`);
  for (const f of unique) console.error(fmt(f));
  console.error(
    "  Point each anchor at where the code lives now (or drop it). Living docs must stay followable;\n" +
      "  see the header of scripts/check-doc-anchors.mjs.",
  );
  process.exit(1);
}
console.log(`[doc-anchors] OK - no anchor broken by ${base}...HEAD (${change.touched.size} touched, ${change.removed.size} removed path(s))`);
if (flag("--list")) for (const b of living.broken) console.log(fmt(b));
