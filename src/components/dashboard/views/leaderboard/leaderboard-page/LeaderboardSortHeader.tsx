import { ChevronDown, ChevronUp } from "lucide-react";

import type { LeaderboardSortField, SortDir } from "./leaderboardSort";

// Mirrors the canonical KnowledgeSortHeader shape (chevron pair + active-cyan
// state) so the leaderboard table reads as a sortable surface consistently.
export function LeaderboardSortHeader({
  field,
  label,
  align = "left",
  sortField,
  sortDir,
  sortByLabel,
  onSort,
}: {
  field: LeaderboardSortField;
  label: string;
  align?: "left" | "right";
  sortField: LeaderboardSortField;
  sortDir: SortDir;
  sortByLabel: string;
  onSort: (field: LeaderboardSortField) => void;
}) {
  const isActive = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      aria-label={sortByLabel.replace("{field}", label)}
      className={`flex items-center gap-1 text-sm font-medium uppercase tracking-wider transition-colors ${
        align === "right" ? "justify-end" : "justify-start"
      } ${isActive ? "text-foreground" : "text-muted-dark hover:text-foreground/70"}`}
    >
      {label}
      <span className="flex flex-col -space-y-0.5">
        <ChevronUp
          className={`h-2.5 w-2.5 ${isActive && sortDir === "asc" ? "text-cyan-400" : "text-white/[0.15]"}`}
        />
        <ChevronDown
          className={`h-2.5 w-2.5 ${isActive && sortDir === "desc" ? "text-cyan-400" : "text-white/[0.15]"}`}
        />
      </span>
    </button>
  );
}
