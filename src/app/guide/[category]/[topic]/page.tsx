import { notFound } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_CONTENT } from "@/data/guide/content";
import { getRelatedTopics } from "@/lib/guide-utils";
import TopicView from "./TopicView";

/* ── Dynamic rendering (102 pages exceed SSG memory budget) ──────────── */

export async function generateMetadata({ params }: { params: Promise<{ category: string; topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = GUIDE_TOPICS.find((t) => t.id === topicId);
  return {
    title: topic?.title ?? "Guide",
    description: topic?.description,
  };
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function TopicPage({ params }: { params: Promise<{ category: string; topic: string }> }) {
  const { category: categoryId, topic: topicId } = await params;

  const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
  const topic = GUIDE_TOPICS.find((t) => t.id === topicId && t.categoryId === categoryId);
  const content = GUIDE_CONTENT[topicId];

  if (!category || !topic || !content) notFound();

  const categoryTopics = GUIDE_TOPICS.filter((t) => t.categoryId === categoryId);
  const currentIndex = categoryTopics.findIndex((t) => t.id === topicId);
  const prevTopic = currentIndex > 0 ? categoryTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < categoryTopics.length - 1 ? categoryTopics[currentIndex + 1] : null;
  const related = getRelatedTopics(topicId);

  return (
    <TopicView
      category={category}
      topic={topic}
      content={content}
      prevTopic={prevTopic}
      nextTopic={nextTopic}
      related={related}
    />
  );
}
