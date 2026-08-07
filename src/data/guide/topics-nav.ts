import { isTopicVisible } from "@/lib/guide-utils";

import { GUIDE_CATEGORIES } from "./categories";
import { GUIDE_TOPICS } from "./topics";
import type { GuideCategory, GuideTopic } from "./types";

/**
 * Navigation projection of the guide data.
 *
 * `GUIDE_TOPICS` is ~57 KB of source, and the bulk of it is the ~250-character
 * `description` of every topic plus per-topic `coverage` metadata. The sidebar
 * tree needs none of that — it renders a title, filters on title + tags, and
 * styles dev-only entries. Shipping the full table to the client on every
 * guide route just to draw that tree is the single largest avoidable payload
 * on this surface.
 *
 * This module is DERIVED (a `.map()` over the real table), never a second
 * hand-maintained list, so it can't drift. It is imported from the **server**
 * `guide/layout.tsx`, which passes the result to the client `GuideSidebar` as
 * props — importing it from a client component would be pointless, since the
 * bundler would then pull `topics.ts` into the client graph anyway and the
 * projection would save nothing.
 */

export type GuideNavTopic = Pick<GuideTopic, "id" | "title" | "tags"> & {
  devOnly?: boolean;
};

export type GuideNavCategory = Pick<GuideCategory, "id" | "name" | "color"> & {
  topics: GuideNavTopic[];
};

function toNavTopic(topic: GuideTopic): GuideNavTopic {
  const nav: GuideNavTopic = { id: topic.id, title: topic.title, tags: topic.tags };
  if (topic.devOnly) nav.devOnly = true;
  return nav;
}

/**
 * Every category with its visible topics, projected down to the navigation
 * fields. `isTopicVisible` reads `NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS`, which is
 * inlined at build time, so filtering here yields exactly the list the client
 * used to compute for itself.
 */
export const GUIDE_NAV_CATEGORIES: GuideNavCategory[] = GUIDE_CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  color: category.color,
  topics: GUIDE_TOPICS.filter(
    (topic) => topic.categoryId === category.id && isTopicVisible(topic),
  ).map(toNavTopic),
}));
