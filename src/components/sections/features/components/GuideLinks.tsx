"use client";

import { BookOpen } from "lucide-react";
import { guideHref, openGuideLink, type GuideTopicRef } from "@/lib/guide-link";

export default function GuideLinks({
  topics,
  layout,
}: {
  topics: GuideTopicRef[];
  layout: "row" | "stack";
}) {
  if (!topics?.length) return null;
  const wrap = layout === "row" ? "flex flex-wrap gap-x-4 gap-y-1.5" : "space-y-1.5";
  const itemCls =
    layout === "row"
      ? "inline-flex items-center gap-1.5 text-base text-muted-dark hover:text-brand-cyan transition-colors cursor-pointer"
      : "flex items-center gap-1.5 text-base text-muted-dark hover:text-brand-cyan transition-colors cursor-pointer";
  return (
    <div className={`mt-3 pt-3 border-t border-glass ${wrap}`}>
      {topics.map((gt) => (
        <button
          key={gt.topic}
          type="button"
          onClick={() => openGuideLink(guideHref(gt))}
          className={`${itemCls} bg-transparent border-none p-0 text-left`}
        >
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className={layout === "stack" ? "truncate" : undefined}>{gt.label}</span>
        </button>
      ))}
    </div>
  );
}
