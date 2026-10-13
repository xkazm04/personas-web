import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins scripts/CLAUDE.md, the pointer an agent gets when it edits a gate or
 * check script. Like the src/ pointers held by scopedGuidance.test.ts, it
 * stays a pointer: every backticked path still exists, every quoted heading
 * still exists in docs/AI_HARNESS.md, it defers to the canonical guidance file,
 * and it stays short enough that nobody starts restating rules in it.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const POINTER = read("scripts/CLAUDE.md");
const HARNESS_HEADINGS = new Set(
  read("docs/AI_HARNESS.md")
    .split(/\r?\n/)
    .filter((l) => l.startsWith("## "))
    .map((l) => l.trim()),
);

describe("scripts/CLAUDE.md", () => {
  it("stays a pointer that defers to the canonical guidance", () => {
    expect(POINTER.trimEnd().split(/\r?\n/).length).toBeLessThanOrEqual(12);
    expect(POINTER).toContain("`.claude/CLAUDE.md`");
    expect(POINTER).toContain("`docs/AI_HARNESS.md`");
  });

  it("names only repo paths that exist", () => {
    const paths = [...POINTER.matchAll(/`([\w.-]+(?:\/[\w.\-[\]]+)+)`/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) expect(fs.existsSync(path.join(ROOT, p)), p).toBe(true);
  });

  it("cites only AI_HARNESS sections that exist", () => {
    const cited = [...POINTER.matchAll(/"(## [^"]+)"/g)].map((m) => m[1]);
    expect(cited.length).toBeGreaterThan(0);
    for (const h of cited) expect(HARNESS_HEADINGS.has(h), h).toBe(true);
  });
});
