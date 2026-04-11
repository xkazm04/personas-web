import { notFound } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { getRelatedTopics } from "@/lib/guide-utils";
import { SITE_URL } from "@/lib/seo";
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
  const { category: categoryId, topic: topicId } = await params;
  const topic = GUIDE_TOPICS.find((t) => t.id === topicId);
  const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
  const categoryLabel = category?.name ?? "Guide";
  return {
    title: topic ? `${topic.title} | ${categoryLabel}` : "Guide",
    description: topic?.description,
    alternates: {
      canonical: topic ? `${SITE_URL}/guide/${categoryId}/${topicId}` : undefined,
    },
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title,
    description: topic.description,
    author: { "@type": "Organization", name: "Personas" },
    publisher: { "@type": "Organization", name: "Personas", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/guide/${categoryId}/${topicId}`,
    keywords: topic.tags.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guide", item: `${SITE_URL}/guide` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/guide/${categoryId}` },
      { "@type": "ListItem", position: 3, name: topic.title, item: `${SITE_URL}/guide/${categoryId}/${topicId}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TopicView
        category={category}
        topic={topic}
        content={content}
        prevTopic={prevTopic}
        nextTopic={nextTopic}
        related={related}
      />
    </>
  );
}
