import { describe, expect, it } from "vitest";
import { GUIDE_CONTENT } from "@/data/guide/content";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { buildLlmsFull, buildLlmsIndex, flattenGuideBody, visibleGuideTopics } from "./guide-markdown-export";

describe("guide markdown export", () => {
  it("flattens every directive to plain markdown", () => {
    const out = flattenGuideBody(
      [
        ":::steps",
        "1. **Open it** — from the sidebar",
        ":::",
        "",
        ":::tip",
        "Be specific.",
        ":::",
        "",
        ":::compare",
        "**A**",
        "first",
        "---",
        "**B**",
        "second",
        ":::",
      ].join("\n"),
    );
    expect(out).not.toContain(":::");
    expect(out).toContain("1. **Open it**");
    expect(out).toContain("> **Tip:** Be specific.");
    expect(out).toContain("**A**\nfirst");
    expect(out).toContain("**B**\nsecond");
  });

  it("emits no directive syntax anywhere in the corpus", () => {
    const full = buildLlmsFull(GUIDE_CONTENT);
    expect(full).not.toMatch(/^:::/m);
    expect(full.length).toBeGreaterThan(50_000);
  });

  it("indexes exactly the visible topics and omits devOnly ones", () => {
    const visible = visibleGuideTopics();
    const index = buildLlmsIndex();
    for (const { topic } of visible) expect(index).toContain(`/guide/${topic.categoryId}/${topic.id}.md`);
    for (const topic of GUIDE_TOPICS.filter((t) => t.devOnly && !visible.some((v) => v.topic.id === t.id))) {
      expect(index).not.toContain(`/${topic.id}.md`);
    }
    expect((index.match(/^- \[/gm) ?? []).length).toBe(visible.length);
  });
});
