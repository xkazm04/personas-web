#!/usr/bin/env node
/**
 * What each agent lane's surviving work cost, not only whether it held.
 *
 *   node scripts/report-lane-cost.mjs [<range>] [--window N]
 *
 * scripts/report-agent-rework.mjs answers "how often did a lane's commit need a
 * follow-up fix". That is the quality half. The scaling decision also needs the
 * price: tokens and wall-clock spent per change that was NOT reworked. A lane
 * with a fine rework rate can still be the wrong tool when each surviving change
 * costs ten times what a person would have spent.
 *
 * Spend is read from two optional trailers a lane runner writes next to
 * `Ascent-Resolves:` (the contract is in docs/AI_HARNESS.md, "What a lane's
 * work cost"):
 *
 *   Ascent-Tokens: 412000        total input + output tokens for the cycle
 *   Ascent-Wall-Clock: 540       seconds, cycle start to commit
 *
 * Lanes, rework and the follow-up window come from report-agent-rework.mjs, so
 * the two reports can never disagree about which commit belongs to which lane
 * or which one survived. A lane whose commits carry no spend trailers prints
 * "no cost data" rather than a zero, because an unmeasured lane is not a free
 * one.
 *
 * A lane over `COST_REVIEW` gets a `REVIEW` line. Like the rework FLAG band it
 * is advisory: the exit code is 0 unless git fails or the arguments are wrong.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { laneOf, parseLog, reworkReport, skillNames } from "./report-agent-rework.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The spend one commit declares. A missing or malformed trailer is `null`,
 * never 0: a zero would read as a free change and pull the lane's average down.
 *
 * @param {string} message
 * @returns {{ tokens: number | null, seconds: number | null }}
 */
export function costOf(message) {
  const tokens = /^Ascent-Tokens:[ \t]*(\d+)[ \t]*$/im.exec(message);
  const seconds = /^Ascent-Wall-Clock:[ \t]*(\d+)s?[ \t]*$/im.exec(message);
  return {
    tokens: tokens ? Number(tokens[1]) : null,
    seconds: seconds ? Number(seconds[1]) : null,
  };
}

/**
 * Spend per agent lane. `commits` is oldest first, as for `reworkReport`.
 *
 * A commit is COSTED when it declares tokens. The cost of a surviving change is
 * everything the lane's costed commits spent, reworked ones included (that
 * spend bought nothing that lasted), divided by the costed commits that
 * survived. `tokensPerSurvivor` is `null` when nothing costed survived.
 *
 * @param {{ sha: string, message: string, files: string[] }[]} commits
 * @param {{ window?: number, skills?: string[] }} [options]
 * @returns {{ lane: string, commits: number, costed: number, survivors: number, tokens: number, seconds: number, tokensPerSurvivor: number | null, secondsPerSurvivor: number | null }[]}
 */
export function costReport(commits, { window = 10, skills = [] } = {}) {
  const reworked = new Set(reworkReport(commits, { window, skills }).pairs.map((p) => p.sha));
  /** @type {Map<string, { commits: number, costed: number, survivors: number, tokens: number, seconds: number }>} */
  const tally = new Map();
  for (const commit of commits) {
    const lane = laneOf(commit.message, skills);
    if (lane === "human") continue;
    const row = tally.get(lane) ?? { commits: 0, costed: 0, survivors: 0, tokens: 0, seconds: 0 };
    row.commits++;
    const cost = costOf(commit.message);
    if (cost.tokens !== null) {
      row.costed++;
      row.tokens += cost.tokens;
      row.seconds += cost.seconds ?? 0;
      if (!reworked.has(commit.sha)) row.survivors++;
    }
    tally.set(lane, row);
  }
  return [...tally.entries()]
    .map(([lane, r]) => ({
      lane,
      ...r,
      tokensPerSurvivor: r.survivors ? r.tokens / r.survivors : null,
      secondsPerSurvivor: r.survivors ? r.seconds / r.survivors : null,
    }))
    .sort((a, b) => b.commits - a.commits);
}

/**
 * The review line. A lane is worth narrowing on cost when a surviving change
 * costs more than `tokensPerSurvivor`, judged only once `minCosted` of its
 * commits declare spend. Set before anyone had measured a lane here, as the
 * rework budget was: the first run with trailers prints the real figure, and
 * the owner moves this line in the same commit that records it.
 */
export const COST_REVIEW = Object.freeze({ tokensPerSurvivor: 2_000_000, minCosted: 10 });

/**
 * Lanes whose surviving changes cost more than the review line.
 *
 * @param {{ lane: string, costed: number, tokensPerSurvivor: number | null }[]} rows
 * @param {{ tokensPerSurvivor?: number, minCosted?: number }} [review]
 * @returns {{ lane: string, reason: string }[]}
 */
export function costFlags(rows, review = {}) {
  const { tokensPerSurvivor, minCosted } = { ...COST_REVIEW, ...review };
  const out = [];
  for (const r of rows) {
    if (r.costed < minCosted) continue;
    if (r.tokensPerSurvivor === null) {
      out.push({ lane: r.lane, reason: `none of ${r.costed} costed commits survived` });
    } else if (r.tokensPerSurvivor > tokensPerSurvivor) {
      out.push({
        lane: r.lane,
        reason: `${Math.round(r.tokensPerSurvivor)} tokens per surviving change is over ${tokensPerSurvivor}`,
      });
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const windowAt = args.indexOf("--window");
  const window = windowAt >= 0 ? Number(args[windowAt + 1]) : 10;
  if (!Number.isInteger(window) || window < 1) {
    console.error("usage: node scripts/report-lane-cost.mjs [<range>] [--window N]");
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
  const rows = costReport(commits, { window, skills });

  console.log(`[lane-cost] ${commits.length} commits, follow-up window ${window}`);
  for (const r of rows) {
    const label = `  ${r.lane.padEnd(24)} ${String(r.costed).padStart(4)}/${String(r.commits).padEnd(4)} costed`;
    if (r.costed === 0) {
      console.log(`${label}  no cost data`);
    } else if (r.tokensPerSurvivor === null || r.secondsPerSurvivor === null) {
      console.log(`${label}  ${r.tokens} tokens, ${r.seconds}s, no surviving change`);
    } else {
      console.log(
        `${label}  ${Math.round(r.tokensPerSurvivor)} tokens, ${Math.round(r.secondsPerSurvivor)}s per surviving change (${r.survivors} survived)`,
      );
    }
  }
  for (const f of costFlags(rows)) console.log(`  REVIEW ${f.lane}: ${f.reason}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
