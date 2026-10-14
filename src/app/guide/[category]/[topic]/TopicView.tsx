"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import GuideMarkdown from "@/components/guide/GuideMarkdown";
import RelatedTopics from "@/components/guide/RelatedTopics";
import TopicTOC from "@/components/guide/TopicTOC";
import MobileTopicTOC from "@/components/guide/MobileTopicTOC";
import ReadingProgress from "@/components/guide/ReadingProgress";
import { CHROME_PAD_TOPIC, CHROME_TOC_STICKY } from "@/components/guide/guide-chrome";
import { extractHeadings } from "@/components/guide/guide-markdown/extractHeadings";
import type { GuideHeading } from "@/components/guide/guide-markdown/extractHeadings";
import { useArrivalMark } from "@/components/guide/guide-markdown/useArrivalMark";
import TranslationNotice from "@/components/guide/TranslationNotice";
import { resolveTopicUnit } from "@/data/guide/getLocalized";
import type { TopicUnitPreference, TopicUnitResolution } from "@/data/guide/getLocalized";
import { useTranslation } from "@/i18n/useTranslation";
import { useI18nStore } from "@/stores/i18nStore";
import type { Language } from "@/stores/i18nStore";
import type { GuideCategory, GuideTopic } from "@/data/guide/types";
import type { RelatedTopic } from "@/lib/guide-utils";
import TopicHeader from "./TopicHeader";
import TopicFooter from "./TopicFooter";

interface TopicViewProps {
  category: GuideCategory;
  topic: GuideTopic;
  content: string;
  /** The unit the server rendered for the cookie locale (English when none). */
  initialUnit: TopicUnitResolution;
  /** The locale `initialUnit` was resolved for. */
  initialLanguage: Language;
  initialHeadings: GuideHeading[];
  prevTopic: GuideTopic | null;
  nextTopic: GuideTopic | null;
  related: RelatedTopic[];
}

// Topic the reader last landed on, held at module scope on purpose: Next remounts
// this component when the [topic] segment changes, so any ref inside it restarts
// on every navigation and a mount-flag guard can never tell a swap from a cold load.
// null until the first landing, so a cold load never moves focus.
let lastLandedTopicId: string | null = null;

export default function TopicView({ category, topic, content, initialUnit, initialLanguage, initialHeadings, prevTopic, nextTopic, related }: TopicViewProps) {
  const { t } = useTranslation();
  const contentH1Ref = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // A search body hit lands on its #section; mark the matched words there.
  const hitMarked = useArrivalMark(bodyRef, topic.id);
  // Locale-aware unit. The server resolves the unit for the locale cookie the
  // i18nStore mirrors (page.tsx) and passes it as `initialUnit`, so the first
  // paint is already in the reader's language. Client re-resolution through
  // resolveTopicUnit only covers a locale change after load and the `prefer`
  // toggle, which picks between the two whole units of a stale topic. The
  // switcher and the cookie are gated (LANGUAGE_SWITCHER_ENABLED / the release
  // list), so in production this stays on the English path.
  const language = useI18nStore((s) => s.language);
  const [prefer, setPrefer] = useState<TopicUnitPreference | undefined>(undefined);
  // The server unit is only valid for the locale it was resolved for; a store
  // that disagrees (no localStorage yet, or a changed locale) starts from English.
  const startingUnit = (lang: Language) =>
    lang === initialLanguage ? initialUnit : englishUnit(topic, content);
  const [localized, setLocalized] = useState<TopicUnitResolution>(() => startingUnit(language));

  // Reset to the English content (and the reader's default preference) whenever
  // the locale or topic changes. Done in render via the prev-state pattern (not
  // in an effect) to satisfy React 19's "no synchronous setState in an effect"
  // rule. For non-en locales this is the unit shown until the async swap resolves.
  const resetKey = `${language}|${topic.id}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPrefer(undefined);
    setLocalized(startingUnit(language));
  }

  // Skip the client parse on the initial render — page.tsx already extracted
  // headings from the same `content` string and passed them in. The useMemo
  // only re-parses when localized.body diverges (locale switch — currently
  // dormant; see comment above on the i18nStore).
  const headings = useMemo(
    () => (localized.body === initialUnit.body ? initialHeadings : extractHeadings(localized.body)),
    [localized.body, initialUnit.body, initialHeadings],
  );

  // Estimated reading time from the body word count (~200 wpm). Guide topics
  // have no stored reading-time or last-updated field, so derive it here.
  const readingMinutes = useMemo(
    () => Math.max(1, Math.round(localized.body.trim().split(/\s+/).filter(Boolean).length / 200)),
    [localized.body],
  );

  useEffect(() => {
    if (language === "en") return;
    // The server already resolved this exact unit (default preference).
    if (language === initialLanguage && prefer === undefined) return;
    let cancelled = false;
    const english = { title: topic.title, description: topic.description, body: content };
    resolveTopicUnit(language, topic.id, english, { prefer }).then((next) => {
      if (!cancelled) setLocalized(next);
    });
    return () => {
      cancelled = true;
    };
  }, [language, initialLanguage, topic.id, topic.title, topic.description, content, prefer]);

  // On client-side topic change (prev/next nav or search), move focus to the
  // topic <h1> so screen-reader/keyboard users land on the new content and hear
  // its title, instead of focus sitting on a now-stale link or the search input.
  // Guarded on topic identity (see lastLandedTopicId), so first paint and a
  // Strict-Mode double effect never steal focus while a real change does.
  useEffect(() => {
    const previous = lastLandedTopicId;
    lastLandedTopicId = topic.id;
    if (previous === null || previous === topic.id) return;
    // A #section arrival (search hit, shared link) keeps its landing scroll.
    contentH1Ref.current?.focus({ preventScroll: window.location.hash.length > 1 });
  }, [topic.id]);

  return (
    <div className={`px-6 pb-24 ${CHROME_PAD_TOPIC}`}>
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
        <TopicHeader category={category} topic={topic} title={localized.title} />

        {/* Content */}
        <article
          className="mt-8"
          lang={localized.status === "source" ? undefined : localized.unit === "canonical" ? "en" : language}
        >
          <h1
            ref={contentH1Ref}
            id="guide-topic-content"
            tabIndex={-1}
            className="scroll-mt-24 text-3xl font-bold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan/60 sm:text-4xl"
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
          {localized.alternate && (
            <TranslationNotice
              showing={localized.unit}
              onToggle={() => setPrefer(localized.unit === "canonical" ? "translation" : "canonical")}
            />
          )}
          <div ref={bodyRef} className="mt-8">
            <GuideMarkdown content={localized.body} />
          </div>
          <p className="sr-only" aria-live="polite">
            {hitMarked ? t.guide.searchHitMarked : ""}
          </p>
        </article>

        {/* Related topics */}
        <RelatedTopics related={related} />

        <TopicFooter category={category} prevTopic={prevTopic} nextTopic={nextTopic} />
        </div>
        <aside className="hidden lg:block">
          <div className={`sticky ${CHROME_TOC_STICKY}`}>
            <TopicTOC headings={headings} label={t.pageNav.onThisPage} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function englishUnit(topic: GuideTopic, content: string): TopicUnitResolution {
  return {
    title: topic.title,
    description: topic.description,
    body: content,
    unit: "canonical",
    status: "source",
    alternate: null,
  };
}
