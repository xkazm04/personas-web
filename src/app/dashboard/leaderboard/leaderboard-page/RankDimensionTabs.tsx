"use client";

import { useCallback, useRef } from "react";

import { useTranslation } from "@/i18n/useTranslation";
import { RANK_DIMENSIONS, type RankDimension } from "./leaderboardRank";

/**
 * Rank-dimension segmented control (overall / reliability / speed / cost /
 * quality) that re-ranks the podium. Roving-tabindex keyboard model, mirroring
 * the other dashboard segmented controls.
 */
export function RankDimensionTabs({
  value,
  onChange,
}: {
  value: RankDimension;
  onChange: (dim: RankDimension) => void;
}) {
  const { t } = useTranslation();
  const lp = t.leaderboardPage;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const label = (dim: RankDimension) => (dim === "overall" ? lp.overall : lp.metrics[dim]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const current = RANK_DIMENSIONS.indexOf(value);
      let next: number | null = null;
      if (e.key === "ArrowRight") next = (current + 1) % RANK_DIMENSIONS.length;
      else if (e.key === "ArrowLeft") next = (current - 1 + RANK_DIMENSIONS.length) % RANK_DIMENSIONS.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = RANK_DIMENSIONS.length - 1;
      if (next === null) return;
      e.preventDefault();
      onChange(RANK_DIMENSIONS[next]);
      refs.current[next]?.focus();
    },
    [value, onChange],
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-dark">{lp.rankBy}</span>
      <div
        role="tablist"
        aria-label={lp.rankBy}
        aria-orientation="horizontal"
        className="flex overflow-x-auto rounded-lg border border-glass bg-white/[0.02] p-0.5 scrollbar-hide"
      >
        {RANK_DIMENSIONS.map((dim, index) => {
          const isActive = value === dim;
          return (
            <button
              key={dim}
              ref={(el) => { refs.current[index] = el; }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(dim)}
              onKeyDown={onKeyDown}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-ring focus-visible:ring-offset-0 ${
                isActive ? "bg-white/[0.08] text-foreground shadow-sm" : "text-muted-dark hover:text-muted"
              }`}
            >
              {label(dim)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
