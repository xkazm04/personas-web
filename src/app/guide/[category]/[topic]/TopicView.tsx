"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Download } from "lucide-react";
import GuideMarkdown from "@/components/guide/GuideMarkdown";
import PrimaryCTA from "@/components/PrimaryCTA";
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
  const contentH1Ref = useRef<HTMLHeadingElement>(null);
  const didMountRef = useRef(false);
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

  // Estimated reading time from the body word count (~200 wpm). Guide topics
  // have no stored reading-time or last-updated field, so derive it here.
  const readingMinutes = useMemo(
    () => Math.max(1, Math.round(localized.body.trim().split(/\s+/).filter(Boolean).length / 200)),
    [localized.body],
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

  // On client-side topic change (prev/next nav or search), move focus to the
  // topic <h1> so screen-reader/keyboard users land on the new content and hear
  // its title, instead of focus sitting on a now-stale link or the search input.
  // Skip the initial mount so we never steal focus on first load.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    contentH1Ref.current?.focus();
  }, [topic.id]);

  return (
    <div className="px-6 pb-24 pt-9 lg:pt-0">
      <a
        href="#guide-topic-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-glass-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-brand-cyan/50"
      >
        Skip to content
      </a>
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
          <h1
            ref={contentH1Ref}
            id="guide-topic-content"
            tabIndex={-1}
            className="text-3xl font-bold tracking-tight text-foreground outline-none sm:text-4xl"
          >
            {localized.title}
          </h1>
          {localized.description && (
            <p className="mt-3 text-lg font-light leading-relaxed text-muted-dark">
              {localized.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-dark">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {readingMinutes} min read
          </div>
          <div className="mt-8">
            <GuideMarkdown content={localized.body} />
          </div>
        </article>

        {/* Related topics */}
        <RelatedTopics related={related} />

        {/* Try-it CTA: prev/next + related otherwise loop guide-to-guide, never
            out to the product. Offer a path to download / templates. */}
        <div className="mt-12 rounded-2xl border border-glass bg-white/[0.02] p-6 text-center backdrop-blur-sm">
          <p className="text-lg font-semibold text-foreground">Ready to try this yourself?</p>
          <p className="mx-auto mt-2 max-w-md text-sm font-light text-muted-dark">
            Personas runs free on your machine. No signup, no credit card.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCTA href="/#download" icon={Download} label="Download free" />
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 rounded-full border border-glass-hover bg-white/[0.02] px-5 py-2.5 text-base font-medium text-muted transition-colors hover:border-glass-strong hover:text-foreground"
            >
              Browse templates
            </Link>
          </div>
        </div>

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
