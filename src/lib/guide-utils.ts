import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import type { GuideTopic, GuideCategory, GuideMode } from "@/data/guide/types";

/** Resolve the effective mode for a topic: topic-level override > category default > "both". */
export function getTopicMode(topic: GuideTopic): GuideMode {
  if (topic.mode) return topic.mode;
  const cat = GUIDE_CATEGORIES.find((c) => c.id === topic.categoryId);
  return cat?.mode ?? "both";
}

/** Whether a topic is visible for a given mode filter. "both" topics are always visible. */
export function isTopicVisibleForMode(topic: GuideTopic, modeFilter: GuideMode | null): boolean {
  if (!modeFilter) return true;
  const topicMode = getTopicMode(topic);
  return topicMode === "both" || topicMode === modeFilter;
}

/** Whether a category has any visible topics for a given mode filter. */
export function isCategoryVisibleForMode(categoryId: string, modeFilter: GuideMode | null): boolean {
  if (!modeFilter) return true;
  return GUIDE_TOPICS.some((t) => t.categoryId === categoryId && isTopicVisibleForMode(t, modeFilter));
}

export interface RelatedTopic {
  topic: GuideTopic;
  category: GuideCategory;
  sharedTags: string[];
  score: number;
}

/**
 * Find topics related to the given topic based on shared tags.
 * Excludes the topic itself and topics from the same category (those are navigated via prev/next).
 * Returns up to `limit` results sorted by relevance (shared tag count).
 */
export function getRelatedTopics(topicId: string, limit = 4): RelatedTopic[] {
  const current = GUIDE_TOPICS.find((t) => t.id === topicId);
  if (!current) return [];

  const currentTags = new Set(current.tags);

  return GUIDE_TOPICS
    .filter((t) => t.id !== topicId && t.categoryId !== current.categoryId)
    .map((t) => {
      const shared = t.tags.filter((tag) => currentTags.has(tag));
      const category = GUIDE_CATEGORIES.find((c) => c.id === t.categoryId)!;
      return { topic: t, category, sharedTags: shared, score: shared.length };
    })
    .filter((r) => r.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
