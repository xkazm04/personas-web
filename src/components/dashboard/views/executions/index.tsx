"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import DataTable from "@/components/dashboard/DataTable";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { usePolling } from "@/hooks/usePolling";
import { useTranslation } from "@/i18n/useTranslation";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";

import type { GlobalExecution } from "@/lib/types";

import { ExecutionDetailModal } from "./executions-page/ExecutionDetailModal";
import { ExecutionsEmptyState } from "./executions-page/ExecutionsEmptyState";
import { ExecutionsFilters } from "./executions-page/ExecutionsFilters";
import { LoadMoreExecutions } from "./executions-page/LoadMoreExecutions";
import {
  buildExecutionColumns,
  executionRowClassName,
} from "./executions-page/buildExecutionColumns";

const INITIAL_VISIBLE_EXECUTIONS = 200;
const EXECUTIONS_LOAD_STEP = 200;

export default function ExecutionsPage() {
  const { t } = useTranslation();
  const executions = useEnrichedExecutions();
  const executionsLoading = useExecutionStore((state) => state.executionsLoading);
  const executionsError = useExecutionStore((state) => state.executionsError);
  const fetchExecutions = useExecutionStore((state) => state.fetchExecutions);
  const cancelExecution = useExecutionStore((state) => state.cancelExecution);
  const cancellingIds = useExecutionStore((state) => state.cancellingIds);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_EXECUTIONS);
  const [selected, setSelected] = useState<GlobalExecution | null>(null);
  // Until this mount's first fetch settles, an empty list means "not here
  // yet", not "no runs" (set from the promise, never synchronously).
  const [firstFetchSettled, setFirstFetchSettled] = useState(false);

  useEffect(() => {
    let live = true;
    void fetchExecutions().finally(() => {
      if (live) setFirstFetchSettled(true);
    });
    return () => {
      live = false;
    };
  }, [fetchExecutions]);

  const hasRunning = useMemo(
    () => executions.some((execution) => execution.status === "running" || execution.status === "queued"),
    [executions],
  );
  usePolling(fetchExecutions, 3_000, hasRunning);

  const filtered = useMemo(() => {
    if (filter === "all") return executions;
    if (filter === "running") {
      return executions.filter(
        (execution) => execution.status === "running" || execution.status === "queued",
      );
    }
    return executions.filter((execution) => execution.status === filter);
  }, [executions, filter]);

  const visibleExecutions = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
    setVisibleCount(INITIAL_VISIBLE_EXECUTIONS);
  }, []);

  const counts = useMemo(() => {
    const next = { all: executions.length, running: 0, completed: 0, failed: 0, cancelled: 0 };
    for (const execution of executions) {
      if (execution.status === "running" || execution.status === "queued") next.running++;
      else if (execution.status === "completed") next.completed++;
      else if (execution.status === "failed") next.failed++;
      else if (execution.status === "cancelled") next.cancelled++;
    }
    return next;
  }, [executions]);

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await cancelExecution(id);
      } catch {
        // Error is surfaced via executionsError banner.
      }
    },
    [cancelExecution],
  );

  const columns = useMemo(
    () =>
      buildExecutionColumns({
        labels: {
          agent: t.executionsPage.agent,
          status: t.common.status,
          duration: t.executionsPage.duration,
          cost: t.executionsPage.cost,
          started: t.executionsPage.started,
          cancelling: t.dashboardUi.cancelling,
          cancelQueuedRun: t.dashboardUi.cancelQueuedRun,
          cancel: t.common.cancel,
        },
        cancellingIds,
        onCancel: (id) => void handleCancel(id),
      }),
    [handleCancel, cancellingIds, t],
  );

  // A status filter is active and the dataset is non-empty, yet nothing
  // matches — distinguish "filtered out" from a genuinely idle system.
  const isFilteredEmpty =
    filter !== "all" && executions.length > 0 && filtered.length === 0;
  // First load with nothing held (a warm store skips it); errors fall through.
  const awaitingFirstData = !firstFetchSettled && executions.length === 0 && !executionsError;

  return (
    <div>
      {/* T0: the view header paints with the frame and never animates. */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.executionsPage.title}</GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.observabilityPage.subtitle}
        </p>
      </div>

      {executionsError && <DashboardErrorBanner message={executionsError} />}

      {/* T1: the status filter toolbar. */}
      <div className={ARRIVE} style={arriveAt(0)}>
        <ExecutionsFilters
          filter={filter}
          counts={counts}
          loading={executionsLoading}
          labels={{
            all: t.executionsPage.all,
            active: t.executionsPage.active,
            completed: t.executionsPage.completed,
            failed: t.executionsPage.failed,
            cancelled: t.executionsPage.cancelled,
          }}
          onChange={handleFilterChange}
        />
      </div>

      <div data-tour-diagram="dashboard-executions">
        {awaitingFirstData ? (
          // T2 reservation: the table's first screenful, held empty (no ghost,
          // no spinner) until the first fetch settles.
          <div aria-busy="true" className="min-h-[28rem]" />
        ) : (
          // T2: rows keyed by execution id; mounted on the loading -> settled
          // edge, so the entrance plays once there.
          <div className={ARRIVE} style={arriveAt(1)}>
            <DataTable
              columns={columns}
              data={visibleExecutions}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => setSelected(row)}
              rowClassName={executionRowClassName}
              emptyState={
                <ExecutionsEmptyState
                  isFilteredEmpty={isFilteredEmpty}
                  filter={filter}
                  labels={t.executionsPage}
                  onShowAll={() => handleFilterChange("all")}
                />
              }
            />

            {filtered.length > visibleExecutions.length && (
              <LoadMoreExecutions
                label={t.dashboardUi.loadMoreExecutions}
                visible={visibleExecutions.length}
                total={filtered.length}
                onLoadMore={() =>
                  setVisibleCount((prev) => Math.min(filtered.length, prev + EXECUTIONS_LOAD_STEP))
                }
              />
            )}
          </div>
        )}

        <ExecutionDetailModal execution={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
