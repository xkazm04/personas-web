import { notFound } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { getRelatedTopics } from "@/lib/guide-utils";
import TopicView from "./TopicView";

/* ── Load only the single category file needed (≈14 KB vs 136 KB) ──── */

const contentModules: Record<string, () => Promise<{ content: Record<string, string> }>> = {
  "getting-started": () => import("@/data/guide/content/getting-started"),
  "credentials": () => import("@/data/guide/content/credentials"),
  "agents-prompts": () => import("@/data/guide/content/agents-prompts"),
  "triggers": () => import("@/data/guide/content/triggers"),
  "pipelines": () => import("@/data/guide/content/pipelines"),
  "memories": () => import("@/data/guide/content/memories"),
  "monitoring": () => import("@/data/guide/content/monitoring"),
  "testing": () => import("@/data/guide/content/testing"),
  "deployment": () => import("@/data/guide/content/deployment"),
  "troubleshooting": () => import("@/data/guide/content/troubleshooting"),
};

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

  const loader = contentModules[categoryId];
  if (!category || !topic || !loader) notFound();

  const { content: categoryContent } = await loader();
  const content = categoryContent[topicId];
  if (!content) notFound();

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
