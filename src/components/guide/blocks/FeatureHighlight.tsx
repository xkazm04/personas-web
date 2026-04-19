"use client";

import { Star } from "lucide-react";

/**
 * FeatureHighlight — :::feature with **Title** on first line, then body.
 */

interface FeatureHighlightProps {
  title: string;
  body: string;
  color?: string;
}

export function FeatureHighlight({ title, body, color }: FeatureHighlightProps) {
  const accentColor = color ?? "#06b6d4";
  return (
    <div className="my-6 rounded-xl border border-glass-hover bg-gradient-to-br from-white/[0.03] to-transparent px-5 py-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}15` }}
          aria-hidden="true"
        >
          <Star className="h-4 w-4" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-base leading-relaxed text-muted-dark">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
