import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Adoption guard: the Agent Lab & Plugin Ecosystem context reads reduced motion
 * through `useStillMotion` (src/hooks/useStillMotion.ts), never framer's
 * `useReducedMotion` - which samples the media query once on the client,
 * answers null on the server, and never updates when the OS setting changes.
 *
 * The file list is the context's own `filePaths` in context-map.json, so a file
 * the context gains later is covered without editing this spec.
 */
const CONTEXT = "Agent Lab & Plugin Ecosystem";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..", "..", "..");

// `import { ..., useReducedMotion, ... } from "framer-motion"` (any spacing/newlines).
const FRAMER_REDUCED_IMPORT =
  /import\s*\{[^}]*\buseReducedMotion\b[^}]*\}\s*from\s*["']framer-motion["']/;

/** Blank out comments so prose about the rule is not mistaken for an import. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

interface Ctx {
  name?: string;
  filePaths?: string[];
}

function findContext(node: unknown): Ctx | undefined {
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findContext(item);
      if (hit) return hit;
    }
  } else if (node && typeof node === "object") {
    const ctx = node as Ctx;
    if (ctx.name === CONTEXT && Array.isArray(ctx.filePaths)) return ctx;
    for (const value of Object.values(node)) {
      const hit = findContext(value);
      if (hit) return hit;
    }
  }
  return undefined;
}

const contextMap = JSON.parse(readFileSync(path.join(REPO_ROOT, "context-map.json"), "utf8"));
const sources = (findContext(contextMap)?.filePaths ?? []).filter(
  (p) => /\.(ts|tsx)$/.test(p) && !p.endsWith(".test.ts") && existsSync(path.join(REPO_ROOT, p)),
);

describe(`${CONTEXT}: reduced motion goes through useStillMotion`, () => {
  it("the context resolves to its source files", () => {
    expect(sources.length).toBeGreaterThan(10);
  });

  it("no file imports framer-motion's useReducedMotion", () => {
    const offenders = sources.filter((p) =>
      FRAMER_REDUCED_IMPORT.test(stripComments(readFileSync(path.join(REPO_ROOT, p), "utf8"))),
    );
    expect(offenders).toEqual([]);
  });

  it("the comment stripper does not hide a real import", () => {
    const real = 'import { motion, useReducedMotion } from "framer-motion";';
    const commented = '// import { useReducedMotion } from "framer-motion";';
    expect(FRAMER_REDUCED_IMPORT.test(stripComments(real))).toBe(true);
    expect(FRAMER_REDUCED_IMPORT.test(stripComments(commented))).toBe(false);
  });
});
