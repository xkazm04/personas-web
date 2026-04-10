"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GuideMarkdown from "@/components/guide/GuideMarkdown";
import RelatedTopics from "@/components/guide/RelatedTopics";
import type { GuideCategory, GuideTopic } from "@/data/guide/types";
import type { RelatedTopic } from "@/lib/guide-utils";

interface TopicViewProps {
  category: GuideCategory;
  topic: GuideTopic;
  content: string;
  prevTopic: GuideTopic | null;
  nextTopic: GuideTopic | null;
  related: RelatedTopic[];
}

export default function TopicView({ category, topic, content, prevTopic, nextTopic, related }: TopicViewProps) {
  return (
    <div className="px-6 pb-24">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-8 flex items-center gap-1.5 text-base text-muted-dark">
          <Link href="/guide" className="transition-colors hover:text-brand-cyan">Guide</Link>
          <span>/</span>
          <Link href={`/guide/${category.id}`} className="transition-colors hover:text-brand-cyan">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground" aria-current="page">{topic.title}</span>
        </nav>

        {/* Tags */}
        {topic.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-sm font-medium"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <article className="mt-8">
          <GuideMarkdown content={content} />
        </article>

        {/* Related topics */}
        <RelatedTopics related={related} />

        {/* Prev / Next navigation */}
        <nav aria-label="Topic navigation" className="mt-16 grid grid-cols-2 gap-4">
          {prevTopic ? (
            <Link
              href={`/guide/${category.id}/${prevTopic.id}`}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:-translate-x-0.5" />
              <div className="min-w-0">
                <div className="text-sm text-muted-dark">Previous</div>
                <div className="truncate text-base font-medium text-foreground">{prevTopic.title}</div>
              </div>
            </Link>
          ) : (
            <Link
              href={`/guide/${category.id}`}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:-translate-x-0.5" />
              <div className="min-w-0">
                <div className="text-sm text-muted-dark">Back to</div>
                <div className="truncate text-base font-medium text-foreground">{category.name}</div>
              </div>
            </Link>
          )}

          {nextTopic ? (
            <Link
              href={`/guide/${category.id}/${nextTopic.id}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-right transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <div className="text-sm text-muted-dark">Next</div>
                <div className="truncate text-base font-medium text-foreground">{nextTopic.title}</div>
              </div>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </div>
  );
}
