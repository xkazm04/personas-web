import { describe, it, expect } from "vitest";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import type { GuideTopicRef } from "@/lib/guide-link";
import { features } from "@/components/sections/features/data";
import { PLATFORM_CARDS } from "@/components/sections/vision-grid/data";

/**
 * Every marketing surface that deep-links into the guide builds a
 * {category, topic} GuideTopicRef by hand (guideHref does zero validation —
 * it is pure string interpolation). A ref that points at a renamed, deleted,
 * or dev-only topic renders a button that 404s: dev-only topics 404 in
 * production because the topic page calls notFound() when isTopicVisible is
 * false. This test is the compile-adjacent guard that keeps those hand-typed
 * refs honest against GUIDE_TOPICS.
 */

// Collect every hand-authored ref with a human-readable source label so a
// failure names exactly which surface to fix.
const HAND_AUTHORED_REFS: { source: string; ref: GuideTopicRef }[] = [
  ...features.flatMap((f) =>
    (f.guideTopics ?? []).map((ref) => ({ source: `features/data.ts (${f.title})`, ref })),
  ),
  ...PLATFORM_CARDS.flatMap((c) =>
    (c.guideTopics ?? []).map((ref) => ({ source: `vision-grid/data.ts (${c.title})`, ref })),
  ),
];

describe("hand-authored guide refs", () => {
  it("has refs to validate (guards against an empty collection silently passing)", () => {
    expect(HAND_AUTHORED_REFS.length).toBeGreaterThan(0);
  });

  it.each(HAND_AUTHORED_REFS)(
    "$source → $ref.category/$ref.topic resolves to a real, production-visible topic",
    ({ source, ref }) => {
      const topic = GUIDE_TOPICS.find((t) => t.id === ref.topic);
      expect(
        topic,
        `${source} links /guide/${ref.category}/${ref.topic} but no topic with id "${ref.topic}" exists in GUIDE_TOPICS. ` +
          `Fix the ref to a real topic id (see src/data/guide/topics.ts).`,
      ).toBeDefined();

      expect(
        topic!.categoryId,
        `${source} links /guide/${ref.category}/${ref.topic} but topic "${ref.topic}" lives in category ` +
          `"${topic!.categoryId}", not "${ref.category}". The URL would 404 — correct the ref's category.`,
      ).toBe(ref.category);

      expect(
        topic!.devOnly ?? false,
        `${source} links /guide/${ref.category}/${ref.topic} but topic "${ref.topic}" is devOnly, so it 404s in ` +
          `production (isTopicVisible → notFound). Point the ref at a production-visible topic.`,
      ).toBe(false);
    },
  );
});
