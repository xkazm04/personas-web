import { AnimatePresence, motion } from "framer-motion";
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
}: {
  columns: ColumnDef[];
  patterns: KnowledgePattern[];
  selectedPattern: KnowledgePattern | null;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onSelect: (pattern: KnowledgePattern) => void;
}) {
  const { t } = useTranslation();

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="flex-1 min-h-0 flex flex-col rounded-xl border border-glass overflow-hidden bg-white/[0.01] dot-grid">
      <div className="flex items-center border-b border-glass bg-white/[0.02] shrink-0">
        {columns.map((col) => (
          <KnowledgeSortHeader key={col.key} column={col} sortField={sortField} sortDir={sortDir} onSort={onSort} />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <AnimatePresence mode="popLayout">
          {patterns.map((pattern, i) => (
            <KnowledgePatternRow key={pattern.id} pattern={pattern} index={i} isSelected={selectedPattern?.id === pattern.id} onSelect={onSelect} />
          ))}
        </AnimatePresence>
        {patterns.length === 0 && (
          <div className="flex items-center justify-center py-12 text-base text-muted-dark">
            {t.knowledgePage.noPatterns}
          </div>
        )}
      </div>
    </motion.div>
  );
}
