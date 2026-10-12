import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keeps docs/conventions-enforcement.md joined to .claude/CLAUDE.md and to the
 * enforcers it names.
 *
 * The page tells an agent which numbered convention a gate will catch and
 * which rests on its own care. It is only worth reading while it is true, so
 * this fails `test:unit` when:
 *   - CLAUDE.md gains, loses or renames a numbered convention the table does
 *     not mirror;
 *   - a row's level is not gate / partial / care;
 *   - an enforcer the table names is missing: a backticked repo path that does
 *     not exist, an `npm run` script package.json does not define, or a
 *     `custom-*` lint rule eslint.config.mjs does not register.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const CLAUDE = read(".claude/CLAUDE.md");
const DOC = read("docs/conventions-enforcement.md");
const ESLINT = read("eslint.config.mjs");
const SCRIPTS = Object.keys((JSON.parse(read("package.json")) as { scripts: Record<string, string> }).scripts);

/** `N. **Name**` items of CLAUDE.md § Conventions (non-negotiable). */
function claudeConventions(): string[] {
  const section = CLAUDE.split(/^## Conventions[^\n]*$/m)[1]?.split(/^## /m)[0] ?? "";
  return [...section.matchAll(/^(\d+)\. \*\*([^*]+)\*\*/gm)].map((m) => `${m[1]} ${m[2].trim()}`);
}

interface Row {
  key: string;
  name: string;
  level: string;
  enforcedBy: string;
  line: string;
}

function rows(): Row[] {
  const section = DOC.split(/^## Conventions\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const out: Row[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = /^\|\s*(\d+|G)\s*\|([^|]+)\|([^|]+)\|([^|]+)\|/.exec(line);
    if (m) out.push({ key: m[1], name: m[2].trim(), level: m[3].trim(), enforcedBy: m[4], line });
  }
  return out;
}

const table = rows();
const backticked = (text: string) => [...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1].trim());
const TOP_LEVEL = new Set(["src", "docs", "scripts", "eslint-rules", ".github", ".claude", "e2e"]);

describe("docs/conventions-enforcement.md", () => {
  it("has one row per numbered convention in .claude/CLAUDE.md, in order", () => {
    const expected = claudeConventions();
    expect(expected.length).toBeGreaterThan(0);
    const documented = table.filter((r) => r.key !== "G").map((r) => `${r.key} ${r.name}`);
    expect(documented, "mirror CLAUDE.md § Conventions in the table").toEqual(expected);
  });

  it("has a row for the git policy", () => {
    expect(table.some((r) => r.key === "G")).toBe(true);
  });

  it("gives every row a known level", () => {
    const bad = table.filter((r) => !["gate", "partial", "care"].includes(r.level)).map((r) => r.key);
    expect(bad).toEqual([]);
  });

  it("names only enforcers that exist", () => {
    const missing: string[] = [];
    const tokens = [...table.flatMap((r) => backticked(r.line)), ...backticked(DOC)];
    for (const token of new Set(tokens)) {
      const run = /^npm run ([\w:.-]+)$/.exec(token);
      if (run) {
        if (!SCRIPTS.includes(run[1])) missing.push(`script ${run[1]}`);
        continue;
      }
      if (/^custom-[\w-]+\/[\w-]+$/.test(token)) {
        if (!ESLINT.includes(`"${token}"`)) missing.push(`lint rule ${token}`);
        continue;
      }
      const p = token.replace(/\/$/, "");
      if (p.includes("/") && !/\s/.test(p) && TOP_LEVEL.has(p.split("/")[0])) {
        if (!existsSync(path.join(REPO_ROOT, p))) missing.push(`path ${p}`);
      }
    }
    expect(missing, "fix the enforcer named in docs/conventions-enforcement.md").toEqual([]);
  });

  it("marks a row gate or partial only when it names an enforcer", () => {
    const empty = table
      .filter((r) => r.level !== "care" && backticked(r.enforcedBy).length === 0)
      .map((r) => r.key);
    expect(empty).toEqual([]);
  });
});
