#!/usr/bin/env node
/**
 * How agent commits fared, not just who wrote them.
 *
 *   node scripts/report-agent-rework.mjs [<range>] [--window N] [--list]
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
 * Default range is the last 300 non-merge commits on HEAD. Report-only: the
 * exit code is 0 unless git itself fails or the arguments are wrong. It is a
 * heuristic (a `fix:` can repair something older than the window, or touch the
 * same file for an unrelated reason), so read it as a trend between lanes, not
 * as a verdict on one commit; `--list` prints each reworked commit and the
 * commit that reworked it so a reviewer can check the pairing.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commitTypeAdvice, isAgentCommit } from "./check-ai-change.mjs";

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
 * skill), or `agent-other`.
 *
 * @param {string} message
 * @param {string[]} skills skill names to look for
 * @returns {string}
 */
export function laneOf(message, skills) {
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
  if (!Number.isInteger(window) || window < 1) {
    console.error("usage: node scripts/report-agent-rework.mjs [<range>] [--window N] [--list]");
    process.exit(2);
  }
  const range = args.find((a, i) => !a.startsWith("--") && (windowAt < 0 || i !== windowAt + 1));
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
