import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | null>();
let warned = false;

/** Last commit date of a repo-relative file, or null when git has no answer
 *  (shallow clone without the file's history, no .git, file untracked). */
function commitDate(file: string): Date | null {
  if (cache.has(file)) return cache.get(file) ?? null;
  let result: Date | null = null;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const d = out ? new Date(out) : null;
    result = d && !Number.isNaN(d.getTime()) ? d : null;
  } catch {
    result = null;
  }
  cache.set(file, result);
  return result;
}

/**
 * Newest commit date across `files`, so a sitemap `lastModified` moves only
 * when its content does. Falls back to `fallback` (the build date) when git
 * history is unavailable, logging once so the fallback is visible in CI.
 */
export function lastModifiedFromGit(files: string[], fallback: Date): Date {
  const dates = files.map(commitDate).filter((d): d is Date => d !== null);
  if (dates.length === 0) {
    if (!warned) {
      warned = true;
      console.warn("[sitemap] git history unavailable; lastModified falls back to the build date");
    }
    return fallback;
  }
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}
