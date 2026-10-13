import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keeps agent guidance and package.json scripts from drifting apart.
 *
 * Agents learn the repo's commands from prose (.claude/CLAUDE.md,
 * docs/AI_HARNESS.md, README.md), from CI and from the pre-push hook. Before
 * this spec, a renamed script left those pointing at nothing, and a new
 * `check:*` gate could land without any guidance naming it, so an agent met it
 * only when the hook failed. This spec fails `test:unit` in either case. It
 * also holds the "Runs in" column of the AI_HARNESS.md Gates table to what CI
 * and the hook actually run.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const SCRIPTS = Object.keys(
  (JSON.parse(read("package.json")) as { scripts: Record<string, string> }).scripts,
);

const GUIDANCE = [".claude/CLAUDE.md", "docs/AI_HARNESS.md", "SECURITY.md", "README.md"];
const CI = ".github/workflows/ci.yml";
const HOOK = "scripts/install-git-hooks.mjs";

/** `npm run <name>` mentions, skipping globs such as `npm run check:*`. */
function npmRunNames(text: string): string[] {
  const names: string[] = [];
  for (const m of text.matchAll(/npm run ([\w:.-]+)(\*?)/g)) {
    if (m[2] === "*") continue;
    names.push(m[1].replace(/[.:-]+$/, ""));
  }
  return names;
}

/** Scripts CI really runs: `- run: npm run <name>` steps, not comments. */
function ciRuns(): Set<string> {
  const out = new Set<string>();
  for (const m of read(CI).matchAll(/^\s*-\s*run:\s*npm run ([\w:.-]+)/gm)) out.add(m[1]);
  return out;
}

/** Scripts the pre-push hook runs (comments stripped). */
function hookRuns(): Set<string> {
  const source = read(HOOK)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  return new Set(npmRunNames(source));
}

interface GateRow {
  name: string;
  runsIn: string;
}

function gateRows(): GateRow[] {
  const section = read("docs/AI_HARNESS.md").split(/^## Gates\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const rows: GateRow[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|([^|]*)\|/.exec(line);
    if (m) rows.push({ name: m[1], runsIn: m[2] });
  }
  return rows;
}

const isGate = (name: string) => name.startsWith("check:") || name === "copy:check";

describe("guidance ↔ package.json scripts", () => {
  it.each([...GUIDANCE, CI, HOOK])("%s names only scripts that exist", (file) => {
    const unknown = npmRunNames(read(file)).filter((n) => !SCRIPTS.includes(n));
    expect(unknown, `${file} names scripts package.json does not define`).toEqual([]);
  });

  const rows = gateRows();
  const documented = rows.map((r) => r.name);

  it("lists every gate in the docs/AI_HARNESS.md Gates table", () => {
    expect(rows.length).toBeGreaterThan(0);
    const missing = SCRIPTS.filter(isGate).filter((n) => !documented.includes(n));
    expect(missing, "add a row to docs/AI_HARNESS.md § Gates for each").toEqual([]);
  });

  it("has no Gates row for a script that does not exist", () => {
    expect(documented.filter((n) => !SCRIPTS.includes(n))).toEqual([]);
  });

  it("says truthfully which gates CI and the pre-push hook run", () => {
    const ci = ciRuns();
    const hook = hookRuns();
    const wrong: string[] = [];
    for (const { name, runsIn } of rows) {
      const saysCi = /\bCI\b/.test(runsIn);
      const saysHook = /pre-push/.test(runsIn);
      if (saysCi !== ci.has(name)) wrong.push(`${name}: CI ${ci.has(name) ? "runs" : "does not run"} it`);
      if (saysHook !== hook.has(name)) {
        wrong.push(`${name}: the pre-push hook ${hook.has(name) ? "runs" : "does not run"} it`);
      }
    }
    expect(wrong).toEqual([]);
  });
});
