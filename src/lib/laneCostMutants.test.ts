import { describe, it, expect, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Proves scripts/report-lane-cost.mjs can fail, not only that it passes.
 *
 * laneCost.test.ts pins the cost report on hand-picked histories. This spec
 * asks whether anything would notice the report going wrong: it copies the
 * script's source, applies one targeted mutation at a time (a trailer no longer
 * read, a missing trailer read as free, reworked spend dropped, a widened or
 * disabled hard band), imports each mutant from a temp directory and runs a
 * suite of known histories and rows against it. A mutant that passes the suite
 * is a rule nobody would miss, and fails this spec by name. Same shape as
 * agentReworkMutants.test.ts, and it carries its own suite so laneCost.test.ts
 * stays the readable pin.
 *
 * The kill ratio is a ratchet at 1 (every mutant killed) and may not go down.
 * A surviving mutant gets a new case in the suite, never a lower ratio. A
 * refactor that removes a mutation's target fails "every mutation still
 * applies"; move the mutation to the new code rather than deleting it.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPORT = path.join(ROOT, "scripts", "report-lane-cost.mjs");
const METER_IMPORT = `from "./report-agent-rework.mjs"`;
const RAW = fs.readFileSync(REPORT, "utf8");
// Mutants are imported from a temp directory, so the report's relative import
// of the rework meter is pointed back at the real file.
const SOURCE = RAW.replace(METER_IMPORT, `from ${JSON.stringify(pathToFileURL(path.join(ROOT, "scripts", "report-agent-rework.mjs")).href)}`);
const MIN_KILL_RATIO = 1;

type Commit = { sha: string; message: string; files: string[] };
type CostRow = {
  lane: string;
  commits: number;
  costed: number;
  survivors: number;
  tokens: number;
  seconds: number;
  tokensPerSurvivor: number | null;
  secondsPerSurvivor: number | null;
};
type JudgedRow = { lane: string; costed: number; tokensPerSurvivor: number | null };
interface CostReport {
  costOf(message: string): { tokens: number | null; seconds: number | null };
  costReport(commits: Commit[], options?: { window?: number; skills?: string[] }): CostRow[];
  costFlags(rows: JudgedRow[], review?: { tokensPerSurvivor?: number; minCosted?: number }): { lane: string; reason: string }[];
  hardCostBlocks(rows: JudgedRow[], rangeLanes: string[]): { lane: string; reason: string }[];
}

/** One targeted edit: `find` must occur exactly once in the report's source. */
const MUTANTS: { name: string; find: string; replace: string }[] = [
  { name: "tokens trailer no longer read", find: String.raw`/^Ascent-Tokens:[ \t]*(\d+)[ \t]*$/im`, replace: String.raw`/^Ascent-Token:[ \t]*(\d+)[ \t]*$/im` },
  { name: "tokens trailer read mid-line", find: String.raw`/^Ascent-Tokens:`, replace: String.raw`/Ascent-Tokens:` },
  { name: "wall-clock trailer no longer read", find: String.raw`/^Ascent-Wall-Clock:`, replace: String.raw`/^Ascent-WallClock:` },
  { name: "missing tokens read as free", find: `tokens: tokens ? Number(tokens[1]) : null,`, replace: `tokens: tokens ? Number(tokens[1]) : 0,` },
  { name: "human commits costed", find: `if (lane === "human") continue;`, replace: `` },
  { name: "uncosted commit counted as costed", find: `if (cost.tokens !== null) {`, replace: `if (true) {` },
  { name: "reworked commit counted as a survivor", find: `if (!reworked.has(commit.sha)) row.survivors++;`, replace: `row.survivors++;` },
  { name: "reworked spend dropped", find: `row.tokens += cost.tokens;`, replace: `if (!reworked.has(commit.sha)) row.tokens += cost.tokens;` },
  { name: "spend divided by costed, not survivors", find: `tokensPerSurvivor: r.survivors ? r.tokens / r.survivors : null,`, replace: `tokensPerSurvivor: r.costed ? r.tokens / r.costed : null,` },
  { name: "no survivor read as free", find: `tokensPerSurvivor: r.survivors ? r.tokens / r.survivors : null,`, replace: `tokensPerSurvivor: r.survivors ? r.tokens / r.survivors : 0,` },
  { name: "small lanes judged", find: `if (r.costed < minCosted) continue;`, replace: `` },
  { name: "line itself counted as over", find: `r.tokensPerSurvivor > tokensPerSurvivor`, replace: `r.tokensPerSurvivor >= tokensPerSurvivor` },
  { name: "nothing survived not flagged", find: "out.push({ lane: r.lane, reason: `none of ${r.costed} costed commits survived` });", replace: `` },
  { name: "hard band blocks a lane the PR does not add to", find: `.filter((f) => present.has(f.lane))`, replace: `` },
  { name: "hard band falls back to the review line", find: `{ ...HARD_COST_BUDGET, ...budget }`, replace: `{ ...COST_REVIEW, ...budget }` },
  { name: "hard band ceiling widened", find: `tokensPerSurvivor: 4_000_000`, replace: `tokensPerSurvivor: 40_000_000` },
  { name: "hard band judges small lanes", find: `minCosted: 20 })`, replace: `minCosted: 10 })` },
];

const CLAUDE = "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";
const lane = (id: string) => `\n\nAscent-Resolves: ${id}`;
const spend = (tokens: number, seconds?: number) =>
  `\nAscent-Tokens: ${tokens}` + (seconds === undefined ? "" : `\nAscent-Wall-Clock: ${seconds}`);
const commit = (sha: string, message: string, files: string[]): Commit => ({ sha, message, files });
const judged = (name: string, costed: number, tokensPerSurvivor: number | null): JudgedRow => ({ lane: name, costed, tokensPerSurvivor });

/** Known histories and rows; returns the names of checks the report got wrong. */
function rejectionSuite(m: CostReport): string[] {
  const wrong: string[] = [];
  const check = (name: string, ok: boolean) => {
    if (!ok) wrong.push(name);
  };

  check("both trailers are read", JSON.stringify(m.costOf("fix: Added x" + lane("a") + spend(412000, 540))) === JSON.stringify({ tokens: 412000, seconds: 540 }));
  check("a missing trailer is null, not 0", m.costOf("fix: Added x" + lane("a")).tokens === null);
  check("a trailer quoted mid-line is not read", m.costOf("docs: x\n\nquoted Ascent-Tokens: 5").tokens === null);

  // c1 is reworked by c2 (same item, same file); together they bought one surviving change.
  const reworkedPair = [
    commit("c1", "feat: Add x" + lane("a") + spend(1000, 60), ["src/x.ts"]),
    commit("c2", "feat: Add x again" + lane("a") + spend(3000, 120), ["src/x.ts"]),
  ];
  const [ascent] = m.costReport(reworkedPair);
  check("reworked spend is charged to the survivor", ascent?.tokens === 4000 && ascent.tokensPerSurvivor === 4000);
  check("a reworked commit is not a survivor", ascent?.survivors === 1 && ascent.costed === 2);
  check("a lane without trailers is unmeasured", m.costReport([commit("u1", "feat: Add y" + lane("b"), ["src/y.ts"])])[0]?.costed === 0);
  check(
    "a lane where nothing costed survived has no per-survivor cost",
    m.costReport([commit("c1", "feat: Add x" + lane("a") + spend(1000), ["src/x.ts"]), commit("c2", "feat: Add x again" + lane("a"), ["src/x.ts"])])[0]
      ?.tokensPerSurvivor === null,
  );
  check(
    "human commits carry no cost row",
    m.costReport([commit("h1", "feat: Add z" + spend(10), ["src/z.ts"]), commit("a1", "chore: tidy" + spend(5) + CLAUDE, ["src/w.ts"])]).every((r) => r.lane !== "human"),
  );

  check("a small lane is not reviewed", m.costFlags([judged("ascent", 1, 1e9)]).length === 0);
  check("a lane exactly at the line is not reviewed", m.costFlags([judged("ascent", 10, 2_000_000)]).length === 0);
  check("a lane over the line is reviewed", m.costFlags([judged("ascent", 10, 2_000_001)]).length === 1);
  check("a lane where nothing survived is reviewed", m.costFlags([judged("ascent", 10, null)]).length === 1);

  check("the hard band blocks a lane over it that the PR adds to", m.hardCostBlocks([judged("ascent", 20, 5_000_000)], ["ascent"]).length === 1);
  check("the hard band leaves a lane the PR does not add to", m.hardCostBlocks([judged("ascent", 20, 5_000_000)], ["human"]).length === 0);
  check("the hard band leaves a lane between the two lines", m.hardCostBlocks([judged("ascent", 20, 3_000_000)], ["ascent"]).length === 0);
  check("the hard band judges no lane on fewer than 20 costed commits", m.hardCostBlocks([judged("ascent", 10, 1e9)], ["ascent"]).length === 0);
  return wrong;
}

// Mutants live under node_modules/.cache when it exists (gitignored, and loaded
// by Node's own ESM loader rather than transformed), else in the OS temp dir.
function mutantDir(): string {
  if (!fs.existsSync(path.join(ROOT, "node_modules"))) return fs.mkdtempSync(path.join(os.tmpdir(), "lane-cost-mutants-"));
  const cache = path.join(ROOT, "node_modules", ".cache");
  fs.mkdirSync(cache, { recursive: true });
  return fs.mkdtempSync(path.join(cache, "lane-cost-mutants-"));
}
const TMP = mutantDir();
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

/** Writes `source` to the temp dir and imports it. The hashbang is dropped so any loader accepts it. */
async function load(name: string, source: string): Promise<CostReport> {
  const file = path.join(TMP, `${name}.mjs`);
  fs.writeFileSync(file, source.replace(/^#!.*\r?\n/, ""));
  return (await import(/* @vite-ignore */ pathToFileURL(file).href)) as CostReport;
}

describe("report-lane-cost mutation ratchet", () => {
  it("the report still imports the rework meter the way the harness rewrites", () => {
    expect(RAW.split(METER_IMPORT).length - 1).toBe(1);
  });

  it("every mutation still applies to exactly one place in the report", () => {
    for (const m of MUTANTS) expect(SOURCE.split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated report passes the suite (the harness is sound)", async () => {
    expect(rejectionSuite(await load("control", SOURCE))).toEqual([]);
  });

  it.each(MUTANTS.map((m, i): [string, number] => [m.name, i]))("kills the mutant: %s", async (_name, i) => {
    const m = MUTANTS[i];
    const report = await load(`mutant-${i}`, SOURCE.replace(m.find, m.replace));
    expect(rejectionSuite(report).length, `${m.name} survived the suite`).toBeGreaterThan(0);
  });

  it(`kills at least ${MIN_KILL_RATIO * 100}% of mutants`, async () => {
    let killed = 0;
    for (const [i, m] of MUTANTS.entries()) {
      const report = await load(`ratio-${i}`, SOURCE.replace(m.find, m.replace));
      if (rejectionSuite(report).length > 0) killed++;
    }
    expect(killed / MUTANTS.length).toBeGreaterThanOrEqual(MIN_KILL_RATIO);
  });
});
