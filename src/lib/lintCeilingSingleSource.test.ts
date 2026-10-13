import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The lint warning ceiling lives in one place: the `lint` script in
 * package.json (docs/decisions/2026-10-12-lint-warning-ceiling-ratchet.md,
 * decision 2). Every comment or doc that restated it has drifted: the
 * eslint.config.mjs header still says 13 and 24 after the ratchet reached a
 * lower number.
 *
 * This spec scans the config, guidance and docs an agent reads for
 * `--max-warnings <n>` and fails on any file that restates a number. The files
 * that already did are listed below. Their fix is the owner's, because lanes
 * may not edit a gate config or `.claude/`. The list can only shrink: once a
 * listed file stops restating the number, the spec fails until its entry is
 * removed.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Restaters waiting on the owner (the decision record's "Follow-up" section). */
const STALE_RESTATERS = ["eslint.config.mjs", ".claude/architect/config.md"];

/**
 * Dated records. Each one states the number that was true on its date, so
 * the number is history there, not a restated ceiling.
 */
const DATED_RECORDS = [
  ".claude/perfect/config.md", // the dated "lessons" log, one entry per run
  ".claude/illustrate/runs/", // per-run notes; `--max-warnings 0 <file>` is a scoped command
  "docs/concepts/mobile-revival/SURVEY.md", // a survey of the repo as it stood
];

const SCANNED_DIRS = [".claude", "docs", "scripts"];
const SCANNED_EXT = /\.(md|mjs|cjs|js|ts|json|ya?ml)$/;
const SKIPPED_DIRS = new Set(["node_modules", ".git", "worktrees"]);
const RESTATES = /--max-warnings[ =]\d+/;

function walk(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Links (.claude/skills, .claude/rules) point into the shared registry, not this repo.
    if (SKIPPED_DIRS.has(entry.name) || entry.isSymbolicLink()) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SCANNED_EXT.test(entry.name)) out.push(full);
  }
}

function scannedFiles(): string[] {
  const files: string[] = [];
  for (const dir of SCANNED_DIRS) walk(path.join(ROOT, dir), files);
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (entry.isFile() && entry.name !== "package.json" && SCANNED_EXT.test(entry.name)) {
      files.push(path.join(ROOT, entry.name));
    }
  }
  return files.map((f) => path.relative(ROOT, f).replace(/\\/g, "/"));
}

const restates = (rel: string) => RESTATES.test(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const isDated = (rel: string) => DATED_RECORDS.some((d) => (d.endsWith("/") ? rel.startsWith(d) : rel === d));

describe("lint warning ceiling", () => {
  it("is set by the lint script in package.json", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.lint).toMatch(/^eslint --max-warnings \d+$/);
  });

  it("is restated nowhere new", () => {
    const offenders = scannedFiles().filter(
      (rel) => !STALE_RESTATERS.includes(rel) && !isDated(rel) && restates(rel),
    );
    expect(offenders, "name the ceiling as `the --max-warnings ceiling in package.json`, not a number").toEqual([]);
  });

  it.each(STALE_RESTATERS)("still lists %s only while it restates the number", (rel) => {
    expect(restates(rel), `${rel} no longer restates the ceiling: remove it from STALE_RESTATERS`).toBe(true);
  });
});
