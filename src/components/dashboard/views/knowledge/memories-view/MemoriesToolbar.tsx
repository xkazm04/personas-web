import { AlertTriangle } from "lucide-react";

import FilterBar from "@/components/dashboard/FilterBar";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";

import type { FilterKey } from "./memoryViewConfig";

export function MemoriesToolbar({
  filter,
  filterOptions,
  activeConflictCount,
  conflictCountLabel,
  resolveButtonLabel,
  onFilterChange,
  onResolveConflicts,
}: {
  filter: FilterKey;
  filterOptions: { key: string; label: string; count?: number }[];
  activeConflictCount: number;
  conflictCountLabel: string;
  resolveButtonLabel: string;
  onFilterChange: (key: FilterKey) => void;
  onResolveConflicts: () => void;
}) {
  return (
    // T1 toolbar: the first step of the tab's CSS cascade (was a framer fadeUp).
    <div className={`${ARRIVE} mb-3 flex flex-wrap items-center gap-2`} style={arriveAt(0)}>
      <FilterBar
        options={filterOptions}
        active={filter}
        onChange={(key) => onFilterChange(key as FilterKey)}
      />
      {activeConflictCount > 0 && (
        <button
          type="button"
          onClick={onResolveConflicts}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition-all hover:bg-rose-500/15"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="tabular-nums">{conflictCountLabel}</span>
          <span aria-hidden>-</span>
          {resolveButtonLabel}
        </button>
      )}
    </div>
  );
}
