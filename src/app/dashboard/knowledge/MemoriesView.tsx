"use client";

import { useMemo, useState } from "react";

import BatchReviewModal, {
  type BatchDecision,
} from "@/components/dashboard/BatchReviewModal";
import { useTranslation } from "@/i18n/useTranslation";
import {
  MOCK_MEMORIES,
} from "@/lib/mock-dashboard-data";

import { MemoriesToolbar } from "./memories-view/MemoriesToolbar";
import { MemoryCard } from "./memories-view/MemoryCard";
import { TYPES, type FilterKey } from "./memories-view/memoryViewConfig";

export default function MemoriesView() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [modalOpen, setModalOpen] = useState(false);

  const visibleMemories = useMemo(
    () =>
      MOCK_MEMORIES.map((memory) =>
        resolvedIds.has(memory.id) ? { ...memory, hasConflict: false } : memory,
      ),
    [resolvedIds],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? visibleMemories
        : visibleMemories.filter((memory) => memory.type === filter),
    [filter, visibleMemories],
  );

  const activeConflicts = useMemo(
    () => visibleMemories.filter((memory) => memory.hasConflict),
    [visibleMemories],
  );

  function handleApply(decisions: Record<string, BatchDecision>) {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      for (const id of Object.keys(decisions)) next.add(id);
      return next;
    });
    setModalOpen(false);
  }

  const filterOptions = useMemo(
    () => [
      {
        key: "all",
        label: t.memoriesPage.filters.all,
        count: MOCK_MEMORIES.length,
      },
      ...TYPES.map((type) => ({
        key: type,
        label: t.memoriesPage.filters[type],
        count: MOCK_MEMORIES.filter((memory) => memory.type === type).length,
      })),
    ],
    [t],
  );

  const conflictCountLabel = t.memoriesPage.conflicts.count.replace(
    "{n}",
    String(activeConflicts.length),
  );
  const totalLabel = t.memoriesPage.totalCount.replace(
    "{n}",
    String(filtered.length),
  );

  return (
    <div>
      <MemoriesToolbar
        filter={filter}
        filterOptions={filterOptions}
        activeConflictCount={activeConflicts.length}
        conflictCountLabel={conflictCountLabel}
        resolveButtonLabel={t.memoriesPage.conflicts.resolveButton}
        onFilterChange={setFilter}
        onResolveConflicts={() => setModalOpen(true)}
      />

      <p className="mb-4 text-sm text-muted-dark tabular-nums">{totalLabel}</p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-dark">
          {t.memoriesPage.empty}
        </p>
      ) : (
        <div className="max-h-[calc(100vh-320px)] space-y-2 overflow-y-auto pr-2">
          {filtered.map((item) => (
            <MemoryCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <BatchReviewModal
        open={modalOpen}
        conflicts={activeConflicts}
        onClose={() => setModalOpen(false)}
        onApply={handleApply}
      />
    </div>
  );
}
