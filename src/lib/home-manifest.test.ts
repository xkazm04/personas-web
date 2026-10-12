import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LANDING_SECTIONS, SCROLL_MAP_SECTIONS } from "./constants";
import { HOME_STAGES, HOME_STAGE_BY_SLUG, HOME_WRAPPER_ALIASES } from "./home-manifest";
import { previewSlug } from "../app/preview/derive";

const root = path.resolve(__dirname, "../..");
const lazySrc = readFileSync(path.join(root, "src/components/sections/lazy.tsx"), "utf8");
const pageSrc = readFileSync(path.join(root, "src/app/page.tsx"), "utf8");

describe("HOME_STAGES", () => {
  it("has unique slugs and anchors", () => {
    expect(HOME_STAGE_BY_SLUG.size).toBe(HOME_STAGES.length);
    expect(new Set(HOME_STAGES.map((s) => s.anchorId)).size).toBe(HOME_STAGES.length);
  });

  // Replaces the dev-only console.warn that used to guard this in page.tsx.
  it("every scroll-map dot has a stage that can receive it (hero is the always-present div)", () => {
    const covered = new Set(["hero", ...HOME_STAGES.map((s) => s.anchorId)]);
    expect(SCROLL_MAP_SECTIONS.filter((s) => !covered.has(s.id)).map((s) => s.id)).toEqual([]);
  });

  it("every stage is a declared landing section", () => {
    const declared = new Set(LANDING_SECTIONS.map((s) => s.id));
    expect(HOME_STAGES.filter((s) => !declared.has(s.anchorId)).map((s) => s.anchorId)).toEqual([]);
  });

  it("every slug is a Lazy export of the home table, and page.tsx mounts each", () => {
    const slugs = new Set(
      [...lazySrc.matchAll(/export const (Lazy\w+)\s*=/g)].map((m) => previewSlug(m[1])),
    );
    for (const { slug } of HOME_STAGES) {
      expect(slugs.has(slug), slug).toBe(true);
      expect(pageSrc, slug).toMatch(new RegExp(`["']?${slug}["']?:\\s*Lazy`));
    }
  });

  it("derives aliases only for wrappers that differ from their anchor", () => {
    expect(HOME_WRAPPER_ALIASES).toMatchObject({ tools: "personas", "download-section": "download", vision: "private" });
    expect(HOME_WRAPPER_ALIASES).not.toHaveProperty("pricing");
  });
});
