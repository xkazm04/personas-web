"use client";

import { useMemo, useState } from "react";
import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import DataTable from "@/components/dashboard/DataTable";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";

import type { GlobalExecution } from "@/lib/types";

import { ExecutionDetailModal } from "./executions-page/ExecutionDetailModal";
import { ExecutionsEmptyState } from "./executions-page/ExecutionsEmptyState";
import { ExecutionsFilters } from "./executions-page/ExecutionsFilters";
import { LoadMoreExecutions } from "./executions-page/LoadMoreExecutions";
import {
  buildExecutionColumns,
  executionRowClassName,
} from "./executions-page/buildExecutionColumns";
import { useExecutionsList } from "./useExecutionsList";

export default function ExecutionsPage() {
  const { t } = useTranslation();
  const {
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
  const [selected, setSelected] = useState<GlobalExecution | null>(null);

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
                onLoadMore={loadMore}
              />
            )}
          </div>
        )}

        <ExecutionDetailModal execution={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
