"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import GradientText from "@/components/GradientText";
import DataTable from "@/components/dashboard/DataTable";
import { usePolling } from "@/hooks/usePolling";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";

import type { GlobalExecution } from "@/lib/types";

import { ExecutionDetailModal } from "./executions-page/ExecutionDetailModal";
import { ExecutionsEmptyState } from "./executions-page/ExecutionsEmptyState";
import { ExecutionsFilters } from "./executions-page/ExecutionsFilters";
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

  useEffect(() => {
    void fetchExecutions();
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

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.executionsPage.title}</GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.observabilityPage.subtitle}
        </p>
      </motion.div>

      {executionsError && (
        <motion.div
          variants={fadeUp}
          className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-base text-amber-300">
            {t.waitlist.errorGeneric}{" "}
            <span className="text-amber-300/80">{executionsError}</span>
          </p>
        </motion.div>
      )}

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

      <motion.div variants={fadeUp} data-tour-diagram="dashboard-executions">
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

        <ExecutionDetailModal execution={selected} onClose={() => setSelected(null)} />

        {filtered.length > visibleExecutions.length && (
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setVisibleCount((prev) =>
                  Math.min(filtered.length, prev + EXECUTIONS_LOAD_STEP),
                );
              }}
              className="rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm text-muted transition-colors hover:border-glass-strong hover:text-foreground"
            >
              {t.dashboardUi.loadMoreExecutions
                .replace("{visible}", String(visibleExecutions.length))
                .replace("{total}", String(filtered.length))}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
