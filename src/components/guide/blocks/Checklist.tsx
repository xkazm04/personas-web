"use client";

import { Check } from "lucide-react";

/**
 * Checklist — :::checklist with "- Item text" lines.
 */

interface ChecklistProps {
  items: string[];
}

export function Checklist({ items }: ChecklistProps) {
  return (
    <div className="my-6 space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/[0.08]">
            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
          </div>
          <span className="text-base leading-relaxed text-muted-dark">
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}
