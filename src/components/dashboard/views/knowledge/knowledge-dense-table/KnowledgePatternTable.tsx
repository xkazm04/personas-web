import { AnimatePresence } from "framer-motion";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import type { ColumnDef, SortDir, SortField } from "./knowledgeDenseTypes";
import { KnowledgePatternRow } from "./KnowledgePatternRow";
import { KnowledgeSortHeader } from "./KnowledgeSortHeader";

export function KnowledgePatternTable({
  columns,
  patterns,
  selectedPattern,
  sortField,
  sortDir,
  onSort,
  onSelect,
  pending = false,
  settle = false,
}: {
  columns: ColumnDef[];
  patterns: KnowledgePattern[];
  selectedPattern: KnowledgePattern | null;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onSelect: (pattern: KnowledgePattern) => void;
  /** Cold load with nothing held: frame + column headers paint (T1), rows are ghosted. */
  pending?: boolean;
  /** Rows landing after a cold load take the T2 entrance (once). */
  settle?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`${ARRIVE} flex-1 min-h-0 flex flex-col rounded-xl border border-glass overflow-hidden bg-white/[0.01] dot-grid`}
      style={arriveAt(1)}
    >
      <div className="flex items-center border-b border-glass bg-white/[0.02] shrink-0">
        {columns.map((col) => (
          <KnowledgeSortHeader key={col.key} column={col} sortField={sortField} sortDir={sortDir} onSort={onSort} />
        ))}
      </div>
      {/* One persistent body node across pending -> settled. */}
      <div className={`flex-1 overflow-y-auto scrollbar-none${settle && !pending ? ` ${ARRIVE}` : ""}`}>
        {pending && <PatternRowsGhost columns={columns} />}
        <AnimatePresence mode="popLayout">
          {patterns.map((pattern, i) => (
            <KnowledgePatternRow key={pattern.id} pattern={pattern} index={i} isSelected={selectedPattern?.id === pattern.id} onSelect={onSelect} />
          ))}
        </AnimatePresence>
        {!pending && patterns.length === 0 && (
          <div className="flex items-center justify-center py-12 text-base text-muted-dark">
            {t.knowledgePage.noPatterns}
          </div>
        )}
      </div>
    </div>
  );
}

const GHOST_ROWS = 8;

/**
 * Cold-load ghost for the table body: KnowledgePatternRow's exact geometry
 * (45px rows: py-2.5 around the h-6 type chip, plus the bottom border) in the
 * real column widths, delayed by `dash-ghost` so a warm load never sees it.
 */
function PatternRowsGhost({ columns }: { columns: ColumnDef[] }) {
  return (
    <div aria-hidden className="dash-ghost">
      {Array.from({ length: GHOST_ROWS }, (_, i) => (
        <div key={i} className="flex h-[45px] items-center border-b border-glass">
          {columns.map((col) => (
            <div key={col.key} className={`${col.width} px-2`}>
              <div className={`h-3 rounded bg-glass ${col.key === "knowledgeType" ? "mx-auto w-6" : "w-3/4"}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
