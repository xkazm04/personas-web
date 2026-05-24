"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import GradientText from "@/components/GradientText";
import SearchCombobox from "@/components/guide/SearchCombobox";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import type { GuideMode } from "@/data/guide/types";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { isCategoryVisibleForMode, isTopicVisible, isTopicVisibleForMode } from "@/lib/guide-utils";
import { safeJsonLd } from "@/lib/seo";

import { GuideCategoryGrid } from "./guide-page/GuideCategoryGrid";
import { GuideDiscordCTA } from "./guide-page/GuideDiscordCTA";
import { GuideModeToggle } from "./guide-page/GuideModeToggle";

function topicCountFor(categoryId: string, modeFilter: GuideMode | null) {
  return GUIDE_TOPICS.filter(
    (topic) =>
      topic.categoryId === categoryId &&
      isTopicVisible(topic) &&
      isTopicVisibleForMode(topic, modeFilter),
  ).length;
}

function GuidePageInner() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as GuideMode | null;
  const [modeFilter, setModeFilter] = useState<GuideMode | null>(initialMode);

  const visibleCategories = GUIDE_CATEGORIES.filter((category) =>
    isCategoryVisibleForMode(category.id, modeFilter),
  );

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleCategories.forEach((category) => {
      counts[category.id] = topicCountFor(category.id, modeFilter);
    });
    return counts;
  }, [visibleCategories, modeFilter]);

  const totalTopics = visibleCategories.reduce(
    (sum, category) => sum + (topicCounts[category.id] ?? 0),
    0,
  );

  return (
    <div className="px-4 pb-24 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Personas User Guide",
            description: `Everything you need to know about Personas - from your first agent to advanced multi-agent pipelines. ${GUIDE_TOPICS.length} topics across ${GUIDE_CATEGORIES.length} categories.`,
            url: "https://personas.ai/guide",
            isPartOf: {
              "@type": "WebSite",
              name: "Personas",
              url: "https://personas.ai",
            },
            numberOfItems: GUIDE_TOPICS.length,
          }),
        }}
      />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="pt-12 text-center"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 text-base font-semibold uppercase tracking-widest"
            style={{ color: BRAND_VAR.purple }}
          >
            {t.nav.guide}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl drop-shadow-md"
          >
            {t.guide.title}{" "}
            <GradientText className="drop-shadow-lg">{t.nav.guide}</GradientText>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light"
          >
            {t.guide.subtitle}{" "}
            <span className="font-semibold text-foreground/80">
              {totalTopics} {t.guide.topics}
            </span>
          </motion.p>

          <motion.div variants={fadeUp} className="mx-auto mt-10 max-w-xl">
            <SearchCombobox placeholder={t.guide.searchPlaceholder} />
          </motion.div>

          <GuideModeToggle modeFilter={modeFilter} onModeChange={setModeFilter} />
        </motion.div>

        <GuideCategoryGrid
          categories={visibleCategories}
          topicCounts={topicCounts}
          labels={{
            categories: t.guide.categories,
            categoryDescriptions: t.guide.categoryDescriptions,
            learnMore: t.common.learnMore,
          }}
        />

        <GuideDiscordCTA
          title={t.guide.stillQuestions}
          subtitle={t.faqSection.discordSubtitle}
          ctaLabel={t.guide.joinDiscord}
        />
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense>
      <GuidePageInner />
    </Suspense>
  );
}
