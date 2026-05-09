"use client";

import { Star } from "lucide-react";
import { BRAND_VAR, type BrandKey } from "@/lib/brand-theme";

/**
 * CompareBlock — :::compare with items separated by "---", each with
 * **Title** on first line and body after.
 */

const BRAND_ROTATION: BrandKey[] = ["cyan", "purple", "emerald", "rose", "amber"];

interface CompareBlockProps {
  items: { title: string; body: string; highlight?: boolean }[];
}

export function CompareBlock({ items }: CompareBlockProps) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => {
        const color = BRAND_VAR[BRAND_ROTATION[i % BRAND_ROTATION.length]];
        return (
          <div
            key={i}
            className={`relative rounded-xl border px-5 py-4 backdrop-blur-sm transition-colors ${
              item.highlight
                ? "border-glass-strong bg-white/[0.04]"
                : "border-glass bg-white/[0.02]"
            }`}
          >
            {item.highlight && (
              <span
                aria-label="Recommended option"
                className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/20 px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-brand-cyan"
              >
                <Star className="h-2.5 w-2.5" aria-hidden="true" />
                Recommended
              </span>
            )}
            <div
              className="mb-2 h-0.5 w-8 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <h4 className="text-base font-semibold text-foreground">
              {item.title}
            </h4>
            <p className="mt-1.5 text-base leading-relaxed text-muted-dark">
              {item.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
