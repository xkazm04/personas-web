import { notFound } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { extractHeadings } from "@/components/guide/guide-markdown/extractHeadings";
import { getRelatedTopics } from "@/lib/guide-utils";
import { SITE_URL, SITE_NAME, safeJsonLd } from "@/lib/seo";
import TopicView from "./TopicView";

/* ── Helpers for structured data ────────────────────────────────────── */

/** Extract steps from :::steps blocks for HowTo JSON-LD. */
function extractSteps(content: string): { title: string; body: string }[] {
  const stepsBlocks = content.match(/:::steps\n([\s\S]*?):::/g);
  if (!stepsBlocks) return [];
  const steps: { title: string; body: string }[] = [];
  for (const block of stepsBlocks) {
    const inner = block.replace(/^:::steps\n/, "").replace(/\n:::$/, "");
    for (const line of inner.split("\n")) {
      const m = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(?:[—–-]\s*)?(.*)$/);
      if (m) steps.push({ title: m[1], body: m[2] });
    }
  }
  return steps;
}

/** Build HowTo JSON-LD if the topic contains steps. */
function buildHowToJsonLd(
  topic: { title: string; description: string },
  categoryId: string,
  topicId: string,
  steps: { title: string; body: string }[],
) {
  if (steps.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: topic.title,
    description: topic.description,
    url: `${SITE_URL}/guide/${categoryId}/${topicId}`,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body || s.title,
    })),
  };
}

/* ── Load only the single category file needed (≈14 KB vs 136 KB) ──── */

// Derived from GUIDE_CATEGORIES so a new category cannot be added without
// also wiring its content module — the template-literal dynamic import is
// statically analyzable by Turbopack, which emits one chunk per file in
// src/data/guide/content/. The CI guard in scripts/check-guide-content.mjs
// asserts every category here has a matching content/<id>.ts module.
const contentModules: Record<string, () => Promise<{ content: Record<string, string> }>> =
  Object.fromEntries(
    GUIDE_CATEGORIES.map((c) => [
      c.id,
      () => import(`@/data/guide/content/${c.id}`) as Promise<{ content: Record<string, string> }>,
    ]),
  );

/* ── Dynamic rendering (102 pages exceed SSG memory budget) ──────────── */

export async function generateMetadata({ params }: { params: Promise<{ category: string; topic: string }> }) {
  const { category: categoryId, topic: topicId } = await params;
  const topic = GUIDE_TOPICS.find((t) => t.id === topicId);
  const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
  const categoryLabel = category?.name ?? "Guide";
  // Build a richer description with category context and keyword tags
  const tagSuffix = topic?.tags.slice(0, 4).join(", ");
  const description = topic
    ? `${topic.description} Part of the ${categoryLabel} section in the ${SITE_NAME} User Guide.${tagSuffix ? ` Topics: ${tagSuffix}.` : ""}`
    : undefined;
  return {
    title: topic ? `${topic.title} | ${categoryLabel} — ${SITE_NAME} Guide` : "Guide",
    description,
    alternates: {
      canonical: topic ? `${SITE_URL}/guide/${categoryId}/${topicId}` : undefined,
    },
    openGraph: topic ? {
      title: `${topic.title} — ${SITE_NAME} Guide`,
      description: topic.description,
      url: `${SITE_URL}/guide/${categoryId}/${topicId}`,
      type: "article",
    } : undefined,
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
  const steps = extractSteps(content);
  const howToJsonLd = buildHowToJsonLd(topic, categoryId, topicId, steps);
  const initialHeadings = extractHeadings(content);

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
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(howToJsonLd) }}
        />
      )}
      <TopicView
        category={category}
        topic={topic}
        content={content}
        initialHeadings={initialHeadings}
        prevTopic={prevTopic}
        nextTopic={nextTopic}
        related={related}
      />
    </>
  );
}
