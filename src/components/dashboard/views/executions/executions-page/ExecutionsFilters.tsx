import { Loader2 } from "lucide-react";

import FilterBar from "@/components/dashboard/FilterBar";

export function ExecutionsFilters({
  filter,
  counts,
  loading,
  labels,
  onChange,
}: {
  filter: string;
  counts: { all: number; running: number; completed: number; failed: number; cancelled: number };
  loading: boolean;
  labels: {
    all: string;
    active: string;
    completed: string;
    failed: string;
    cancelled: string;
  };
  onChange: (filter: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <FilterBar
        options={[
          { key: "all", label: labels.all, count: counts.all },
          { key: "running", label: labels.active, count: counts.running, pulse: counts.running > 0 },
          { key: "completed", label: labels.completed, count: counts.completed },
          { key: "failed", label: labels.failed, count: counts.failed },
          { key: "cancelled", label: labels.cancelled, count: counts.cancelled },
        ]}
        active={filter}
        onChange={onChange}
      />
      {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />}
    </div>
  );
}
