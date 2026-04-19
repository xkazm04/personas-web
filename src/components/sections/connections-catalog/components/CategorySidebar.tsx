"use client";

import { useMemo } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { categories } from "@/data/connectors";
import { accentBrandMap } from "../data";

export default function CategorySidebar({
  activeCategory,
  onSelect,
  categoryCount,
  total,
}: {
  activeCategory: string;
  onSelect: (key: string) => void;
  categoryCount: Record<string, number>;
  total: number;
}) {
  const sorted = useMemo(() => [...categories].sort((a, b) => a.label.localeCompare(b.label)), []);

  const baseBtnStyle = (isActive: boolean): React.CSSProperties =>
    isActive ? { color: BRAND_VAR.cyan, transform: "scale(1.05)" } : {};

  return (
    <aside className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-start gap-1">
      <div className="pointer-events-auto rounded-full border border-glass bg-black/20 px-2.5 py-1 text-base uppercase tracking-[0.2em] text-muted-dark backdrop-blur-sm font-mono mb-2">
        Categories
      </div>

      <button
        onClick={() => onSelect("all")}
        className="pointer-events-auto flex items-center gap-2 text-left text-base font-mono tracking-wider transition-all duration-300 py-1 text-muted-dark hover:text-muted"
        style={baseBtnStyle(activeCategory === "all")}
      >
        <div
          className="h-px transition-all duration-300"
          style={{
            width: activeCategory === "all" ? 24 : 16,
            backgroundImage: `linear-gradient(90deg, ${tint("cyan", activeCategory === "all" ? 80 : 35)}, transparent)`,
          }}
        />
        All ({total})
      </button>

      {sorted.map((cat) => {
        const count = categoryCount[cat.key] || 0;
        if (count === 0) return null;
        const isActive = activeCategory === cat.key;
        const brand = accentBrandMap[cat.accent];
        return (
          <button
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            className="pointer-events-auto flex items-center gap-2 text-left text-base font-mono tracking-wider transition-all duration-300 py-1 text-muted-dark hover:text-muted"
            style={baseBtnStyle(isActive)}
          >
            <div
              className="h-px transition-all duration-300"
              style={{
                width: isActive ? 24 : 16,
                backgroundImage: `linear-gradient(90deg, ${tint("cyan", isActive ? 80 : 35)}, transparent)`,
              }}
            />
            <span
              className="inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: isActive ? BRAND_VAR[brand] : "rgba(255,255,255,0.20)" }}
            />
            {cat.label} ({count})
          </button>
        );
      })}
    </aside>
  );
}
