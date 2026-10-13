#!/usr/bin/env node
/**
 * How agent commits fared, not just who wrote them.
 *
 *   node scripts/report-agent-rework.mjs [<range>] [--window N] [--list] [--strict] [--block-in <pr-range>]
 *
 * The trailers (`Co-Authored-By: Claude`, `Ascent-Resolves:`) mark which
 * commits an agent wrote. This reads them back to answer the next question:
 * how often did that work need a follow-up fix? A commit counts as REWORKED
 * when one of the next N commits (default 10) touches a file it touched AND
 * either reads as a repair (`fix`/`revert` subject) or resolves the same
 * Ascent item again. The rate is printed per lane (an Ascent lane, a named
 * skill, other agent work) next to the same rate for human commits, which is
 * the baseline that makes the agent number mean anything.
 *
 * Default range is the last 300 non-merge commits on HEAD. A lane over the
 * rework budget (`REWORK_BUDGET`) gets a `FLAG` line. Flag, not gate: the exit
 * code is 0 unless git itself fails or the arguments are wrong, and `--strict`
 * (exit 1 on any flag) is there for a runner that wants to pause the lane. It is a
 * heuristic (a `fix:` can repair something older than the window, or touch the
 * same file for an unrelated reason), so read it as a trend between lanes, not
 * as a verdict on one commit; `--list` prints each reworked commit and the
 * commit that reworked it so a reviewer can check the pairing.
 *
 * Hard band. A lane far past the budget (`HARD_REWORK_BUDGET`) is no longer a
 * trend to read, and an advisory flag on it is easy to scroll past. With
 * `--block-in <pr-range>` the meter prints a `BLOCK` line and exits 1 for each
 * lane over the hard band that also has a commit in that range, so the PR that
 * would add to a struggling lane's record stops, and a PR from anyone else does
 * not. The FLAG band stays advisory.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commitTypeAdvice, isAgentCommit, isLaneShaped } from "./check-ai-change.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Files every kind of commit touches; sharing one says nothing about rework. */
export const NOISE_FILES = new Set([
  "package-lock.json",
  "package.json",
  "CHANGELOG.md",
  "context-map.json",
  "bundle-budget.json",
]);

/**
 * `git log --format=%x1e%H%x1f%B%x1f --name-only` output -> commits, newest
 * first as git prints them.
 *
 * @param {string} text
 * @returns {{ sha: string, message: string, files: string[] }[]}
 */
export function parseLog(text) {
  const out = [];
  for (const chunk of text.split("\x1e")) {
    if (!chunk.trim()) continue;
    const [sha = "", message = "", filesBlock = ""] = chunk.split("\x1f");
    out.push({
      sha: sha.trim(),
      message: message.trim(),
      files: filesBlock.split(/\r?\n/).map((f) => f.trim()).filter(Boolean),
    });
  }
  return out;
}

/**
 * Every `Ascent-Resolves:` id in a message.
 *
 * @param {string} message
 * @returns {string[]}
 */
export function resolvesOf(message) {
  return [...message.matchAll(/^Ascent-Resolves:\s*(\S+)/gim)].map((m) => m[1]);
}

/**
 * The group a commit is counted under: `human`, `ascent` (a lane commit),
 * `skill:<name>` (an agent commit whose message names a registry or project
 * skill), `agent-other`, or `lane-untrailered` (no agent trailer, but a subject
 * in the lane runner's template, so it is not counted into the human baseline).
 *
 * @param {string} message
 * @param {string[]} skills skill names to look for
 * @returns {string}
 */
export function laneOf(message, skills) {
  if (!isAgentCommit(message) && isLaneShaped(message)) return "lane-untrailered";
  if (!isAgentCommit(message)) return "human";
  if (resolvesOf(message).length) return "ascent";
  // Several skill names are plain words ("perfect", "friend", "consult"), so a
  // skill only counts when the message names it as one: `/name`, a backticked
  // `name`, or "name skill".
  for (const skill of skills) {
    const s = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const named = new RegExp(`(^|[\\s(])/${s}\\b|\`/?${s}\`|\\b${s} skill\\b`, "im");
    if (named.test(message)) return `skill:${skill}`;
  }
  return "agent-other";
}

/**
 * True when `later` reads as a follow-up repair of `earlier`.
 *
 * @param {{ message: string, files: string[] }} earlier
 * @param {{ message: string, files: string[] }} later
 * @returns {boolean}
 */
export function isReworkOf(earlier, later) {
  const touched = new Set(earlier.files.filter((f) => !NOISE_FILES.has(f)));
  if (!later.files.some((f) => touched.has(f))) return false;
  const [subject = ""] = later.message.split(/\r?\n/);
  if (/^revert\b/i.test(subject) || /^revert(\([^)]*\))?!?:/i.test(subject)) return true;
  // Lane commits are typed `fix:` whatever they do ("fix: Added threat
  // model"); the commit-type gate already knows an additive `fix:` is not a
  // repair, so only a `fix:` it leaves alone counts.
  if (/^fix(\([^)]*\))?!?:/i.test(subject) && commitTypeAdvice(subject).length === 0) return true;
  const ids = new Set(resolvesOf(earlier.message));
  return resolvesOf(later.message).some((id) => ids.has(id));
}

/**
 * Rework counts per lane. `commits` is oldest first.
 *
 * @param {{ sha: string, message: string, files: string[] }[]} commits
 * @param {{ window?: number, skills?: string[] }} [options]
 * @returns {{ rows: { lane: string, commits: number, reworked: number, rate: number }[], pairs: { sha: string, by: string, lane: string }[] }}
 */
export function reworkReport(commits, { window = 10, skills = [] } = {}) {
  /** @type {Map<string, { commits: number, reworked: number }>} */
  const tally = new Map();
  /** @type {{ sha: string, by: string, lane: string }[]} */
  const pairs = [];
  commits.forEach((commit, i) => {
    const lane = laneOf(commit.message, skills);
    const row = tally.get(lane) ?? { commits: 0, reworked: 0 };
    row.commits++;
    const fixer = commits.slice(i + 1, i + 1 + window).find((later) => isReworkOf(commit, later));
    if (fixer) {
      row.reworked++;
      pairs.push({ sha: commit.sha, by: fixer.sha, lane });
    }
    tally.set(lane, row);
  });
  const rows = [...tally.entries()]
    .map(([lane, r]) => ({ lane, ...r, rate: r.commits ? r.reworked / r.commits : 0 }))
    .sort((a, b) => (a.lane === "human" ? 1 : b.lane === "human" ? -1 : b.commits - a.commits));
  return { rows, pairs };
}

/**
 * The rework budget. A lane is over budget when its rate passes an absolute
 * ceiling, or the human baseline by more than a margin. The human comparison
 * only applies when the human row is itself big enough to mean anything, and
 * no lane is judged on fewer than `minCommits` commits: one reworked commit
 * out of two is noise, not a trend.
 */
export const REWORK_BUDGET = Object.freeze({ maxRate: 0.25, overHuman: 0.1, minCommits: 10 });

/**
 * Agent lanes over the rework budget, with the reason each one tripped.
 *
 * @param {{ lane: string, commits: number, reworked: number, rate: number }[]} rows
 * @param {{ maxRate?: number, overHuman?: number, minCommits?: number }} [budget]
 * @returns {{ lane: string, rate: number, reason: string }[]}
 */
export function budgetFlags(rows, budget = {}) {
  const { maxRate, overHuman, minCommits } = { ...REWORK_BUDGET, ...budget };
  const pct = (/** @type {number} */ r) => `${(r * 100).toFixed(1)}%`;
  const human = rows.find((r) => r.lane === "human");
  const baseline = human && human.commits >= minCommits ? human.rate : null;
  const out = [];
  for (const r of rows) {
    if (r.lane === "human" || r.commits < minCommits) continue;
    if (r.rate > maxRate) {
      out.push({ lane: r.lane, rate: r.rate, reason: `${pct(r.rate)} is over the ${pct(maxRate)} ceiling` });
    } else if (baseline !== null && r.rate > baseline + overHuman) {
      out.push({
        lane: r.lane,
        rate: r.rate,
        reason: `${pct(r.rate)} is more than ${pct(overHuman)} over the human ${pct(baseline)}`,
      });
    }
  }
  return out;
}

/**
 * The hard band: twice the FLAG ceiling, a wider margin over the human rate, and
 * twice the commits before a lane is judged at all. A lane past this is not a
 * heuristic wobble; half its commits needed a follow-up repair.
 */
export const HARD_REWORK_BUDGET = Object.freeze({ maxRate: 0.5, overHuman: 0.3, minCommits: 20 });

/**
 * Lanes over the hard band that also have a commit in the range under review.
 * A lane that is over the band but adds nothing to this range is left to the
 * FLAG annotation: blocking it here would stop a PR it took no part in.
 *
 * @param {{ lane: string, commits: number, reworked: number, rate: number }[]} rows
 * @param {string[]} rangeLanes the lane of each commit in the range under review
 * @param {{ maxRate?: number, overHuman?: number, minCommits?: number }} [budget]
 * @returns {{ lane: string, rate: number, reason: string }[]}
 */
export function hardBlocks(rows, rangeLanes, budget = HARD_REWORK_BUDGET) {
  const present = new Set(rangeLanes);
  return budgetFlags(rows, { ...HARD_REWORK_BUDGET, ...budget }).filter((f) => present.has(f.lane));
}

/**
 * Skill names this repo knows: `.ai/manifest.yaml` `skills:` plus the
 * project-owned directories under `.claude/skills/`.
 *
 * @param {string} manifestText
 * @param {string[]} projectSkills
 * @returns {string[]}
 */
export function skillNames(manifestText, projectSkills = []) {
  const block = /^skills:\s*\r?\n((?:[ \t]+-[^\n]*\r?\n?)+)/m.exec(manifestText);
  const listed = block ? [...block[1].matchAll(/-\s*([\w-]+)/g)].map((m) => m[1]) : [];
  return [...new Set([...listed, ...projectSkills])];
}

function main() {
  const args = process.argv.slice(2);
  const windowAt = args.indexOf("--window");
  const window = windowAt >= 0 ? Number(args[windowAt + 1]) : 10;
  const blockAt = args.indexOf("--block-in");
  const blockRange = blockAt >= 0 ? args[blockAt + 1] : undefined;
  if (!Number.isInteger(window) || window < 1 || (blockAt >= 0 && (!blockRange || blockRange.startsWith("--")))) {
    console.error(
      "usage: node scripts/report-agent-rework.mjs [<range>] [--window N] [--list] [--strict] [--block-in <pr-range>]",
    );
    process.exit(2);
  }
  const valueAt = new Set([windowAt, blockAt].filter((i) => i >= 0).map((i) => i + 1));
  const range = args.find((a, i) => !a.startsWith("--") && !valueAt.has(i));
  const rangeArgs = range ? [range] : ["-n", "300", "HEAD"];

  const manifestPath = path.join(REPO_ROOT, ".ai", "manifest.yaml");
  const skillsDir = path.join(REPO_ROOT, ".claude", "skills");
  const projectSkills = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  const skills = skillNames(fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "", projectSkills);

  const log = execFileSync(
    "git",
    ["log", "--no-merges", "--format=%x1e%H%x1f%B%x1f", "--name-only", ...rangeArgs],
    { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const commits = parseLog(log).reverse();
  const { rows, pairs } = reworkReport(commits, { window, skills });

  console.log(`[agent-rework] ${commits.length} commits, follow-up window ${window}`);
  for (const r of rows) {
    console.log(`  ${r.lane.padEnd(24)} ${String(r.reworked).padStart(4)}/${String(r.commits).padEnd(4)} reworked = ${(r.rate * 100).toFixed(1)}%`);
  }
  if (args.includes("--list")) {
    for (const p of pairs) console.log(`  ${p.sha.slice(0, 8)} (${p.lane}) reworked by ${p.by.slice(0, 8)}`);
  }
  const flags = budgetFlags(rows);
  for (const f of flags) console.log(`  FLAG ${f.lane}: ${f.reason}`);
  if (blockRange) {
    const rangeLog = execFileSync("git", ["log", "--no-merges", "--format=%x1e%H%x1f%B%x1f", blockRange], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    const rangeLanes = parseLog(rangeLog).map((c) => laneOf(c.message, skills));
    const blocks = hardBlocks(rows, rangeLanes);
    for (const b of blocks) console.log(`  BLOCK ${b.lane}: ${b.reason} (hard band), and ${blockRange} adds to it`);
    if (blocks.length) process.exit(1);
  }
  if (flags.length && args.includes("--strict")) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
