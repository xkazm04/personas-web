import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import PrimaryCTA from "@/components/PrimaryCTA";
import type { GuideCategory, GuideTopic } from "@/data/guide/types";

interface TopicFooterProps {
  category: GuideCategory;
  prevTopic: GuideTopic | null;
  nextTopic: GuideTopic | null;
}

/** The try-it CTA and the prev/next topic navigation that close a guide topic. */
export default function TopicFooter({ category, prevTopic, nextTopic }: TopicFooterProps) {
  return (
    <>
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
              <div className="text-xs font-medium uppercase tracking-wider text-muted-dark">Previous</div>
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
              <div className="text-xs font-medium uppercase tracking-wider text-muted-dark">Back to</div>
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
              <div className="text-xs font-medium uppercase tracking-wider text-muted-dark">Next</div>
              <div className="truncate text-base font-medium text-foreground">{nextTopic.title}</div>
            </div>
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-dark transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </>
  );
}
