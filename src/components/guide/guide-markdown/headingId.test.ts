import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { extractHeadings } from "./extractHeadings";
import { parseBlocks } from "./parseBlocks";
import { slugifyHeading } from "./parseGuide";

// The TOC (extractHeadings) and the renderer (parseBlocks) must assign identical
// anchor ids, or TOC / copy-link anchors scroll nowhere. This pins them together
// through the shared createHeadingIdAssigner, including the fallback path for
// unslugifiable headings that previously diverged.
function renderedHeadingIds(md: string): string[] {
  const nodes = parseBlocks(md.split("\n")) as ReactElement[];
  return nodes
    .map((n) => (n?.props as { id?: string } | undefined)?.id)
    .filter((id): id is string => typeof id === "string");
}

describe("guide heading ids stay in lockstep between TOC and renderer", () => {
  it("matches for normal, duplicate, and unslugifiable headings", () => {
    const md = [
      "# Getting Started",
      "",
      "Intro paragraph.",
      "",
      "## Setup",
      "",
      "## Setup", // duplicate -> setup-2
      "",
      "## 🚀", // emoji-only -> fallback
      "",
      "```",
      "# not a heading (in fence)",
      "```",
      "",
      "## 🎉", // second emoji-only -> fallback
      "",
      ":::note",
      "## heading inside custom block (skipped)",
      ":::",
      "",
      "## Done",
    ].join("\n");

    const tocIds = extractHeadings(md).map((h) => h.id);
    const domIds = renderedHeadingIds(md);

    expect(domIds).toEqual(tocIds);
    // Sanity: the fallback path actually fired and dedup worked.
    expect(tocIds).toContain("setup");
    expect(tocIds).toContain("setup-2");
    expect(tocIds.filter((id) => id.startsWith("section-")).length).toBe(2);
  });

  it("keeps non-Latin letters so localized headings get deep-linkable ids", () => {
    expect(slugifyHeading("日本語 ガイド")).toBe("日本語-ガイド");
    expect(slugifyHeading("Начало работы")).toBe("начало-работы");
    expect(slugifyHeading("시작하기")).toBe("시작하기");
    expect(slugifyHeading("शुरू करें")).toBe("शुरू-करें");
    expect(slugifyHeading("مرحبا بك")).toBe("مرحبا-بك");
    // Latin ids are unchanged
    expect(slugifyHeading("Café **Setup**")).toBe("cafe-setup");
    expect(slugifyHeading("🚀")).toBe("");
  });
});
