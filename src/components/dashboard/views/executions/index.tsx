"use client";

import { useMemo, useState } from "react";
import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import DataTable from "@/components/dashboard/DataTable";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { navigateDashboard } from "@/components/dashboard/spa/navigate";
import { useFocusParam } from "@/hooks/useFocusParam";
import { useTranslation } from "@/i18n/useTranslation";

import { ExecutionDetailModal } from "./executions-page/ExecutionDetailModal";
import { ExecutionsEmptyState } from "./executions-page/ExecutionsEmptyState";
import { ExecutionsFilters } from "./executions-page/ExecutionsFilters";
import { LoadMoreExecutions } from "./executions-page/LoadMoreExecutions";
import {
  buildExecutionColumns,
  executionRowClassName,
} from "./executions-page/buildExecutionColumns";
import { useExecutionsList } from "./useExecutionsList";

/**
 * Closing a focused run's detail takes `?focus=` out of the URL in place, so a
 * reload does not reopen what was dismissed and Back still leaves the view.
 */
function dropFocusParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("focus")) return;
  url.searchParams.delete("focus");
  navigateDashboard(url.pathname + url.search, { replace: true });
}

export default function ExecutionsPage() {
  const { t } = useTranslation();
  const {
    executions,
    executionsLoading,
    executionsError,
    cancellingIds,
    filter,
    filtered,
    visibleExecutions,
    counts,
    handleFilterChange,
    loadMore,
    handleCancel,
    isFilteredEmpty,
    awaitingFirstData,
  } = useExecutionsList();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A `?focus=<id>` link (an evidence chip, a review's run) opens that run's
  // detail. The record comes from the whole loaded list, so neither the status
  // filter nor the page window can hide it, and a filter that would hide its
  // row is cleared (the PerformanceView precedent). The URL losing the focus
  // (Back) closes it. An unknown id resolves to null: no modal.
  const focusId = useFocusParam();
  const [seenFocus, setSeenFocus] = useState<string | null>(null);
  if (focusId !== seenFocus) {
    setSeenFocus(focusId);
    setSelectedId(focusId);
    if (focusId && !filtered.some((execution) => execution.id === focusId)) handleFilterChange("all");
  }
  const selected = selectedId ? (executions.find((execution) => execution.id === selectedId) ?? null) : null;
  const closeDetail = () => {
    setSelectedId(null);
    dropFocusParam();
  };

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
              onRowClick={(row) => setSelectedId(row.id)}
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
                onLoadMore={loadMore}
              />
            )}
          </div>
        )}

        <ExecutionDetailModal execution={selected} onClose={closeDetail} />
      </div>
    </div>
  );
}
