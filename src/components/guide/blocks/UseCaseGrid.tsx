"use client";

import { ArrowRight } from "lucide-react";

/**
 * UseCaseGrid — :::usecases with items in the format:
 *   **Title**
 *   Scenario text
 *   ---
 *   Outcome text
 *   ===
 *   (next item)
 */

interface UseCaseGridProps {
  items: { title: string; scenario: string; outcome: string }[];
}

export function UseCaseGrid({ items }: UseCaseGridProps) {
  return (
    <div className="my-6 grid gap-3 md:grid-cols-3">
      {items.map((uc, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-glass-hover bg-white/[0.02] p-5 backdrop-blur-sm"
        >
          <h4 className="mb-3 text-base font-semibold text-foreground">
            {uc.title}
          </h4>
          <p className="mb-3 text-base italic text-muted-dark/80">
            {uc.scenario}
          </p>
          <ArrowRight
            className="mb-3 h-4 w-4 shrink-0 text-brand-cyan"
            aria-hidden="true"
          />
          <p className="text-base leading-relaxed text-muted-dark">
            {uc.outcome}
          </p>
        </div>
      ))}
    </div>
  );
}
