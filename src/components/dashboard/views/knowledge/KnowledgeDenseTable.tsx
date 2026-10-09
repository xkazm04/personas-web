"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import { type KnowledgePattern } from "@/lib/mock-dashboard-data";
import { buildKnowledgeColumns } from "./knowledge-dense-table/buildKnowledgeColumns";
import { KnowledgeDenseTopBar } from "./knowledge-dense-table/KnowledgeDenseTopBar";
import { KnowledgePatternDetailPanel } from "./knowledge-dense-table/KnowledgePatternDetailPanel";
import { KnowledgePatternTable } from "./knowledge-dense-table/KnowledgePatternTable";
import { knowledgeSuccessRate } from "./knowledge-dense-table/knowledgeDenseFormat";
import type { KnowledgeType, SortDir, SortField } from "./knowledge-dense-table/knowledgeDenseTypes";

/**
 * Dense-table tab (the default). T1: the stats/type-pill top bar and the table
 * frame with its column headers (cascade 0-1). T2: the stat values and rows,
 * ghosted geometry-true while a cold load is pending. No T3: the table is the
 * view's answer, and the detail panel is a user-triggered response.
 */
export default function KnowledgeDenseTable({
  patterns: allPatterns,
  pending = false,
  settle = false,
}: {
  patterns: KnowledgePattern[];
  pending?: boolean;
  settle?: boolean;
}) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("confidence");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilters, setTypeFilters] = useState<Set<KnowledgeType>>(new Set());
  const [selectedPattern, setSelectedPattern] = useState<KnowledgePattern | null>(null);

  const toggleTypeFilter = useCallback((type: KnowledgeType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField],
  );

  const stats = useMemo(() => {
    const total = allPatterns.length;
    const safeTotal = Math.max(1, total);
    const avgConfidence = allPatterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / safeTotal;
    const totalSuccess = allPatterns.reduce((sum, pattern) => sum + pattern.successCount, 0);
    const totalFailure = allPatterns.reduce((sum, pattern) => sum + pattern.failureCount, 0);
    const avgCost = allPatterns.reduce((sum, pattern) => sum + pattern.avgCostUsd, 0) / safeTotal;
    return { total, avgConfidence, totalSuccess, totalFailure, avgCost };
  }, [allPatterns]);

  const sortedPatterns = useMemo(() => {
    const patterns = typeFilters.size > 0
      ? allPatterns.filter((pattern) => typeFilters.has(pattern.knowledgeType))
      : [...allPatterns];
    const direction = sortDir === "asc" ? 1 : -1;

    patterns.sort((a, b) => direction * compareKnowledgePatterns(a, b, sortField));
    return patterns;
  }, [allPatterns, sortField, sortDir, typeFilters]);

  const handleSelect = (pattern: KnowledgePattern) => {
    setSelectedPattern((prev) => (prev?.id === pattern.id ? null : pattern));
  };
  const columns = useMemo(() => buildKnowledgeColumns(t.knowledgePage), [t.knowledgePage]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] relative">
      <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--brand-cyan) 4%, transparent), transparent 70%)" }} />
      <div className={ARRIVE} style={arriveAt(0)}>
        <KnowledgeDenseTopBar stats={stats} pending={pending} typeFilters={typeFilters} toggleTypeFilter={toggleTypeFilter} clearTypeFilters={() => setTypeFilters(new Set())} />
      </div>
      <KnowledgePatternTable
        columns={columns}
        patterns={sortedPatterns}
        selectedPattern={selectedPattern}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onSelect={handleSelect}
        pending={pending}
        settle={settle}
      />
      <AnimatePresence>
        {selectedPattern && <KnowledgePatternDetailPanel key={selectedPattern.id} pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />}
      </AnimatePresence>
    </div>
  );
}

function compareKnowledgePatterns(a: KnowledgePattern, b: KnowledgePattern, sortField: SortField) {
  switch (sortField) {
    case "knowledgeType":
      return a.knowledgeType.localeCompare(b.knowledgeType);
    case "patternKey":
      return a.patternKey.localeCompare(b.patternKey);
    case "personaName":
      return a.personaName.localeCompare(b.personaName);
    case "successCount":
      return a.successCount - b.successCount;
    case "failureCount":
      return a.failureCount - b.failureCount;
    case "successRate":
      return knowledgeSuccessRate(a) - knowledgeSuccessRate(b);
    case "avgCostUsd":
      return a.avgCostUsd - b.avgCostUsd;
    case "avgDurationMs":
      return a.avgDurationMs - b.avgDurationMs;
    case "confidence":
      return a.confidence - b.confidence;
    case "lastSeen":
      return new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
    default:
      return 0;
  }
}
