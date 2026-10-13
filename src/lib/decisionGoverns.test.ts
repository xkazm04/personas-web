import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Makes a decision record findable from the code it governs.
 *
 * A record in docs/decisions/ may carry a `**Governs:**` line under its title
 * listing the repo paths the decision constrains (docs/decisions/README.md).
 * This spec fails `test:unit` when a governed path no longer exists (the
 * record would point at nothing), and when a governed path sits under a folder
 * with a scoped CLAUDE.md pointer that does not cite the record: that pointer
 * is what Claude Code loads when an agent edits the folder, so it is the link
 * back from the code to the decision. It also keeps the scoped pointers that
 * scopedGuidance.test.ts does not list honest: short, and naming only paths
 * that exist.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DECISIONS = "docs/decisions";
const MAX_POINTER_LINES = 12;
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const records = fs
  .readdirSync(path.join(ROOT, DECISIONS))
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .map((file) => {
    const line = /^\*\*Governs:\*\* (.+)$/m.exec(read(`${DECISIONS}/${file}`));
    const governs = line ? Array.from(line[1].matchAll(/`([^`]+)`/g), (m) => m[1]) : [];
    return { file, governs };
  })
  .filter((r) => r.governs.length > 0);

/** Every scoped pointer: the ones `.ai/manifest.yaml` declares under src/, plus the scripts pointer. */
const pointers = [
  ...Array.from(read(".ai/manifest.yaml").matchAll(/^\s+-\s+(\S+\/CLAUDE\.md)\s*$/gm), (m) => m[1]),
  "scripts/CLAUDE.md",
];

describe("decision records name the paths they govern", () => {
  it("finds the governed records (the scan is reading the right line)", () => {
    expect(records.map((r) => r.file)).toEqual(
      expect.arrayContaining([
        "2026-10-07-accepted-risk-execution-text-synced-raw.md",
        "2026-10-09-accepted-risk-unsafe-inline-script-src.md",
        "2026-10-07-proxy-key-session-gated.md",
      ]),
    );
  });

  it.each(records.map((r): [string, string[]] => [r.file, r.governs]))("%s governs only paths that exist", (_file, governs) => {
    const missing = governs.filter((p) => !fs.existsSync(path.join(ROOT, p)));
    expect(missing).toEqual([]);
  });

  it("is cited by the scoped pointer of every folder it governs", () => {
    const uncited: string[] = [];
    for (const { file, governs } of records) {
      for (const pointer of pointers) {
        const dir = pointer.slice(0, -"CLAUDE.md".length);
        if (!governs.some((p) => p.startsWith(dir))) continue;
        if (!read(pointer).includes(`${DECISIONS}/${file}`)) uncited.push(`${pointer} -> ${file}`);
      }
    }
    expect(uncited, "add the record to the folder's CLAUDE.md pointer").toEqual([]);
  });
});

describe.each(pointers)("pointer %s", (pointer) => {
  const text = read(pointer);

  it("stays a pointer, not a copy", () => {
    expect(text.trimEnd().split(/\r?\n/).length).toBeLessThanOrEqual(MAX_POINTER_LINES);
  });

  it("names only repo paths that exist", () => {
    const paths = Array.from(text.matchAll(/`([\w.-]+(?:\/[\w.\-[\]]+)+\/?)`/g), (m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.filter((p) => !fs.existsSync(path.join(ROOT, p)))).toEqual([]);
  });
});
