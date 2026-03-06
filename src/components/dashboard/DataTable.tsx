"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  expandable?: (row: T) => React.ReactNode;
  onExpandedChange?: (expandedId: string | null) => void;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  rowClassName?: (row: T) => string;
}

export type { Column };

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  expandable,
  onExpandedChange,
  onRowClick,
  emptyState,
  rowClassName,
}: DataTableProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback(
    (id: string) => {
      setExpandedId((prev) => {
        const next = prev === id ? null : id;
        onExpandedChange?.(next);
        return next;
      });
    },
    [onExpandedChange],
  );

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="flex min-w-[600px] items-center border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          {expandable && <div className="w-8" />}
          {columns.map((col) => (
            <div
              key={col.key}
              className={`text-[11px] font-medium uppercase tracking-wider text-muted-dark ${col.className ?? "flex-1"}`}
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.map((row) => {
          const id = keyExtractor(row);
          const isExpanded = expandedId === id;
          const extraClass = rowClassName?.(row) ?? "";
          return (
            <div key={id} className={`border-b border-white/[0.04] last:border-0 ${extraClass}`}>
              <div
                className={`flex min-w-[600px] items-center px-4 py-3 transition-colors duration-150 ${
                  expandable || onRowClick
                    ? "cursor-pointer hover:bg-white/[0.03]"
                    : ""
                } ${isExpanded ? "bg-white/[0.03]" : ""}`}
                onClick={() => {
                  if (expandable) toggleExpand(id);
                  onRowClick?.(row);
                }}
              >
                {expandable && (
                  <div className="w-8 flex-shrink-0">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-dark transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
                {columns.map((col) => (
                  <div key={col.key} className={col.className ?? "flex-1"}>
                    {col.render(row)}
                  </div>
                ))}
              </div>

              {/* Expanded content */}
              {isExpanded && expandable && (
                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-white/[0.04]"
                  >
                    <div className="px-4 py-4">{expandable(row)}</div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
