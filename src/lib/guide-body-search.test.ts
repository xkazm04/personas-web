import { describe, it, expect } from "vitest";
import {
  stripGuideMarkup,
  buildBodyIndex,
  extractExcerpt,
  searchBodyIndex,
  searchGuide,
} from "@/lib/guide-search";
import { GUIDE_CONTENT } from "@/data/guide/content";

/**
 * Direction: "Search the guide bodies" — the sync ladder only scores
 * title/tag/description, so a phrase that lives only in an article body
 * returned nothing. These tests cover the strip → index → scan → excerpt
 * pipeline plus its rank position relative to the existing ladder.
 */

describe("stripGuideMarkup", () => {
  it("removes directive fences, headings, emphasis, inline code, and links", () => {
    const md = [
      "## The Decision Hub",
      "",
      ":::tip",
      "Some **bold** and `code` and a [link](https://example.com).",
      ":::",
      "",
      "- a list item",
      "1. an ordered item",
    ].join("\n");
    const out = stripGuideMarkup(md);
    expect(out).not.toContain(":::");
    expect(out).not.toContain("##");
    expect(out).not.toContain("**");
    expect(out).not.toContain("`");
    expect(out).not.toContain("](");
    expect(out).toContain("The Decision Hub");
    expect(out).toContain("bold");
    expect(out).toContain("code");
    expect(out).toContain("link");
    expect(out).toContain("a list item");
    expect(out).toContain("an ordered item");
  });

  it("drops fenced code block contents entirely", () => {
    const md = "Intro paragraph.\n\n```ts\nconst secret = 42;\n```\n\nOutro paragraph.";
    const out = stripGuideMarkup(md);
    expect(out).toContain("Intro paragraph.");
    expect(out).toContain("Outro paragraph.");
    expect(out).not.toContain("secret");
  });
});

describe("extractExcerpt", () => {
  it("returns a windowed, ellipsised excerpt around the match on word boundaries", () => {
    const text =
      "The quick brown fox jumps over the lazy dog while the orb glides across the screen to the relevant area.";
    const excerpt = extractExcerpt(text, "orb glides", 20);
    expect(excerpt).toContain("orb glides");
    expect(excerpt.startsWith("…")).toBe(true);
    expect(excerpt.endsWith("…")).toBe(true);
    // Word-boundary snapping: the leading edge starts at a whole word (the
    // char before the first real word is the ellipsis, not a letter).
    expect(excerpt).toMatch(/^…[A-Za-z]/);
  });

  it("returns the whole short text without ellipses when it fits", () => {
    const text = "orb glides across";
    expect(extractExcerpt(text, "orb", 60)).toBe("orb glides across");
  });
});

describe("buildBodyIndex + searchBodyIndex", () => {
  const content = {
    "topic-a": "## Alpha\n\nThe :::steps directive wraps a **guided walkthrough** of the orb overlay.",
    "topic-b": "## Beta\n\nCompletely unrelated prose about spreadsheets and invoices.",
  };

  it("builds one lowercased-haystack entry per non-empty topic", () => {
    const index = buildBodyIndex(content);
    expect(index.map((e) => e.topicId).sort()).toEqual(["topic-a", "topic-b"]);
    const a = index.find((e) => e.topicId === "topic-a")!;
    expect(a.haystack).toBe(a.text.toLowerCase());
    expect(a.haystack).not.toContain(":::");
  });

  it("does not return body results for topic ids not present in GUIDE_TOPICS", () => {
    // topic-a/topic-b are synthetic ids with no GuideTopic — searchBodyIndex
    // must skip them (it resolves the real topic/category or drops the hit).
    const index = buildBodyIndex(content);
    expect(searchBodyIndex(index, "walkthrough")).toEqual([]);
  });
});

describe("searchBodyIndex over real GUIDE_CONTENT", () => {
  const index = buildBodyIndex(GUIDE_CONTENT);

  it("finds a topic by a phrase that appears only in its body, which the sync ladder misses", () => {
    // "corner brackets" is body-only vocabulary from the guided-walkthroughs
    // article — it appears in no title, tag, or description.
    const query = "corner brackets";
    const syncIds = new Set(searchGuide(query).map((r) => r.topic.id));
    const bodyHits = searchBodyIndex(index, query);
    expect(bodyHits.length).toBeGreaterThan(0);
    expect(bodyHits.every((r) => r.matchType === "body")).toBe(true);
    // The feature's whole point: a body hit surfaces a topic the sync ladder
    // did not already return.
    expect(bodyHits.some((r) => !syncIds.has(r.topic.id))).toBe(true);
    expect(bodyHits.some((r) => r.topic.id === "guided-walkthroughs")).toBe(true);
  });

  it("attaches an excerpt containing the query for every body hit", () => {
    const hits = searchBodyIndex(index, "hold-to-talk");
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) {
      expect(hit.excerpt).toBeTruthy();
      expect(hit.excerpt!.toLowerCase()).toContain("hold-to-talk");
    }
  });

  it("respects excludeIds and the result limit", () => {
    const all = searchBodyIndex(index, "athena");
    expect(all.length).toBeGreaterThan(1);
    const excluded = all[0].topic.id;
    const rest = searchBodyIndex(index, "athena", [excluded]);
    expect(rest.some((r) => r.topic.id === excluded)).toBe(false);
    expect(searchBodyIndex(index, "athena", [], 1).length).toBe(1);
  });

  it("ranks body matches strictly below the description tier", () => {
    // Body tier is score 1; the lowest sync tier (description) is 2.
    const hits = searchBodyIndex(index, "athena");
    expect(hits.every((r) => r.score === 1)).toBe(true);
    const descTierScore = 2;
    expect(hits.every((r) => r.score < descTierScore)).toBe(true);
  });
});
