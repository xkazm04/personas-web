import type { SeverityFilter } from "./performanceViewTypes";

export function SeverityFilterChips({
  active,
  onSelect,
  counts,
  labels,
}: {
  active: SeverityFilter;
  onSelect: (filter: SeverityFilter) => void;
  counts: Record<SeverityFilter, number>;
  labels: Record<SeverityFilter, string>;
}) {
  const filters: SeverityFilter[] = ["all", "critical", "high", "medium", "low"];
  const filterColors: Record<SeverityFilter, string> = {
    all: "text-foreground border-glass-strong",
    critical: "text-red-400 border-red-500/20",
    high: "text-orange-400 border-orange-500/20",
    medium: "text-amber-400 border-amber-500/20",
    low: "text-blue-400 border-blue-500/20",
  };
  const filterActiveBg: Record<SeverityFilter, string> = {
    all: "bg-white/[0.08]",
    critical: "bg-red-500/15",
    high: "bg-orange-500/15",
    medium: "bg-amber-500/15",
    low: "bg-blue-500/15",
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onSelect(filter)}
          className={`rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize transition-all cursor-pointer ${filterColors[filter]} ${active === filter ? filterActiveBg[filter] : "bg-transparent hover:bg-white/[0.04]"}`}
        >
          {labels[filter]}
          {counts[filter] > 0 && <span className="ml-1 opacity-60">{counts[filter]}</span>}
        </button>
      ))}
    </div>
  );
}
