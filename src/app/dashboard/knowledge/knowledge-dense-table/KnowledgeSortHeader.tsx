import { ChevronDown, ChevronUp } from "lucide-react";
import type { ColumnDef, SortDir, SortField } from "./knowledgeDenseTypes";

export function KnowledgeSortHeader({
  column,
  sortField,
  sortDir,
  onSort,
}: {
  column: ColumnDef;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortField === column.key;
  const align = column.align === "right" ? "justify-end" : column.align === "center" ? "justify-center" : "justify-start";

  return (
    <button
      onClick={() => onSort(column.key)}
      className={`flex items-center gap-1 ${align} ${column.width} px-2 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${isActive ? "text-foreground" : "text-muted-dark hover:text-foreground/70"}`}
    >
      {column.label}
      <span className="flex flex-col -space-y-0.5">
        <ChevronUp className={`h-2.5 w-2.5 ${isActive && sortDir === "asc" ? "text-cyan-400" : "text-white/[0.15]"}`} />
        <ChevronDown className={`h-2.5 w-2.5 ${isActive && sortDir === "desc" ? "text-cyan-400" : "text-white/[0.15]"}`} />
      </span>
    </button>
  );
}
