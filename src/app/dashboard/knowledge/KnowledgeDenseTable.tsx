"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { MOCK_KNOWLEDGE_PATTERNS, type KnowledgePattern } from "@/lib/mock-dashboard-data";
import { buildKnowledgeColumns } from "./knowledge-dense-table/buildKnowledgeColumns";
import { KnowledgeDenseTopBar } from "./knowledge-dense-table/KnowledgeDenseTopBar";
import { KnowledgePatternDetailPanel } from "./knowledge-dense-table/KnowledgePatternDetailPanel";
import { KnowledgePatternTable } from "./knowledge-dense-table/KnowledgePatternTable";
import { knowledgeSuccessRate } from "./knowledge-dense-table/knowledgeDenseFormat";
import type { KnowledgeType, SortDir, SortField } from "./knowledge-dense-table/knowledgeDenseTypes";

export default function KnowledgeDenseTable() {
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
    const total = MOCK_KNOWLEDGE_PATTERNS.length;
    const avgConfidence = MOCK_KNOWLEDGE_PATTERNS.reduce((sum, pattern) => sum + pattern.confidence, 0) / total;
    const totalSuccess = MOCK_KNOWLEDGE_PATTERNS.reduce((sum, pattern) => sum + pattern.successCount, 0);
    const totalFailure = MOCK_KNOWLEDGE_PATTERNS.reduce((sum, pattern) => sum + pattern.failureCount, 0);
    const avgCost = MOCK_KNOWLEDGE_PATTERNS.reduce((sum, pattern) => sum + pattern.avgCostUsd, 0) / total;
    return { total, avgConfidence, totalSuccess, totalFailure, avgCost };
  }, []);

  const sortedPatterns = useMemo(() => {
    const patterns = typeFilters.size > 0
      ? MOCK_KNOWLEDGE_PATTERNS.filter((pattern) => typeFilters.has(pattern.knowledgeType))
      : [...MOCK_KNOWLEDGE_PATTERNS];
    const direction = sortDir === "asc" ? 1 : -1;

    patterns.sort((a, b) => direction * compareKnowledgePatterns(a, b, sortField));
    return patterns;
  }, [sortField, sortDir, typeFilters]);

  const handleSelect = (pattern: KnowledgePattern) => {
    setSelectedPattern((prev) => (prev?.id === pattern.id ? null : pattern));
  };
  const columns = useMemo(() => buildKnowledgeColumns(t.knowledgePage), [t.knowledgePage]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col h-[calc(100vh-10rem)] relative">
      <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--brand-cyan) 4%, transparent), transparent 70%)" }} />
      <motion.div variants={fadeUp}>
        <KnowledgeDenseTopBar stats={stats} typeFilters={typeFilters} toggleTypeFilter={toggleTypeFilter} clearTypeFilters={() => setTypeFilters(new Set())} />
      </motion.div>
      <KnowledgePatternTable
        columns={columns}
        patterns={sortedPatterns}
        selectedPattern={selectedPattern}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onSelect={handleSelect}
      />
      <AnimatePresence>
        {selectedPattern && <KnowledgePatternDetailPanel key={selectedPattern.id} pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />}
      </AnimatePresence>
    </motion.div>
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
