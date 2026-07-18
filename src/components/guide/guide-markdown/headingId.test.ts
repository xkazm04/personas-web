import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { extractHeadings } from "./extractHeadings";
import { parseBlocks } from "./parseBlocks";

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
      "## 日本語", // CJK, slugifies empty -> fallback
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
});
