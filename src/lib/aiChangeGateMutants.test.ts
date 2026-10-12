import { describe, it, expect, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Proves scripts/check-ai-change.mjs can fail, not only that it passes.
 *
 * aiChangeGate.test.ts pins the gate's rules on hand-picked inputs. This spec
 * asks the harder question: if a rule were broken (a flipped comparison, a
 * dropped branch, an emptied allowlist), would anything notice? It copies the
 * gate's source, applies one targeted mutation at a time, imports each mutant
 * from a temp directory and runs a rejection suite of known-bad commits
 * against it. A mutant that passes the suite is a rule nobody would miss, and
 * fails this spec by name.
 *
 * The kill ratio is a ratchet like the lint ceiling: it is 1 (every mutant
 * killed) and may not go down. A refactor that removes a mutation's target
 * fails "every mutation still applies"; move the mutation to the new code
 * rather than deleting it.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GATE = path.join(ROOT, "scripts", "check-ai-change.mjs");
const SOURCE = fs.readFileSync(GATE, "utf8");
const MIN_KILL_RATIO = 1;

type Change = { status: string; file: string };
type Ctx = { topLevel: Set<string>; tracked: (p: string) => boolean; lineCount: (p: string) => number };
interface Gate {
  isAgentCommit(message: string): boolean;
  protectedPathProblems(changes: Change[]): string[];
  scopeProblems(changes: Change[]): string[];
  anchorProblems(mdFile: string, lines: string[], ctx: Ctx): string[];
  addedMarkdownLines(diff: string): Record<string, string[]>;
}

/** One targeted edit: `find` must occur exactly once in the gate's source. */
const MUTANTS: { name: string; find: string; replace: string }[] = [
  { name: "deletions no longer skipped by the protected-path rule", find: `if (status === "D") continue;`, replace: `if (status !== "D") continue;` },
  { name: ".env exemption inverted", find: `base !== ".env.example"`, replace: `base === ".env.example"` },
  { name: ".claude/ branch narrowed to a subfolder", find: `file.startsWith(".claude/")`, replace: `file.startsWith(".claude/never/")` },
  { name: "scope rule reads edits instead of additions", find: `if (status !== "A") continue;`, replace: `if (status === "A") continue;` },
  { name: "new-route pattern emptied", find: String.raw`{ pattern: /^src\/app\/api\/.+\/route\.ts$/,`, replace: `{ pattern: /^$/,` },
  { name: "new-SQL pattern emptied", find: String.raw`{ pattern: /\.sql$/,`, replace: `{ pattern: /^$/,` },
  { name: "Claude trailer no longer recognised", find: String.raw`/^Co-Authored-By:\s*Claude\b/im`, replace: String.raw`/^Co-Authored-By:\s*Nobody\b/im` },
  { name: "Ascent trailer no longer recognised", find: `/^Ascent-Resolves:/im`, replace: `/^Ascent-Resolved:/im` },
  { name: "untracked anchors treated as tracked", find: `if (!tracked(a.path))`, replace: `if (tracked(a.path))` },
  { name: "past-the-end line check disabled", find: `a.line > lineCount(a.path)`, replace: `a.line > lineCount(a.path) + 1e9` },
  { name: "backticked paths never read as anchors", find: `if (!am[1].includes("/") || !topLevel.has(p.split("/")[0])) continue;`, replace: `continue;` },
  { name: "added lines lose their first character", find: `out[file].push(line.slice(1));`, replace: `out[file].push(line.slice(2));` },
];

const CTX: Ctx = {
  topLevel: new Set(["src", "docs"]),
  tracked: (p) => ["src", "src/lib", "src/lib/real.ts", "docs", "docs/a.md"].includes(p),
  lineCount: () => 50,
};

/** Known-bad (and known-good) commits; returns the names of checks the gate got wrong. */
function rejectionSuite(g: Gate): string[] {
  const wrong: string[] = [];
  const check = (name: string, ok: boolean) => {
    if (!ok) wrong.push(name);
  };
  check("Claude trailer is an agent commit", g.isAgentCommit("fix: x\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"));
  check("Ascent trailer is an agent commit", g.isAgentCommit("fix: x\n\nAscent-Resolves: abc"));
  check("a human co-author is not", !g.isAgentCommit("fix: x\n\nCo-Authored-By: Jane <jane@example.com>"));

  check("a committed .env.local is rejected", g.protectedPathProblems([{ status: "A", file: ".env.local" }]).length === 1);
  check(".env.example is allowed", g.protectedPathProblems([{ status: "A", file: ".env.example" }]).length === 0);
  check("a .claude/ write is rejected", g.protectedPathProblems([{ status: "M", file: ".claude/CLAUDE.md" }]).length === 1);
  check("a .claude/ deletion is allowed", g.protectedPathProblems([{ status: "D", file: ".claude/old.md" }]).length === 0);

  check("a new API route is rejected", g.scopeProblems([{ status: "A", file: "src/app/api/admin/route.ts" }]).length === 1);
  check("a new SQL file is rejected", g.scopeProblems([{ status: "A", file: "scripts/table.sql" }]).length === 1);
  check("an edit to a route is allowed", g.scopeProblems([{ status: "M", file: "src/app/api/votes/route.ts" }]).length === 0);

  check("a hallucinated path is rejected", g.anchorProblems("docs/a.md", ["See `src/lib/imaginary.ts`."], CTX).length === 1);
  check("a line past the end is rejected", g.anchorProblems("docs/a.md", ["See `src/lib/real.ts:51`."], CTX).length === 1);
  check("a real anchor passes", g.anchorProblems("docs/a.md", ["See `src/lib/real.ts:7`."], CTX).length === 0);

  const added = g.addedMarkdownLines(["+++ b/docs/a.md", "@@ -0,0 +1 @@", "+See `src/lib/imaginary.ts`."].join("\n"));
  check("added markdown lines are collected verbatim", JSON.stringify(added) === JSON.stringify({ "docs/a.md": ["See `src/lib/imaginary.ts`."] }));
  return wrong;
}

// Mutants live under node_modules/.cache when it exists (gitignored, and loaded
// by Node's own ESM loader rather than transformed), else in the OS temp dir.
function mutantDir(): string {
  if (!fs.existsSync(path.join(ROOT, "node_modules"))) return fs.mkdtempSync(path.join(os.tmpdir(), "ai-gate-mutants-"));
  const cache = path.join(ROOT, "node_modules", ".cache");
  fs.mkdirSync(cache, { recursive: true });
  return fs.mkdtempSync(path.join(cache, "ai-gate-mutants-"));
}
const TMP = mutantDir();
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

/** Writes `source` to the temp dir and imports it. The hashbang is dropped so any loader accepts it. */
async function load(name: string, source: string): Promise<Gate> {
  const file = path.join(TMP, `${name}.mjs`);
  fs.writeFileSync(file, source.replace(/^#!.*\r?\n/, ""));
  return (await import(/* @vite-ignore */ pathToFileURL(file).href)) as Gate;
}

describe("check-ai-change mutation ratchet", () => {
  it("every mutation still applies to exactly one place in the gate", () => {
    for (const m of MUTANTS) expect(SOURCE.split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated gate passes the rejection suite (the harness is sound)", async () => {
    expect(rejectionSuite(await load("control", SOURCE))).toEqual([]);
  });

  it.each(MUTANTS.map((m, i): [string, number] => [m.name, i]))("kills the mutant: %s", async (_name, i) => {
    const m = MUTANTS[i];
    const gate = await load(`mutant-${i}`, SOURCE.replace(m.find, m.replace));
    expect(rejectionSuite(gate).length, `${m.name} survived the rejection suite`).toBeGreaterThan(0);
  });

  it(`kills at least ${MIN_KILL_RATIO * 100}% of mutants`, async () => {
    let killed = 0;
    for (const [i, m] of MUTANTS.entries()) {
      const gate = await load(`ratio-${i}`, SOURCE.replace(m.find, m.replace));
      if (rejectionSuite(gate).length > 0) killed++;
    }
    expect(killed / MUTANTS.length).toBeGreaterThanOrEqual(MIN_KILL_RATIO);
  });
});
