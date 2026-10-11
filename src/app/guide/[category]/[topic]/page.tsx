import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { headingsOf, parseGuide, stepsOf } from "@/components/guide/guide-markdown/parseGuide";
import { getRelatedTopics, isTopicVisible } from "@/lib/guide-utils";
import { SITE_URL, SITE_NAME, safeJsonLd } from "@/lib/seo";
import { resolveTopicUnit } from "@/data/guide/getLocalized";
import { GUIDE_LOCALE_COOKIE, guideLocaleFromCookie } from "@/i18n/guideLocale";
import TopicView from "./TopicView";

/* ── Helpers for structured data ────────────────────────────────────── */

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
  if (!isTopicVisible(topic)) notFound();

  const { content: categoryContent } = await loader();
  const content = categoryContent[topicId];
  if (!content) notFound();

  // Prev/next must walk only topics this build actually serves — an unfiltered
  // neighbour would link straight into a notFound() for a devOnly topic.
  const categoryTopics = GUIDE_TOPICS.filter(
    (t) => t.categoryId === categoryId && isTopicVisible(t),
  );
  const currentIndex = categoryTopics.findIndex((t) => t.id === topicId);
  const prevTopic = currentIndex > 0 ? categoryTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < categoryTopics.length - 1 ? categoryTopics[currentIndex + 1] : null;
  const related = getRelatedTopics(topicId);
  // The reader's locale comes from the cookie the i18nStore mirrors (reading
  // it keeps this route dynamic, which it already is). It is normalized through
  // the release predicate, so production, which releases no locale, resolves
  // English here. resolveTopicUnit serves ONE whole unit (translated, or the
  // current English with the older translation as the alternate), so the SSR
  // body, TOC and JSON-LD below are all the same unit.
  const language = guideLocaleFromCookie((await cookies()).get(GUIDE_LOCALE_COOKIE)?.value);
  const unit = await resolveTopicUnit(language, topicId, {
    title: topic.title,
    description: topic.description,
    body: content,
  });
  // One parse feeds both: the HowTo steps are exactly what StepWizard renders,
  // and the TOC ids are exactly the rendered anchors.
  const { doc } = parseGuide(unit.body);
  const howToJsonLd = buildHowToJsonLd(unit, categoryId, topicId, stepsOf(doc));
  const initialHeadings = headingsOf(doc);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: unit.title,
    description: unit.description,
    inLanguage: unit.unit === "translated" ? language : "en",
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
      { "@type": "ListItem", position: 3, name: unit.title, item: `${SITE_URL}/guide/${categoryId}/${topicId}` },
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
        initialUnit={unit}
        initialLanguage={language}
        initialHeadings={initialHeadings}
        prevTopic={prevTopic}
        nextTopic={nextTopic}
        related={related}
      />
    </>
  );
}
