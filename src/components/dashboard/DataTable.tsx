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

  const activateRow = useCallback(
    (row: T, id: string) => {
      if (expandable) toggleExpand(id);
      onRowClick?.(row);
    },
    [expandable, toggleExpand, onRowClick],
  );

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-glass bg-white/[0.02]">
      <div className="overflow-x-auto" role="table">
        {/* Header */}
        <div
          role="row"
          className="flex min-w-[600px] items-center border-b border-glass-strong bg-white/[0.08] px-4 py-2.5"
        >
          {expandable && <div role="columnheader" className="w-8" />}
          {columns.map((col) => (
            <div
              key={col.key}
              role="columnheader"
              className={`text-sm font-semibold uppercase tracking-wider text-foreground ${col.className ?? "flex-1"}`}
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
          const isInteractive = Boolean(expandable || onRowClick);
          return (
            <div
              key={id}
              role="row"
              className={`border-b border-glass last:border-0 ${extraClass}`}
            >
              <div
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                aria-expanded={expandable ? isExpanded : undefined}
                onKeyDown={
                  isInteractive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          activateRow(row, id);
                        }
                      }
                    : undefined
                }
                className={`flex min-w-[600px] items-center px-4 py-3 transition-colors duration-150 ${
                  isInteractive
                    ? "cursor-pointer hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-cyan/50"
                    : ""
                } ${isExpanded ? "bg-white/[0.03]" : ""}`}
                onClick={isInteractive ? () => activateRow(row, id) : undefined}
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
              {expandable && (
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="expanded"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-glass"
                    >
                      <div className="px-4 py-4">{expandable(row)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
