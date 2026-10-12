import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OUT_OF_SCOPE_ADDS, protectedPathProblems, scopeProblems } from "../../scripts/check-ai-change.mjs";

/**
 * Joins provenance to review: `.github/CODEOWNERS` must route every path the
 * agent gate (scripts/check-ai-change.mjs) guards, every guidance file
 * `.ai/manifest.yaml` declares, and every `import "server-only"` module to an
 * owner. A new server-only module outside an owned directory, a gate rule for a
 * path nobody owns, or a CODEOWNERS line for a path that was moved away fails
 * here, so the routing cannot rot silently the way prose does.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CODEOWNERS = fs.readFileSync(path.join(ROOT, ".github", "CODEOWNERS"), "utf8");
const MANIFEST = fs.readFileSync(path.join(ROOT, ".ai", "manifest.yaml"), "utf8");

type Rule = { pattern: string; owners: string[] };

const rules: Rule[] = CODEOWNERS.split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l !== "" && !l.startsWith("#"))
  .map((l) => {
    const [pattern, ...owners] = l.split(/\s+/);
    return { pattern, owners };
  });

/** The three pattern forms the file header allows. */
function isSupported(pattern: string): boolean {
  return /^\*\.[\w]+$/.test(pattern) || /^\/[^*?[\]\s]+$/.test(pattern);
}

function owns(pattern: string, file: string): boolean {
  if (pattern.startsWith("*.")) return file.endsWith(pattern.slice(1));
  const anchored = pattern.slice(1);
  return pattern.endsWith("/") ? file.startsWith(anchored) : file === anchored;
}

const owned = (file: string) => rules.some((r) => owns(r.pattern, file));

function serverOnlyModules(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) serverOnlyModules(rel, out);
    else if (/\.tsx?$/.test(entry.name)) {
      const head = fs.readFileSync(path.join(ROOT, rel), "utf8").trimStart();
      if (/^import ["']server-only["']/.test(head)) out.push(rel);
    }
  }
  return out;
}

const guidanceFiles = [...MANIFEST.matchAll(/^\s+(?:canonical:|-)\s+(\S+\/(?:CLAUDE|AGENTS)\.md)\s*$/gm)].map((m) => m[1]);

describe(".github/CODEOWNERS", () => {
  it("has rules, each in a supported form with at least one @owner", () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) {
      expect(isSupported(r.pattern), `${r.pattern}: use /dir/, /file or *.ext`).toBe(true);
      expect(r.owners.length, `${r.pattern} has no owner`).toBeGreaterThan(0);
      for (const o of r.owners) expect(o, r.pattern).toMatch(/^@[\w-]+(?:\/[\w-]+)?$/);
    }
  });

  it("names no anchored path that does not exist", () => {
    const missing = rules
      .filter((r) => r.pattern.startsWith("/"))
      .filter((r) => !fs.existsSync(path.join(ROOT, r.pattern.slice(1))))
      .map((r) => r.pattern);
    expect(missing, "a CODEOWNERS rule points at a path that moved or was deleted").toEqual([]);
  });

  it("owns every path check-ai-change.mjs refuses from an agent commit", () => {
    const samples = [".claude/CLAUDE.md", ".claude/settings.json", ".claude/skills/icon-gen/SKILL.md"];
    for (const file of samples) {
      expect(protectedPathProblems([{ status: "M", file }]).length, `${file} is no longer gate-protected`).toBe(1);
      expect(owned(file), `${file} is gate-protected but has no code owner`).toBe(true);
    }
  });

  it("owns every new-surface path the gate treats as out of scope", () => {
    const samples = ["src/app/api/new-route/route.ts", "scripts/new-table.sql", "supabase/migrations/001.sql"];
    for (const file of samples) {
      expect(scopeProblems([{ status: "A", file }]).length, `${file} no longer trips a scope rule`).toBe(1);
      expect(owned(file), `${file} trips a scope rule but has no code owner`).toBe(true);
    }
    expect(OUT_OF_SCOPE_ADDS.every((r) => samples.some((s) => r.pattern.test(s))), "a new scope rule needs a sample above").toBe(
      true,
    );
  });

  it("owns the canonical guidance file and every scoped pointer in .ai/manifest.yaml", () => {
    expect(guidanceFiles).toContain(".claude/CLAUDE.md");
    for (const file of guidanceFiles) expect(owned(file), file).toBe(true);
  });

  it("owns every server-only module (CLAUDE.md convention 6)", () => {
    const modules = serverOnlyModules("src");
    expect(modules).toContain("src/lib/supabase-admin.ts");
    expect(modules.filter((m) => !owned(m)), "move it under an owned directory or add a rule").toEqual([]);
  });

  it("owns the gate itself and its workflow", () => {
    for (const file of ["scripts/check-ai-change.mjs", ".github/workflows/ai-change-gate.yml", ".github/CODEOWNERS"]) {
      expect(owned(file), file).toBe(true);
    }
  });
});
