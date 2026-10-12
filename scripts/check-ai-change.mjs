#!/usr/bin/env node
/**
 * Review gate for AI-authored commits.
 *
 *   node scripts/check-ai-change.mjs <base>..<head>   # e.g. origin/master..HEAD
 *
 * Every change, human or agent, passes the `checks` job in CI. This gate adds
 * the checks for mistakes agents make and people rarely do. It looks only at
 * commits that carry an agent trailer (`Co-Authored-By: Claude ...` or
 * `Ascent-Resolves:`), and fails on:
 *
 *   1. Hallucinated anchors. A backticked repo path (`src/lib/x.ts`,
 *      `src/lib/x.ts:42`) or a relative markdown link on a line the commit
 *      added to a .md file, where the path is not tracked at <head> or the line
 *      is past the end of the file. Only added lines are read, so older docs
 *      and dated audit snapshots are not re-litigated.
 *   2. Protected paths. A committed `.env*` other than `.env.example`, or any
 *      write under `.claude/` (repo law; unattended lanes may not touch it).
 *   3. Scope creep against `.ai/manifest.yaml` `scope.does_not` ("backend
 *      services, data layer ..."). A new API route or a new SQL file adds
 *      backend surface, which needs the owner's decision first.
 *
 * Provenance. A trailer is text: an agent commit can leave it out. So a commit
 * with no agent trailer is skipped only when it is signed (`%G?` = `G`); an
 * unsigned untrailered commit runs the same checks and its problems print as
 * warnings. `--strict-provenance` (or AI_GATE_STRICT_PROVENANCE=1) fails them
 * instead, for once lane commits are signed (docs/AI_HARNESS.md "Provenance").
 *
 * Escape hatch, visible in the log: a commit line `AI-Gate-Override: <reason>`
 * skips checks 2 and 3 for that commit and prints the reason. It does not
 * skip anchors, because a reference to a file that does not exist is never right.
 *
 * Only reported, never failed on: the CLAUDE.md commit format
 * (`<pass-id>/<area>: ...` with Why / Risk / Verified lines). Lane commits are
 * written by the lane runner, not the agent, and use a conventional subject.
 * That conventional type is reported too when it misnames the change (a
 * `fix:` that adds a feature, a `feat:` that only touches docs).
 *
 * Exits 0 when nothing is wrong (or no agent commit is in range), 1 otherwise.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** True when the commit message carries an agent trailer. */
export function isAgentCommit(message) {
  return /^Co-Authored-By:\s*Claude\b/im.test(message) || /^Ascent-Resolves:/im.test(message);
}

/**
 * Who a commit claims to be, by trailer and by signature. `sigStatus` is git's
 * `%G?` letter: only `G` (a good signature from a trusted key) counts as
 * verified, because a trailer is text anyone can write or leave out.
 *
 * @param {string} message
 * @param {string} sigStatus
 * @returns {"agent" | "verified" | "unverified"}
 */
export function classifyCommit(message, sigStatus) {
  if (isAgentCommit(message)) return "agent";
  return sigStatus === "G" ? "verified" : "unverified";
}

/**
 * What the gate does with a commit of that class. An agent commit fails on a
 * problem. A verified commit without a trailer is a person's and is skipped. An
 * unverified commit without a trailer could be an agent commit that dropped its
 * trailer: today its problems are printed as warnings (flag now), and with
 * `strict` they fail like an agent's (fail later, once lane commits are signed).
 *
 * @param {"agent" | "verified" | "unverified"} kind
 * @param {boolean} strict
 * @returns {"fail" | "warn" | "skip"}
 */
export function gateMode(kind, strict) {
  if (kind === "agent") return "fail";
  if (kind === "verified") return "skip";
  return strict ? "fail" : "warn";
}

/** The override reason, or null when the commit has none. */
export function overrideOf(message) {
  const m = /^AI-Gate-Override:\s*(\S.*)$/im.exec(message);
  return m ? m[1].trim() : null;
}

/** Paths an agent commit may not write. `status` is git's A/M/D/R letter. */
export function protectedPathProblems(changes) {
  const out = [];
  for (const { status, file } of changes) {
    if (status === "D") continue;
    const base = file.split("/").pop() ?? "";
    if (/^\.env/.test(base) && base !== ".env.example") out.push(`${file}: env files are never committed`);
    else if (file.startsWith(".claude/")) out.push(`${file}: .claude/ is repo law, edited by the owner`);
  }
  return out;
}

/**
 * Added files that cross `.ai/manifest.yaml` scope.does_not. The manifest
 * names domains, so this map turns them into paths.
 */
export const OUT_OF_SCOPE_ADDS = [
  { pattern: /^src\/app\/api\/.+\/route\.ts$/, why: "a new API route is backend-service surface" },
  { pattern: /\.sql$/, why: "a new SQL file is data-layer surface" },
];

export function scopeProblems(changes) {
  const out = [];
  for (const { status, file } of changes) {
    if (status !== "A") continue;
    const hit = OUT_OF_SCOPE_ADDS.find((r) => r.pattern.test(file));
    if (hit) out.push(`${file}: ${hit.why} (manifest scope.does_not)`);
  }
  return out;
}

/** CLAUDE.md commit format, reported as advice. */
export function formatAdvice(message) {
  const [subject = ""] = message.split(/\r?\n/);
  const out = [];
  if (!/^[\w.-]+\/[\w./-]+:\s\S/.test(subject)) out.push("subject is not `<pass-id>/<area>: <what changed>`");
  for (const key of ["Why", "Risk", "Verified"]) {
    if (!new RegExp(`^${key}:`, "m").test(message)) out.push(`no \`${key}:\` line`);
  }
  return out;
}

/** Leading verbs that describe something new, never a repair. */
const ADDITIVE_VERBS = new Set([
  "add", "added", "adds", "create", "created", "creates", "implement", "implemented",
  "implements", "introduce", "introduced", "introduces", "new",
]);

/** The conventional type a change set calls for when every file is one kind. */
function kindOf(file) {
  if (file.startsWith(".github/")) return "ci";
  if (/\.test\.[cm]?[jt]sx?$/.test(file) || file.startsWith("e2e/")) return "test";
  if (file.endsWith(".md")) return "docs";
  return null;
}

/**
 * Conventional-commit type vs what the commit did, reported as advice. A
 * `fix:` whose subject opens with "Added ..." is a feature, and a `fix:`/`feat:`
 * that only touches docs, tests or CI is `docs:`/`test:`/`ci:`; anything that
 * reads commit types (git log filters, release tooling) otherwise files it
 * under the wrong heading.
 *
 * @param {string} message
 * @param {{ status: string, file: string }[]} [changes] git's name-status list
 * @returns {string[]}
 */
export function commitTypeAdvice(message, changes = []) {
  const [subject = ""] = message.split(/\r?\n/);
  const m = /^(\w+)(?:\([^)]*\))?!?:\s*(\S+)/.exec(subject);
  if (!m) return [];
  const type = m[1].toLowerCase();
  const verb = m[2].toLowerCase().replace(/[^a-z]/g, "");
  const out = [];
  if (type === "fix" && ADDITIVE_VERBS.has(verb)) {
    out.push(`\`fix:\` subject opens with "${m[2]}", which adds rather than repairs; use \`feat:\` (or docs/test/ci/chore)`);
  }
  if (type === "fix" || type === "feat") {
    const kinds = new Set(changes.map((c) => kindOf(c.file)));
    const [only] = kinds;
    if (changes.length && kinds.size === 1 && only) out.push(`every file is ${only}; type it \`${only}:\`, not \`${type}:\``);
  }
  return out;
}

const SKIP_TOKEN = /[*<>{}$\s|]|^\.\.?\/|^\/|:\/\//;

/**
 * Repo anchors on one markdown line: backticked `path` or `path:line[-line]`
 * whose first segment is a tracked top-level entry, and relative links.
 */
export function anchorsOf(line, mdFile, topLevel) {
  const out = [];
  for (const m of line.matchAll(/`([^`\n]+)`/g)) {
    const token = m[1].trim();
    if (SKIP_TOKEN.test(token)) continue;
    const am = /^(.+?)(?::(\d+)(?:-(\d+))?)?$/.exec(token);
    if (!am) continue;
    const p = am[1].replace(/\/$/, "");
    if (!am[1].includes("/") || !topLevel.has(p.split("/")[0])) continue;
    out.push({ path: p, line: am[3] ? Number(am[3]) : am[2] ? Number(am[2]) : null });
  }
  for (const m of line.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1].split("#")[0];
    if (!target || /^[a-z]+:/i.test(target) || target.startsWith("/")) continue;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(mdFile), target)).replace(/\/$/, "");
    if (resolved.startsWith("..")) continue;
    out.push({ path: resolved, line: null });
  }
  return out;
}

/**
 * Anchor problems for the lines a commit added to `mdFile`.
 * `tracked(p)` answers whether p is a tracked file or directory;
 * `lineCount(p)` the line count of a tracked file.
 */
export function anchorProblems(mdFile, addedLines, { topLevel, tracked, lineCount }) {
  const out = [];
  for (const line of addedLines) {
    for (const a of anchorsOf(line, mdFile, topLevel)) {
      if (!tracked(a.path)) out.push(`${mdFile}: \`${a.path}\` does not exist`);
      else if (a.line !== null && a.line > lineCount(a.path)) {
        out.push(`${mdFile}: \`${a.path}:${a.line}\` is past the end of the file (${lineCount(a.path)} lines)`);
      }
    }
  }
  return out;
}

/** `git show --unified=0` output -> { file: addedLines[] } for .md files. */
export function addedMarkdownLines(diff) {
  const out = {};
  let file = null;
  for (const line of diff.split(/\r?\n/)) {
    const h = /^\+\+\+ (?:b\/(.+)|\/dev\/null)$/.exec(line);
    if (h) {
      file = h[1] && h[1].endsWith(".md") ? h[1] : null;
      if (file) out[file] ??= [];
    } else if (file && line.startsWith("+") && !line.startsWith("+++")) {
      out[file].push(line.slice(1));
    }
  }
  return out;
}

const git = (...args) => execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** `%G?` for a commit; "N" (no signature) when git cannot say. */
function sigStatusOf(sha) {
  try {
    return git("log", "-1", "--format=%G?", sha).trim() || "N";
  } catch {
    return "N";
  }
}

function main() {
  const args = process.argv.slice(2);
  const range = args.find((a) => !a.startsWith("--"));
  const strict = args.includes("--strict-provenance") || process.env.AI_GATE_STRICT_PROVENANCE === "1";
  if (!range || !range.includes("..")) {
    console.error("usage: node scripts/check-ai-change.mjs <base>..<head> [--strict-provenance]");
    process.exit(2);
  }
  const head = range.split("..").pop() || "HEAD";

  const files = git("ls-tree", "-r", "--name-only", head).split("\n").filter(Boolean);
  const fileSet = new Set(files);
  const dirSet = new Set();
  for (const f of files) {
    const parts = f.split("/");
    for (let i = 1; i < parts.length; i++) dirSet.add(parts.slice(0, i).join("/"));
  }
  const topLevel = new Set(files.map((f) => f.split("/")[0]));
  const lines = new Map();
  const ctx = {
    topLevel,
    tracked: (p) => fileSet.has(p) || dirSet.has(p),
    lineCount: (p) => {
      if (!lines.has(p)) lines.set(p, git("show", `${head}:${p}`).split("\n").length);
      return lines.get(p);
    },
  };

  const shas = git("rev-list", "--no-merges", range).split("\n").filter(Boolean);
  let agentCommits = 0;
  let unverified = 0;
  let warned = 0;
  let failed = 0;
  for (const sha of shas) {
    const message = git("log", "-1", "--format=%B", sha);
    const kind = classifyCommit(message, sigStatusOf(sha));
    const mode = gateMode(kind, strict);
    if (mode === "skip") continue;
    if (kind === "agent") agentCommits++;
    else unverified++;
    const changes = git("show", "--name-status", "--no-renames", "--format=", sha)
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        const [status, file] = l.split("\t");
        return { status: status[0], file };
      });
    const override = overrideOf(message);
    const problems = override ? [] : [...protectedPathProblems(changes), ...scopeProblems(changes)];
    const added = addedMarkdownLines(git("show", "--unified=0", "--format=", sha, "--", "*.md"));
    for (const [md, addedLines] of Object.entries(added)) problems.push(...anchorProblems(md, addedLines, ctx));

    const subject = message.split("\n")[0];
    const short = sha.slice(0, 8);
    if (override) console.log(`${short} override: ${override}`);
    if (kind === "agent") {
      for (const a of [...formatAdvice(message), ...commitTypeAdvice(message, changes)]) console.log(`${short} advice: ${a}`);
    }
    if (problems.length && mode === "warn") {
      warned++;
      console.log(`\n${short} ${subject}`);
      console.log("  unsigned and no agent trailer; would fail with --strict-provenance:");
      for (const p of problems) console.log(`  - ${p}`);
    } else if (problems.length) {
      failed++;
      console.error(`\n${short} ${subject}`);
      for (const p of problems) console.error(`  - ${p}`);
    }
  }

  console.log(
    `\n${agentCommits} agent commit(s) and ${unverified} unsigned untrailered commit(s) of ${shas.length} in ${range}` +
      `${strict ? " (strict provenance)" : ""}; ${failed} failed, ${warned} warned.`,
  );
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
