import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guard for the /how reduced-motion remount (e2e/reduced-motion-hydration.spec.ts
 * is the behavioural instrument; this pins the source shape that caused it).
 *
 * Every route streams inside the root `loading.tsx` Suspense boundary, below
 * `QualityProvider` and `PageTransition`. For reduced-motion visitors both used
 * to change the context above that boundary during load - QualityProvider set
 * `reducedMotion` state from an effect, PageTransition flipped the motion.div's
 * `initial`/`animate` (re-published by framer as MotionContext) - and React
 * answers an update to a still-pending dehydrated boundary by discarding the
 * streamed HTML and client-rendering the page, silently.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, "..");

/** Blank out comments so prose about the rule is not mistaken for code. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

const read = (rel: string) => stripComments(readFileSync(path.join(SRC, rel), "utf8"));

const FRAMER_REDUCED_IMPORT =
  /import\s*\{[^}]*\buseReducedMotion\b[^}]*\}\s*from\s*["']framer-motion["']/;

const FILES = {
  pageTransition: "components/PageTransition.tsx",
  quality: "contexts/QualityContext.tsx",
  breather: "components/CinematicBreather.tsx",
  scrollMap: "components/ScrollMap.tsx",
} as const;

describe("reduced motion never re-renders the streaming route boundary", () => {
  it.each(Object.values(FILES))("%s does not import framer's useReducedMotion", (rel) => {
    expect(read(rel)).not.toMatch(FRAMER_REDUCED_IMPORT);
  });

  describe("PageTransition (direct parent of every route's loading boundary)", () => {
    const src = read(FILES.pageTransition);

    it("reads no motion preference in JS", () => {
      expect(src).not.toMatch(/\buse(StillMotion|ReducedMotion)\s*\(/);
    });

    it("keeps initial/animate constant - they are what framer publishes as MotionContext", () => {
      expect(src).toMatch(/\binitial="initial"/);
      expect(src).toMatch(/\banimate="animate"/);
      expect(src).not.toMatch(/\b(initial|animate)=\{[^}]*\?/);
    });

    it("stills the enter transition in CSS, overriding framer's inline styles", () => {
      expect(src).toContain("motion-reduce:opacity-100!");
      expect(src).toContain("motion-reduce:transform-none!");
    });
  });

  describe("QualityProvider (ancestor of every route's loading boundary)", () => {
    const src = read(FILES.quality);

    it("keeps the reduced-motion preference out of provider state", () => {
      expect(src).not.toMatch(/\bsetReducedMotion\b/);
      expect(src).not.toMatch(/\breducedMotion\s*:/);
    });

    it("memoizes the provider value instead of building it inline", () => {
      expect(src).not.toMatch(/Provider\s+value=\{\{/);
      expect(src).toMatch(/useMemo\(\s*\(\)\s*=>\s*\(\{\s*tier\s*\}\)\s*,\s*\[\s*tier\s*\]\s*\)/);
    });

    it("hands consumers useStillMotion directly", () => {
      expect(src).toMatch(
        /export function useReducedMotionPreference\(\)[^{]*\{\s*return useStillMotion\(\);\s*\}/,
      );
    });
  });

  describe("CinematicBreather (server-rendered on /how)", () => {
    const src = read(FILES.breather);

    it("never lets reduced motion decide markup", () => {
      expect(src).not.toMatch(/if\s*\(\s*prefersReducedMotion\s*\)\s*return\s+null/);
      expect(src).not.toMatch(/&&\s*!prefersReducedMotion\s*&&\s*\(/);
    });
  });
});
