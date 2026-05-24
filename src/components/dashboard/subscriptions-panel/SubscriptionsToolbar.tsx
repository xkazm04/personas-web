import { Loader2, Plus } from "lucide-react";

import type { SubscriptionFilter } from "./subscriptionTypes";

export function SubscriptionsToolbar({
  filterEnabled,
  subscriptionCount,
  activeCount,
  loading,
  labels,
  onFilterChange,
  onCreate,
}: {
  filterEnabled: SubscriptionFilter;
  subscriptionCount: number;
  activeCount: number;
  loading: boolean;
  labels: { all: string; active: string; disabled: string; newSubscription: string };
  onFilterChange: (filter: SubscriptionFilter) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-glass bg-white/[0.02] p-0.5">
          {(["all", "active", "disabled"] as const).map((key) => (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                filterEnabled === key
                  ? "bg-white/[0.08] text-foreground shadow-sm"
                  : "text-muted-dark hover:text-muted"
              }`}
            >
              {key === "all"
                ? `${labels.all} (${subscriptionCount})`
                : key === "active"
                  ? `${labels.active} (${activeCount})`
                  : `${labels.disabled} (${subscriptionCount - activeCount})`}
            </button>
          ))}
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />}
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
      >
        <Plus className="h-3.5 w-3.5" />
        {labels.newSubscription}
      </button>
    </div>
  );
}
