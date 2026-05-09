"use client";

import { CATEGORIES, CATEGORY_META } from "../../memoryShared";

export default function StackLegend() {
  return (
    <div className="flex items-center justify-center gap-6 border-t border-foreground/6 px-5 py-3">
      {CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: meta.color,
                boxShadow: `0 0 6px ${meta.color}70`,
              }}
            />
            <span className="text-base font-mono text-foreground/80 font-medium">
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
