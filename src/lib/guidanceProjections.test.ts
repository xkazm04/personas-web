import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CANONICAL, PROJECTIONS, conventionTitles, projectGuidance } from "../../scripts/project-guidance.mjs";

/**
 * Holds the per-agent guidance projections to the canonical file.
 *
 * .claude/CLAUDE.md serves Claude Code. Copilot reads
 * .github/copilot-instructions.md and Cursor reads .cursor/rules/*.mdc, and a
 * hand-kept copy for each would drift the first time a rule changed. So
 * scripts/project-guidance.mjs generates them, and this spec fails when a
 * projection differs from what the script would write now. That happens after a
 * hand edit, or after the canonical Project/Commands sections or the convention
 * list change without a re-run. Fix: `node scripts/project-guidance.mjs`.
 * Like guidanceBudget.test.ts for the canonical file, a line budget keeps
 * each projection an entry point that names the rules, not a second rulebook.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
const CANONICAL_TEXT = read(CANONICAL);
const BUDGET = 60;

/** `guidance.projections` entries in .ai/manifest.yaml. */
function manifestProjections(): string[] {
  const lines = read(".ai/manifest.yaml").split("\n");
  const start = lines.indexOf("  projections:");
  if (start === -1) return [];
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const m = /^ {4}- (\S+)$/.exec(line);
    if (!m) break;
    out.push(m[1]);
  }
  return out;
}

describe("agent guidance projections", () => {
  it("projects for Copilot and Cursor, as .ai/manifest.yaml declares", () => {
    const files = PROJECTIONS.map((p) => p.file);
    expect(files).toEqual([".github/copilot-instructions.md", ".cursor/rules/personas-web.mdc"]);
    expect(manifestProjections()).toEqual(files);
  });

  it("indexes every numbered convention of the canonical file", () => {
    const conventions = CANONICAL_TEXT.split(/^## Conventions \(non-negotiable\)$/m)[1]?.split(/^## /m)[0] ?? "";
    const numbered = conventions.split("\n").filter((l) => /^\d+\. \*\*/.test(l));
    expect(numbered.length).toBeGreaterThan(0);
    expect(conventionTitles(CANONICAL_TEXT.split("\n"))).toHaveLength(numbered.length);
  });

  describe.each(PROJECTIONS)("$file", (projection) => {
    const exists = fs.existsSync(path.join(ROOT, projection.file));
    const text = exists ? read(projection.file) : "";

    it("matches what scripts/project-guidance.mjs generates", () => {
      expect(exists, `${projection.file} is missing; run node scripts/project-guidance.mjs`).toBe(true);
      expect(text, "stale projection; run node scripts/project-guidance.mjs").toBe(projectGuidance(CANONICAL_TEXT, projection));
    });

    it("defers to the canonical file by name", () => {
      expect(text).toContain(`\`${CANONICAL}\``);
    });

    it("carries the repository's verify commands", () => {
      for (const command of ["npm run typecheck", "npm run lint", "npm run test:unit"]) expect(text).toContain(command);
    });

    it(`is at most ${BUDGET} lines`, () => {
      expect(text.replace(/\n$/, "").split("\n").length).toBeLessThanOrEqual(BUDGET);
    });
  });
});
