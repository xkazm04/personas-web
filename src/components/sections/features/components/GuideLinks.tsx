"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { GuideLink } from "../types";

export default function GuideLinks({ topics, layout }: { topics: GuideLink[]; layout: "row" | "stack" }) {
  if (!topics?.length) return null;
  const wrap = layout === "row" ? "flex flex-wrap gap-x-4 gap-y-1.5" : "space-y-1.5";
  const itemCls =
    layout === "row"
      ? "inline-flex items-center gap-1.5 text-base text-muted-dark hover:text-brand-cyan transition-colors"
      : "flex items-center gap-1.5 text-base text-muted-dark hover:text-brand-cyan transition-colors";
  return (
    <div className={`mt-3 pt-3 border-t border-glass ${wrap}`}>
      {topics.map((gt) => (
        <Link key={gt.topic} href={`/guide/${gt.category}/${gt.topic}`} className={itemCls}>
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className={layout === "stack" ? "truncate" : undefined}>{gt.label}</span>
        </Link>
      ))}
    </div>
  );
}
