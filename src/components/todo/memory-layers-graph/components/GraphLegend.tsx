"use client";

import { CATEGORIES, CATEGORY_META } from "../../memoryShared";

export default function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-foreground/6 bg-background/30 px-5 py-3">
      <div className="flex flex-wrap items-center gap-4">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <span
              key={cat}
              className="flex items-center gap-1.5 text-base font-mono uppercase tracking-wider text-foreground/75"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-base font-mono text-foreground/60">
        <span className="h-px w-8 bg-foreground/25" />
        <span>solid · hub link</span>
        <span className="h-px w-8 border-t border-dashed border-foreground/25" />
        <span>dashed · shared tag</span>
      </div>
    </div>
  );
}
