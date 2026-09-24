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

/**
 * The two CSS keyframe loops in this context - WorkVisual's live dot and
 * DownloadCTA's orbit ring - are gated in CSS, not JS, and that is the better
 * gate: the class is constant (DOM and className never depend on the
 * preference), the stylesheet decides, and nothing waits for hydration.
 * These guards keep that true: a bare `animate-pulse`, or an
 * `.animate-spin-slow` animation declared outside the no-preference block,
 * would start ignoring reduced motion again.
 */

/** Bodies of every `@media <query> { ... }` block, matched by brace depth. */
function mediaBlocks(css: string, query: string): string[] {
  const out: string[] = [];
  const head = `@media ${query}`;
  for (let at = css.indexOf(head); at !== -1; at = css.indexOf(head, at + head.length)) {
    const open = css.indexOf("{", at);
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) {
        out.push(css.slice(open + 1, i));
        break;
      }
    }
  }
  return out;
}

describe("conversion CSS loops are gated in the stylesheet", () => {
  const css = readFileSync(path.join(REPO_ROOT, "src/app/globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const safe = mediaBlocks(css, "(prefers-reduced-motion: no-preference)").join("\n");
  const reduce = mediaBlocks(css, "(prefers-reduced-motion: reduce)").join("\n");

  it("WorkVisual's live dot pulses only under motion-safe (Tailwind: prefers-reduced-motion: no-preference)", () => {
    const src = read("src/components/sections/get-started/visuals/WorkVisual.tsx");
    expect(src).toMatch(/\bmotion-safe:animate-pulse\b/);
    expect(src.match(/(?<!motion-safe:)\banimate-pulse\b/g)).toBeNull();
  });

  it("DownloadCTA's orbit ring spins only under no-preference, and never under reduce", () => {
    expect(read("src/components/sections/DownloadCTA.tsx")).toMatch(/className="animate-spin-slow\b/);
    const declares = /\.animate-spin-slow\s*\{\s*animation:\s*spin-slow\b/g;
    expect(css.match(declares)?.length, "one spin-slow declaration in globals.css").toBe(1);
    expect(safe).toMatch(declares);
    expect(reduce).toMatch(/\.animate-spin-slow,[\s\S]*?animation:\s*none\s*!important/);
  });

  it("both stop on a hidden tab: .page-hidden pauses every keyframe animation", () => {
    expect(css).toMatch(/\.page-hidden \*,[\s\S]*?\{\s*animation-play-state:\s*paused\s*!important;?\s*\}/);
  });
});
