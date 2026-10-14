import { describe, it, expect } from "vitest";

import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_NAV_CATEGORIES } from "@/data/guide/topics-nav";

import { countVisibleTopics, isTopicVisible } from "./guide-utils";

// A count a reader or crawler sees must name the same population as the
// sidebar. GUIDE_TOPICS.length includes dev-only topics the sidebar hides.
describe("countVisibleTopics", () => {
  it("equals the number of topics the sidebar projection shows", () => {
    const navTotal = GUIDE_NAV_CATEGORIES.reduce((sum, c) => sum + c.topics.length, 0);
    expect(countVisibleTopics()).toBe(navTotal);
  });

  it("is the visible subset of the table, not its raw length", () => {
    expect(countVisibleTopics()).toBe(GUIDE_TOPICS.filter(isTopicVisible).length);
    expect(countVisibleTopics()).toBeLessThanOrEqual(GUIDE_TOPICS.length);
  });
});
