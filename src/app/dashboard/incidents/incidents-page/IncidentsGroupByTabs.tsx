"use client";

import { useCallback, useRef } from "react";

import { useTranslation } from "@/i18n/useTranslation";
import type { GroupByKey } from "./incidentFormat";
import { useIncidentsFilterStore } from "./useIncidentsFilterStore";

const ORDER: GroupByKey[] = ["none", "agent", "severity", "source"];

/**
 * "Group by" segmented control (none / agent / severity / source) with a
 * roving-tabindex keyboard model, mirroring EventsPageTabs. Selection lives in
 * the persisted incidents filter store.
 */
export function IncidentsGroupByTabs() {
  const { t } = useTranslation();
  const labels = t.incidentsPage;
  const groupBy = useIncidentsFilterStore((s) => s.groupBy);
  const setGroupBy = useIncidentsFilterStore((s) => s.setGroupBy);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const current = ORDER.indexOf(groupBy);
      let next: number | null = null;
      if (e.key === "ArrowRight") next = (current + 1) % ORDER.length;
      else if (e.key === "ArrowLeft") next = (current - 1 + ORDER.length) % ORDER.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = ORDER.length - 1;
      if (next === null) return;
      e.preventDefault();
      setGroupBy(ORDER[next]);
      refs.current[next]?.focus();
    },
    [groupBy, setGroupBy],
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-dark">{labels.groupByLabel}</span>
      <div
        role="tablist"
        aria-label={labels.groupByLabel}
        aria-orientation="horizontal"
        className="flex overflow-x-auto rounded-lg border border-glass bg-white/[0.02] p-0.5 scrollbar-hide"
      >
        {ORDER.map((key, index) => {
          const isActive = groupBy === key;
          return (
            <button
              key={key}
              ref={(el) => { refs.current[index] = el; }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setGroupBy(key)}
              onKeyDown={onKeyDown}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-ring focus-visible:ring-offset-0 ${
                isActive ? "bg-white/[0.08] text-foreground shadow-sm" : "text-muted-dark hover:text-muted"
              }`}
            >
              {labels.groupBy[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
