import { FilterX, X, Zap } from "lucide-react";

import EmptyState from "@/components/dashboard/EmptyState";

export function ExecutionsEmptyState({
  isFilteredEmpty,
  filter,
  labels,
  onShowAll,
}: {
  isFilteredEmpty: boolean;
  filter: string;
  labels: {
    noExecutions: string;
    noExecutionsDesc: string;
    noFilteredActive: string;
    noFilteredCompleted: string;
    noFilteredFailed: string;
    noFilteredCancelled: string;
    filteredEmptyDesc: string;
    showAllExecutions: string;
  };
  onShowAll: () => void;
}) {
  if (!isFilteredEmpty) {
    return (
      <EmptyState
        icon={Zap}
        title={labels.noExecutions}
        description={labels.noExecutionsDesc}
      />
    );
  }

  const filteredTitles: Record<string, string> = {
    running: labels.noFilteredActive,
    completed: labels.noFilteredCompleted,
    failed: labels.noFilteredFailed,
    cancelled: labels.noFilteredCancelled,
  };

  return (
    <EmptyState
      icon={FilterX}
      title={filteredTitles[filter] ?? labels.noExecutions}
      description={labels.filteredEmptyDesc}
      action={
        <button
          type="button"
          onClick={onShowAll}
          className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1.5 text-sm text-brand-cyan transition-colors hover:border-brand-cyan/30 hover:bg-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
        >
          <X className="h-3.5 w-3.5" />
          {labels.showAllExecutions}
        </button>
      }
    />
  );
}
