import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The command forms guidanceScripts.test.ts cannot see.
 *
 * That spec matches `npm run <name>` mentions, so a Commands-block line that
 * stops being `npm run` (`npm test`, `npx vitest`, a typo such as `npm rn lint`)
 * slips past it, and so does a `node scripts/<file>.mjs` command whose file was
 * renamed. Agents copy both forms verbatim as their after-change step, so a
 * drift turns that step into a confusing failure. This spec fails `test:unit`
 * on either, and on a package.json script that runs a script file which is gone.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const SCRIPTS = (JSON.parse(read("package.json")) as { scripts: Record<string, string> }).scripts;

const GUIDANCE = [".claude/CLAUDE.md", "docs/AI_HARNESS.md", "SECURITY.md", "README.md"];

/** Lines of the first fenced block under `## Commands` in .claude/CLAUDE.md. */
function commandsBlock(): string[] {
  const section = read(".claude/CLAUDE.md").split(/^## Commands\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const fenced = /```[\w-]*\r?\n([\s\S]*?)```/.exec(section);
  return fenced ? fenced[1].split(/\r?\n/) : [];
}

/** `node <path>` invocations of repo files (scripts/, tools/), not `node <registry>/...`. */
function nodePaths(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\bnode\s+((?:scripts|tools)\/[\w./-]+\.[cm]?[jt]s)\b/g)) out.push(m[1]);
  return out;
}

describe(".claude/CLAUDE.md Commands block", () => {
  const lines = commandsBlock()
    .map((l) => l.replace(/#.*$/, "").trim())
    .filter(Boolean);

  it("is found and lists the after-change trio", () => {
    expect(lines.length).toBeGreaterThan(0);
    const names = lines.map((l) => /^npm run ([\w:.-]+)/.exec(l)?.[1]);
    for (const step of ["typecheck", "lint", "test:unit"]) expect(names).toContain(step);
  });

  it("holds only `npm run <script>` lines naming scripts package.json defines", () => {
    const wrong = lines.filter((l) => {
      const m = /^npm run ([\w:.-]+)(\s|$)/.exec(l);
      return !m || !(m[1] in SCRIPTS);
    });
    expect(wrong, "each line must be `npm run <existing script>`").toEqual([]);
  });
});

describe("`node <file>` commands in guidance", () => {
  it.each(GUIDANCE)("%s cites only script files that exist", (file) => {
    const missing = nodePaths(read(file)).filter((p) => !existsSync(path.join(REPO_ROOT, p)));
    expect(missing, `${file} tells agents to run files that are not in the repo`).toEqual([]);
  });
});

describe("package.json scripts", () => {
  it("run only script files that exist", () => {
    const missing: string[] = [];
    for (const [name, body] of Object.entries(SCRIPTS)) {
      for (const m of body.matchAll(/\bnode\s+([\w./-]+\.[cm]?js)\b/g)) {
        // Registry skills are gitignored links (docs/AI_HARNESS.md "What a fresh clone gets").
        if (m[1].startsWith(".claude/")) continue;
        if (!existsSync(path.join(REPO_ROOT, m[1]))) missing.push(`${name}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
