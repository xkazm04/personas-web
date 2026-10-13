import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keeps docs/README.md the one entry point into the docs.
 *
 * Before that page existed, a reader had to find AI_HARNESS.md, threat-model.md,
 * degraded-dependencies.md and the scoped CLAUDE.md pointers on their own, and
 * the order they met them in decided what they believed. This spec fails when a
 * top-level doc, a docs/ folder or a CLAUDE.md is not linked from the index,
 * when a link there points at nothing, or when the reading order stops opening
 * with the repo law and then the harness doc.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOCS = path.join(ROOT, "docs");
const INDEX = path.join(DOCS, "README.md");
const toRepo = (abs: string) => path.relative(ROOT, abs).split(path.sep).join("/");

/** Repo-relative targets of the index's markdown links, in reading order. */
function indexLinks(): string[] {
  const text = readFileSync(INDEX, "utf8");
  const out: string[] = [];
  for (const m of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    if (/^[a-z]+:/i.test(m[1])) continue;
    out.push(toRepo(path.resolve(DOCS, m[1])));
  }
  return out;
}

/** Every CLAUDE.md under a directory, skipping dependency folders. */
function claudeFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...claudeFiles(abs));
    else if (entry.name === "CLAUDE.md") found.push(toRepo(abs));
  }
  return found;
}

const links = indexLinks();

describe("docs/README.md is the entry point into the docs", () => {
  it("links only to files that exist", () => {
    expect(links.length).toBeGreaterThan(0);
    expect(links.filter((l) => !existsSync(path.join(ROOT, l)))).toEqual([]);
  });

  it("opens the reading order with the repo law, then the harness doc", () => {
    expect(links.slice(0, 2)).toEqual([".claude/CLAUDE.md", "docs/AI_HARNESS.md"]);
  });

  it("links every top-level doc", () => {
    const docs = readdirSync(DOCS, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".md") && e.name !== "README.md")
      .map((e) => `docs/${e.name}`);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.filter((d) => !links.includes(d)), "add a line to docs/README.md").toEqual([]);
  });

  it("links into every docs/ folder", () => {
    const folders = readdirSync(DOCS, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `docs/${e.name}/`);
    const unlinked = folders.filter((f) => !links.some((l) => l.startsWith(f)));
    expect(unlinked, "link the folder's README or index from docs/README.md").toEqual([]);
  });

  it("links the canonical CLAUDE.md and every scoped pointer", () => {
    const pointers = [
      ".claude/CLAUDE.md",
      ...claudeFiles(path.join(ROOT, "src")),
      ...claudeFiles(path.join(ROOT, "scripts")),
    ];
    expect(pointers.length).toBeGreaterThan(1);
    expect(pointers.filter((p) => !links.includes(p))).toEqual([]);
  });
});
