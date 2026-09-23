import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Reduced-motion reads in the Conversion context (Get Started, download CTA,
 * footer) go through `useStillMotion` (SSR-safe, live), never framer's
 * `useReducedMotion` (samples once on the client, answers null on the server).
 * The two infinite loops in the Get Started visuals are ambient, so they also
 * stop on a backgrounded tab (`usePageVisibility`).
 *
 * Source scan with comments stripped, so a doc comment naming the old hook does
 * not trip it and a commented-out call does not satisfy it.
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

function read(rel: string): string {
  return stripComments(readFileSync(path.join(REPO_ROOT, rel), "utf8"));
}

const GATED_FILES = [
  "src/components/sections/download-cta/DownloadStepGrid.tsx",
  "src/components/sections/footer/FooterLinkColumn.tsx",
  "src/components/sections/get-started/visuals/CreateVisual.tsx",
  "src/components/sections/get-started/visuals/DownloadVisual.tsx",
];

const AMBIENT_LOOPS = [
  "src/components/sections/get-started/visuals/CreateVisual.tsx",
  "src/components/sections/get-started/visuals/DownloadVisual.tsx",
];

describe("conversion reduced-motion reads", () => {
  it.each(GATED_FILES)("%s does not call framer's useReducedMotion", (rel) => {
    expect(read(rel)).not.toMatch(/\buseReducedMotion\b/);
  });

  it.each(GATED_FILES)("%s reads the preference through useStillMotion", (rel) => {
    const src = read(rel);
    expect(src).toMatch(/import\s*\{[^}]*\buseStillMotion\b[^}]*\}\s*from\s*"@\/hooks\/useStillMotion"/);
    expect(src).toMatch(/\buseStillMotion\(\)/);
  });

  it.each(AMBIENT_LOOPS)("%s stops its infinite loop on a hidden tab", (rel) => {
    const src = read(rel);
    expect(src).toMatch(/repeat:\s*Infinity/);
    expect(src).toMatch(/import\s*\{[^}]*\busePageVisibility\b[^}]*\}\s*from\s*"@\/hooks\/usePageVisibility"/);
    expect(src).toMatch(/\busePageVisibility\(\)/);
  });
});
