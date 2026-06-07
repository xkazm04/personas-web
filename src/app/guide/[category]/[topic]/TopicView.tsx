"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GuideMarkdown from "@/components/guide/GuideMarkdown";
import RelatedTopics from "@/components/guide/RelatedTopics";
import ModuleBadge from "@/components/guide/ModuleBadge";
import TopicTOC from "@/components/guide/TopicTOC";
import MobileTopicTOC from "@/components/guide/MobileTopicTOC";
import ReadingProgress from "@/components/guide/ReadingProgress";
import { extractHeadings } from "@/components/guide/guide-markdown/extractHeadings";
import type { GuideHeading } from "@/components/guide/guide-markdown/extractHeadings";
import { TOPIC_MODULE_MAP } from "@/data/guide/desktop-modules";
import { getLocalizedTopic } from "@/data/guide/getLocalized";
import { useTranslation } from "@/i18n/useTranslation";
import { useI18nStore } from "@/stores/i18nStore";
import type { GuideCategory, GuideTopic } from "@/data/guide/types";
import type { RelatedTopic } from "@/lib/guide-utils";

interface TopicViewProps {
  category: GuideCategory;
  topic: GuideTopic;
  content: string;
  initialHeadings: GuideHeading[];
  prevTopic: GuideTopic | null;
  nextTopic: GuideTopic | null;
  related: RelatedTopic[];
}

export default function TopicView({ category, topic, content, initialHeadings, prevTopic, nextTopic, related }: TopicViewProps) {
  const { t } = useTranslation();
  // Locale-aware swap. The server renders the English content (no locale
  // signal in the URL or cookie today), and once the i18nStore hydrates on
  // the client we re-resolve through getLocalizedTopic. Currently the
  // i18nStore is hard-locked to 'en' (setLanguage is a no-op) — so this
  // hook is dormant infrastructure until the locale switcher is wired up.
  // When that day comes, no further change is needed here: the title,
  // description, and body will swap independently with English fallback.
  const language = useI18nStore((s) => s.language);
  const [localized, setLocalized] = useState({
    title: topic.title,
    description: topic.description,
    body: content,
  });

  // Reset to the English content whenever the locale or topic changes. Done in
  // render via the prev-state pattern (not in an effect) to satisfy React 19's
  // "no synchronous setState in an effect" rule. For non-en locales this is the
  // fallback shown until the async swap below resolves.
  const resetKey = `${language}|${topic.id}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setLocalized({ title: topic.title, description: topic.description, body: content });
  }

  // Skip the client parse on the initial render — page.tsx already extracted
  // headings from the same `content` string and passed them in. The useMemo
  // only re-parses when localized.body diverges (locale switch — currently
  // dormant; see comment above on the i18nStore).
  const headings = useMemo(
    () => (localized.body === content ? initialHeadings : extractHeadings(localized.body)),
    [localized.body, content, initialHeadings],
  );

  useEffect(() => {
    if (language === "en") return;
    let cancelled = false;
    getLocalizedTopic(language, topic.id, content).then((next) => {
      if (!cancelled) setLocalized(next);
    });
    return () => {
      cancelled = true;
    };
  }, [language, topic.id, content]);

  return (
    <div className="px-6 pb-24 pt-9 lg:pt-0">
      <ReadingProgress />
      <MobileTopicTOC headings={headings} />
      <div className="mx-auto max-w-3xl lg:max-w-[80rem] lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-12">
        <div className="min-w-0 lg:max-w-[52rem]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-8 flex items-center gap-1.5 text-base text-muted-dark">
          <Link href="/guide" className="transition-colors hover:text-brand-cyan">Guide</Link>
          <span>/</span>
          <Link href={`/guide/${category.id}`} className="transition-colors hover:text-brand-cyan">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground" aria-current="page">{localized.title}</span>
        </nav>

        {/* Desktop app reference + Tags */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {TOPIC_MODULE_MAP[topic.id] && (
            <ModuleBadge moduleRef={TOPIC_MODULE_MAP[topic.id]} categoryColor={category.color} />
          )}
        </div>

        {/* Tags */}
        {topic.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-base font-medium"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <article className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {localized.title}
          </h1>
          {localized.description && (
            <p className="mt-3 text-lg font-light leading-relaxed text-muted-dark">
              {localized.description}
            </p>
          )}
          <div className="mt-8">
            <GuideMarkdown content={localized.body} />
          </div>
        </article>

        {/* Related topics */}
        <RelatedTopics related={related} />

        {/* Prev / Next navigation */}
        <nav aria-label="Topic navigation" className="mt-16 grid grid-cols-2 gap-4">
          {prevTopic ? (
            <Link
              href={`/guide/${category.id}/${prevTopic.id}`}
              className="group flex items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-5 py-4 transition-colors hover:border-glass-strong hover:bg-white/[0.04]"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:-translate-x-0.5" />
              <div className="min-w-0">
                <div className="text-base text-muted-dark">Previous</div>
                <div className="truncate text-base font-medium text-foreground">{prevTopic.title}</div>
              </div>
            </Link>
          ) : (
            <Link
              href={`/guide/${category.id}`}
              className="group flex items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-5 py-4 transition-colors hover:border-glass-strong hover:bg-white/[0.04]"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:-translate-x-0.5" />
              <div className="min-w-0">
                <div className="text-base text-muted-dark">Back to</div>
                <div className="truncate text-base font-medium text-foreground">{category.name}</div>
              </div>
            </Link>
          )}

          {nextTopic ? (
            <Link
              href={`/guide/${category.id}/${nextTopic.id}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-glass bg-white/[0.02] px-5 py-4 text-right transition-colors hover:border-glass-strong hover:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <div className="text-base text-muted-dark">Next</div>
                <div className="truncate text-base font-medium text-foreground">{nextTopic.title}</div>
              </div>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TopicTOC headings={headings} label={t.pageNav.onThisPage} />
          </div>
        </aside>
      </div>
    </div>
  );
}
