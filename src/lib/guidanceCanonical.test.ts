import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins `guidance:` in .ai/manifest.yaml: which file holds the agent rules and
 * which files only point at it.
 *
 * Without the declaration, "the root CLAUDE.md wins" is a convention nobody can
 * check. With it, this spec fails when the canonical file disappears, when a
 * new CLAUDE.md / AGENTS.md lands under src/ without being declared (an
 * undeclared second rulebook), and when a declared pointer stops deferring to
 * the canonical file or starts stating rules itself. scopedGuidance.test.ts
 * keeps the pointers' anchors honest; this spec keeps their role honest.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = fs.readFileSync(path.join(ROOT, ".ai", "manifest.yaml"), "utf8");
const GUIDANCE_NAMES = new Set(["CLAUDE.md", "AGENTS.md"]);

/** The `guidance:` block, read line by line (the manifest is plain YAML; no parser dependency). */
function guidanceBlock(): { canonical: string[]; pointers: string[] } {
  const lines = MANIFEST.split(/\r?\n/);
  const start = lines.findIndex((l) => /^guidance:\s*$/.test(l));
  const canonical: string[] = [];
  const pointers: string[] = [];
  if (start === -1) return { canonical, pointers };
  let inPointers = false;
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const c = /^\s+canonical:\s*(\S+)\s*$/.exec(line);
    if (c) {
      canonical.push(c[1]);
      inPointers = false;
      continue;
    }
    if (/^\s+pointers:\s*$/.test(line)) {
      inPointers = true;
      continue;
    }
    const p = /^\s+-\s+(\S+)\s*$/.exec(line);
    if (inPointers && p) pointers.push(p[1]);
  }
  return { canonical, pointers };
}

function guidanceFilesUnder(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) guidanceFilesUnder(rel, out);
    else if (GUIDANCE_NAMES.has(entry.name)) out.push(rel);
  }
  return out;
}

const { canonical, pointers } = guidanceBlock();

describe(".ai/manifest.yaml guidance", () => {
  it("names exactly one canonical guidance file, and it exists", () => {
    expect(canonical).toEqual([".claude/CLAUDE.md"]);
    expect(fs.existsSync(path.join(ROOT, canonical[0]))).toBe(true);
  });

  it("declares every scoped guidance file under src/, and only files that exist", () => {
    expect(pointers.length).toBeGreaterThan(0);
    expect([...pointers].sort()).toEqual(guidanceFilesUnder("src").sort());
  });

  describe.each(pointers)("%s", (pointer) => {
    const text = fs.existsSync(path.join(ROOT, pointer)) ? fs.readFileSync(path.join(ROOT, pointer), "utf8") : "";

    it("defers to the canonical file by name", () => {
      expect(text).toContain(`\`${canonical[0]}\``);
    });

    it("states no rules of its own", () => {
      const rules = text
        .split(/\r?\n/)
        .filter((l) => /^\s*\d+[.)]\s/.test(l) || /^\s*(?:[-*]\s+)?(?:\*\*)?(?:Never|Always|Must|Do not|Don't)\b/i.test(l));
      expect(rules, "move these rules to the canonical file and point at them instead").toEqual([]);
    });
  });
});
