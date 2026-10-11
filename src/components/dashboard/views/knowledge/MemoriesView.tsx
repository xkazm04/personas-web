"use client";

import { useMemo, useState } from "react";

import BatchReviewModal, {
  type BatchDecision,
} from "@/components/dashboard/BatchReviewModal";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import { type MemoryItem } from "@/lib/mock-dashboard-data";

import { MemoriesToolbar } from "./memories-view/MemoriesToolbar";
import { MemoriesTimeline } from "./memories-view/MemoriesTimeline";
import { MemoryCard } from "./memories-view/MemoryCard";
import { TYPES, type FilterKey } from "./memories-view/memoryViewConfig";

const DAY_MS = 86_400_000;

/**
 * Memories tab. T1: the filter toolbar (cascade 0). T2: the count line and
 * the card list (cascade 1-2). A cold load holds an empty reservation for the
 * list (card heights vary with content, so no ghost shape is honest) and
 * omits pill counts rather than showing false zeros. No T3: the batch-review
 * modal is user-triggered.
 */
export default function MemoriesView({
  memories,
  pending = false,
  settle = false,
}: {
  memories: MemoryItem[];
  /** Cold load with nothing held. */
  pending?: boolean;
  /** Content landing after a cold load takes the T2 entrance (once). */
  settle?: boolean;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [modalOpen, setModalOpen] = useState(false);
  // Replay position; null = everything learned (the default, so nothing is
  // hidden until the operator scrubs).
  const [replayDay, setReplayDay] = useState<number | null>(null);

  // Day 1 is the earliest acceptedAt in the data (not the wall clock), so the
  // replay is stable across visits.
  const timeline = useMemo(() => {
    const stamps = memories
      .map((memory) => Date.parse(memory.acceptedAt))
      .filter((ms) => Number.isFinite(ms));
    if (stamps.length === 0) return null;
    const start = Math.min(...stamps);
    const totalDays = Math.floor((Math.max(...stamps) - start) / DAY_MS) + 1;
    return totalDays > 1 ? { start, totalDays } : null;
  }, [memories]);
  const day = timeline ? Math.min(replayDay ?? timeline.totalDays, timeline.totalDays) : 0;

  const visibleMemories = useMemo(() => {
    const learnedBy =
      timeline && day < timeline.totalDays
        ? timeline.start + day * DAY_MS
        : Infinity;
    return memories
      .filter((memory) => {
        const ms = Date.parse(memory.acceptedAt);
        return !Number.isFinite(ms) || ms < learnedBy;
      })
      .map((memory) =>
        resolvedIds.has(memory.id) ? { ...memory, hasConflict: false } : memory,
      );
  }, [resolvedIds, memories, timeline, day]);

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
      // Only an "accept" clears the conflict. A "reject" must leave the memory
      // flagged as still-conflicting — clearing it for every decided id (the old
      // behavior) silently discarded the operator's reject choice.
      for (const [id, decision] of Object.entries(decisions)) {
        if (decision === "accept") next.add(id);
      }
      return next;
    });
    setModalOpen(false);
  }

  const filterOptions = useMemo(
    () => [
      {
        key: "all",
        label: t.memoriesPage.filters.all,
        count: pending ? undefined : visibleMemories.length,
      },
      ...TYPES.map((type) => ({
        key: type,
        label: t.memoriesPage.filters[type],
        count: pending ? undefined : visibleMemories.filter((memory) => memory.type === type).length,
      })),
    ],
    [t, visibleMemories, pending],
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
      {timeline && !pending ? (
        <MemoriesTimeline
          day={day}
          totalDays={timeline.totalDays}
          onChange={setReplayDay}
        />
      ) : null}

      <MemoriesToolbar
        filter={filter}
        filterOptions={filterOptions}
        activeConflictCount={activeConflicts.length}
        conflictCountLabel={conflictCountLabel}
        resolveButtonLabel={t.memoriesPage.conflicts.resolveButton}
        onFilterChange={setFilter}
        onResolveConflicts={() => setModalOpen(true)}
      />

      {/* The count line keeps its 20px line box while pending (no false "0"). */}
      <p
        className={`${ARRIVE} mb-4 h-5 text-sm text-muted-dark tabular-nums`}
        style={arriveAt(1)}
      >
        {pending ? null : totalLabel}
      </p>

      {/* Cascade step 2 (T1 slot); the inner node is the persistent T2 body
          that takes the entrance on the cold loading -> settled edge. */}
      <div className={ARRIVE} style={arriveAt(2)}>
        <div className={settle && !pending ? ARRIVE : undefined}>
          {pending ? (
            // Held empty reservation: about three cards (120px intrinsic each).
            <div aria-hidden className="min-h-[376px]" />
          ) : filtered.length === 0 ? (
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
        </div>
      </div>

      <BatchReviewModal
        open={modalOpen}
        conflicts={activeConflicts}
        onClose={() => setModalOpen(false)}
        onApply={handleApply}
      />
    </div>
  );
}
