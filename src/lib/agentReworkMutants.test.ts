import { describe, it, expect, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Proves scripts/report-agent-rework.mjs can fail, not only that it passes.
 *
 * agentRework.test.ts and agentReworkBudget.test.ts pin the rework meter on
 * hand-picked inputs. This spec asks whether anything would notice the meter
 * going wrong: it copies the script's source, applies one targeted mutation at
 * a time (a flipped comparison, a dropped filter, a widened window), imports
 * each mutant from a temp directory and runs a suite of known commits against
 * it. A mutant that passes the suite is a rule nobody would miss, and fails
 * this spec by name. Same shape as aiChangeGateMutants.test.ts.
 *
 * The kill ratio is a ratchet at 1 (every mutant killed) and may not go down.
 * A surviving mutant gets a new case in the suite, never a lower ratio. A
 * refactor that removes a mutation's target fails "every mutation still
 * applies"; move the mutation to the new code rather than deleting it.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const METER = path.join(ROOT, "scripts", "report-agent-rework.mjs");
const GATE_IMPORT = `from "./check-ai-change.mjs"`;
const RAW = fs.readFileSync(METER, "utf8");
// Mutants are imported from a temp directory, so the meter's relative import
// of the commit-type gate is pointed back at the real file.
const SOURCE = RAW.replace(GATE_IMPORT, `from ${JSON.stringify(pathToFileURL(path.join(ROOT, "scripts", "check-ai-change.mjs")).href)}`);
const MIN_KILL_RATIO = 1;

type Commit = { sha: string; message: string; files: string[] };
type Row = { lane: string; commits: number; reworked: number; rate: number };
interface Meter {
  parseLog(text: string): Commit[];
  resolvesOf(message: string): string[];
  laneOf(message: string, skills: string[]): string;
  isReworkOf(earlier: { message: string; files: string[] }, later: { message: string; files: string[] }): boolean;
  reworkReport(commits: Commit[], options?: { window?: number; skills?: string[] }): { rows: Row[]; pairs: { sha: string; by: string; lane: string }[] };
  budgetFlags(rows: Row[]): { lane: string; rate: number; reason: string }[];
}

/** One targeted edit: `find` must occur exactly once in the meter's source. */
const MUTANTS: { name: string; find: string; replace: string }[] = [
  { name: "empty lines kept as changed files", find: `.map((f) => f.trim()).filter(Boolean)`, replace: `.map((f) => f.trim())` },
  { name: "Ascent-Resolves trailer no longer read", find: String.raw`/^Ascent-Resolves:\s*(\S+)/gim`, replace: String.raw`/^Ascent-Resolved:\s*(\S+)/gim` },
  { name: "agent commits counted as human", find: `if (!isAgentCommit(message)) return "human";`, replace: `if (isAgentCommit(message)) return "human";` },
  { name: "ascent lane inverted", find: `if (resolvesOf(message).length) return "ascent";`, replace: `if (!resolvesOf(message).length) return "ascent";` },
  { name: "skill lane inverted", find: "if (named.test(message)) return `skill:${skill}`;", replace: "if (!named.test(message)) return `skill:${skill}`;" },
  { name: "noise files count as shared files", find: `earlier.files.filter((f) => !NOISE_FILES.has(f))`, replace: `earlier.files.filter((f) => NOISE_FILES.has(f) || true)` },
  { name: "file overlap inverted", find: `if (!later.files.some((f) => touched.has(f))) return false;`, replace: `if (later.files.some((f) => touched.has(f))) return false;` },
  { name: "reverts no longer read as repairs", find: String.raw`if (/^revert\b/i.test(subject) || /^revert(\([^)]*\))?!?:/i.test(subject)) return true;`, replace: `if (false) return true;` },
  { name: "fix: no longer read as a repair", find: String.raw`/^fix(\([^)]*\))?!?:/i.test(subject)`, replace: `false` },
  { name: "additive fix: read as a repair", find: `commitTypeAdvice(subject).length === 0`, replace: `commitTypeAdvice(subject).length >= 0` },
  { name: "same Ascent item inverted", find: `return resolvesOf(later.message).some((id) => ids.has(id));`, replace: `return resolvesOf(later.message).some((id) => !ids.has(id));` },
  { name: "follow-up window unbounded", find: `commits.slice(i + 1, i + 1 + window)`, replace: `commits.slice(i + 1)` },
  { name: "follow-up window one short", find: `commits.slice(i + 1, i + 1 + window)`, replace: `commits.slice(i + 1, i + window)` },
  { name: "absolute ceiling disabled", find: `if (r.rate > maxRate) {`, replace: `if (r.rate > maxRate + 1) {` },
  { name: "over-human margin disabled", find: `r.rate > baseline + overHuman`, replace: `r.rate > baseline + overHuman + 1` },
  { name: "small human row used as a baseline", find: `human && human.commits >= minCommits ? human.rate : null`, replace: `human ? human.rate : null` },
  { name: "small lanes judged", find: `r.lane === "human" || r.commits < minCommits`, replace: `r.lane === "human"` },
  { name: "human row flagged against itself", find: `if (r.lane === "human" || r.commits < minCommits) continue;`, replace: `if (r.commits < minCommits) continue;` },
];

const CLAUDE = "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";
const lane = (id: string) => `\n\nAscent-Resolves: ${id}`;
const commit = (sha: string, message: string, files: string[]): Commit => ({ sha, message, files });
const row = (name: string, commits: number, reworked: number): Row => ({ lane: name, commits, reworked, rate: reworked / commits });

/** Known commits and rows; returns the names of checks the meter got wrong. */
function rejectionSuite(m: Meter): string[] {
  const wrong: string[] = [];
  const check = (name: string, ok: boolean) => {
    if (!ok) wrong.push(name);
  };
  const parsed = m.parseLog("\x1eaaa\x1ffeat: one\x1f\n\nsrc/a.ts\n");
  check("git log parses to one commit with one file", JSON.stringify(parsed) === JSON.stringify([commit("aaa", "feat: one", ["src/a.ts"])]));
  check("the Ascent-Resolves id is read", JSON.stringify(m.resolvesOf("fix: x" + lane("abc"))) === JSON.stringify(["abc"]));

  check("a commit without trailers is human", m.laneOf("fix: typo", []) === "human");
  check("a Claude commit with no item is agent-other", m.laneOf("feat: x" + CLAUDE, []) === "agent-other");
  check("a lane commit is ascent", m.laneOf("feat: x" + lane("abc"), []) === "ascent");
  check("a named skill is its own lane", m.laneOf("copy: tightened via /perfect" + CLAUDE, ["perfect"]) === "skill:perfect");
  check("a skill name used as a plain word is not", m.laneOf("feat: perfect output" + CLAUDE, ["perfect"]) === "agent-other");

  const added = { message: "feat: Add a" + CLAUDE, files: ["src/a.ts"] };
  check("a fix: on the same file is rework", m.isReworkOf(added, { message: "fix: correct a", files: ["src/a.ts"] }));
  check("a fix: on another file is not", !m.isReworkOf(added, { message: "fix: correct b", files: ["src/b.ts"] }));
  check("a revert on the same file is rework", m.isReworkOf(added, { message: 'Revert "feat: Add a"', files: ["src/a.ts"] }));
  check("an additive fix: is not rework", !m.isReworkOf(added, { message: "fix: Added more to a", files: ["src/a.ts"] }));
  check(
    "sharing only a noise file is not rework",
    !m.isReworkOf({ message: "feat: Add a", files: ["package.json"] }, { message: "fix: correct a", files: ["package.json"] }),
  );
  const item = { message: "feat: Add a" + lane("r1"), files: ["src/a.ts"] };
  check("resolving the same item again is rework", m.isReworkOf(item, { message: "feat: Add b" + lane("r1"), files: ["src/a.ts"] }));
  check("resolving another item is not", !m.isReworkOf(item, { message: "feat: Add b" + lane("r2"), files: ["src/a.ts"] }));

  const a = commit("a", added.message, added.files);
  const other = commit("b", "docs: other", ["docs/x.md"]);
  const fixer = commit("c", "fix: correct a", ["src/a.ts"]);
  check("a fix inside the window counts", m.reworkReport([a, fixer], { window: 1 }).pairs.length === 1);
  check("a fix past the window does not", m.reworkReport([a, other, fixer], { window: 1 }).pairs.length === 0);

  check("a lane over the ceiling is flagged", m.budgetFlags([row("ascent", 10, 5)]).length === 1);
  check("a lane over the human margin is flagged", m.budgetFlags([row("human", 20, 0), row("ascent", 10, 2)]).length === 1);
  check("a small human row is no baseline", m.budgetFlags([row("human", 2, 0), row("ascent", 10, 2)]).length === 0);
  check("a small lane is not judged", m.budgetFlags([row("ascent", 2, 2)]).length === 0);
  check("the human row is never flagged", m.budgetFlags([row("human", 20, 10)]).length === 0);
  return wrong;
}

// Mutants live under node_modules/.cache when it exists (gitignored, and loaded
// by Node's own ESM loader rather than transformed), else in the OS temp dir.
function mutantDir(): string {
  if (!fs.existsSync(path.join(ROOT, "node_modules"))) return fs.mkdtempSync(path.join(os.tmpdir(), "rework-mutants-"));
  const cache = path.join(ROOT, "node_modules", ".cache");
  fs.mkdirSync(cache, { recursive: true });
  return fs.mkdtempSync(path.join(cache, "rework-mutants-"));
}
const TMP = mutantDir();
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

/** Writes `source` to the temp dir and imports it. The hashbang is dropped so any loader accepts it. */
async function load(name: string, source: string): Promise<Meter> {
  const file = path.join(TMP, `${name}.mjs`);
  fs.writeFileSync(file, source.replace(/^#!.*\r?\n/, ""));
  return (await import(/* @vite-ignore */ pathToFileURL(file).href)) as Meter;
}

describe("report-agent-rework mutation ratchet", () => {
  it("the meter still imports the commit-type gate the way the harness rewrites", () => {
    expect(RAW.split(GATE_IMPORT).length - 1).toBe(1);
  });

  it("every mutation still applies to exactly one place in the meter", () => {
    for (const m of MUTANTS) expect(SOURCE.split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated meter passes the suite (the harness is sound)", async () => {
    expect(rejectionSuite(await load("control", SOURCE))).toEqual([]);
  });

  it.each(MUTANTS.map((m, i): [string, number] => [m.name, i]))("kills the mutant: %s", async (_name, i) => {
    const m = MUTANTS[i];
    const meter = await load(`mutant-${i}`, SOURCE.replace(m.find, m.replace));
    expect(rejectionSuite(meter).length, `${m.name} survived the suite`).toBeGreaterThan(0);
  });

  it(`kills at least ${MIN_KILL_RATIO * 100}% of mutants`, async () => {
    let killed = 0;
    for (const [i, m] of MUTANTS.entries()) {
      const meter = await load(`ratio-${i}`, SOURCE.replace(m.find, m.replace));
      if (rejectionSuite(meter).length > 0) killed++;
    }
    expect(killed / MUTANTS.length).toBeGreaterThanOrEqual(MIN_KILL_RATIO);
  });
});
