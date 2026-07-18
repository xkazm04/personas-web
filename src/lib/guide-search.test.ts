import { describe, it, expect } from "vitest";
import { searchGuide } from "./guide-search";

describe("guide search fuzzy budget scales with token length", () => {
  it("a 2-char query never produces fuzzy matches (budget 0)", () => {
    // "ax" is not a substring of common titles/tags, so with a flat distance of
    // 2 it used to fuzzy-match a flood of short words. Budget 0 for <4 chars
    // means only exact-substring tiers can fire.
    const results = searchGuide("ax");
    expect(results.every((r) => r.matchType !== "fuzzy-title" && r.matchType !== "fuzzy-tag")).toBe(true);
  });

  it("a longer typo of a real title word still matches at the fuzzy tier", () => {
    // "instaling" (one deletion from "installing", 9 chars → budget 2) should
    // still find "Installing Personas".
    const results = searchGuide("instaling");
    expect(results.some((r) => /install/i.test(r.topic.title))).toBe(true);
  });
});
