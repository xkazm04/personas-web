import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the directory-scoped CLAUDE.md files. They are pointers to the root
 * rules (`.claude/CLAUDE.md`, `docs/threat-model.md`), not copies, so the
 * checks are the ones a pointer can break: every backticked path still exists,
 * every quoted section heading still exists in the threat model, and the file
 * stays short enough that nobody starts restating the rules in it.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCOPED = ["src/app/api/CLAUDE.md", "src/lib/server/CLAUDE.md"];
const MAX_LINES = 12;

const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const threatModel = read("docs/threat-model.md");
const headings = new Set(threatModel.split(/\r?\n/).filter((l) => l.startsWith("## ")).map((l) => l.trim()));

describe.each(SCOPED)("%s", (file) => {
  const text = read(file);

  it("stays a pointer, not a copy", () => {
    expect(text.trimEnd().split(/\r?\n/).length).toBeLessThanOrEqual(MAX_LINES);
    expect(text).toContain("`docs/threat-model.md`");
  });

  it("names only repo paths that exist", () => {
    const paths = [...text.matchAll(/`([\w.-]+(?:\/[\w.\-[\]]+)+)`/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) expect(fs.existsSync(path.join(ROOT, p)), p).toBe(true);
  });

  it("cites only threat-model sections that exist", () => {
    const cited = [...text.matchAll(/"(## [^"]+)"/g)].map((m) => m[1]);
    expect(cited.length).toBeGreaterThan(0);
    for (const h of cited) expect(headings.has(h), h).toBe(true);
  });
});
