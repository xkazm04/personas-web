import { useCallback, useEffect, useMemo, useState } from "react";
import { scopeExecutions } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { usePolling } from "@/hooks/usePolling";
import { scopeHidAll } from "@/lib/dashboardScope";
import { runTotals } from "@/lib/metricDrill";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import type { GlobalExecution } from "@/lib/types";

const INITIAL_VISIBLE_EXECUTIONS = 200;
const EXECUTIONS_LOAD_STEP = 200;

const isActive = (execution: GlobalExecution) =>
  execution.status === "running" || execution.status === "queued";

/**
 * Data side of the executions view: the first fetch, polling while a run is
 * active, the scope bar's persona + window, then the status filter, its
 * per-status counts and the paged window.
 */
export function useExecutionsList() {
  const allExecutions = useEnrichedExecutions();
  const scope = useDashboardScope();
  const executions = useMemo(() => scopeExecutions(allExecutions, scope), [allExecutions, scope]);
  const executionsLoading = useExecutionStore((state) => state.executionsLoading);
  const executionsError = useExecutionStore((state) => state.executionsError);
  const fetchExecutions = useExecutionStore((state) => state.fetchExecutions);
  const cancelExecution = useExecutionStore((state) => state.cancelExecution);
  const cancellingIds = useExecutionStore((state) => state.cancellingIds);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_EXECUTIONS);
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

  // Poll for every active run, in scope or not: one out of scope still moves.
  const hasRunning = useMemo(() => allExecutions.some(isActive), [allExecutions]);
  usePolling(fetchExecutions, 3_000, hasRunning);

  const filtered = useMemo(() => {
    if (filter === "all") return executions;
    if (filter === "running") return executions.filter(isActive);
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

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(filtered.length, prev + EXECUTIONS_LOAD_STEP));
  }, [filtered.length]);

  const counts = useMemo(() => {
    const next = { all: executions.length, running: 0, completed: 0, failed: 0, cancelled: 0 };
    for (const execution of executions) {
      if (isActive(execution)) next.running++;
      else if (execution.status === "completed") next.completed++;
      else if (execution.status === "failed") next.failed++;
      else if (execution.status === "cancelled") next.cancelled++;
    }
    return next;
  }, [executions]);

  // What the scoped list adds up to: a metric drilled here reads its own figure back.
  const totals = useMemo(() => runTotals(executions), [executions]);

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

  return {
    /** Every loaded run, whatever the scope, filter or page shows (a focused run is looked up here). */
    allExecutions,
    /** The runs in the scope bar's persona + window. */
    executions,
    /** Their count and summed spend. */
    totals,
    /** The scope emptied a list that has runs: "nothing in this window", not "no runs". */
    scopeEmpty: scopeHidAll(allExecutions, executions),
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
    // A status filter is active and the dataset is non-empty, yet nothing
    // matches — distinguish "filtered out" from a genuinely idle system.
    isFilteredEmpty: filter !== "all" && executions.length > 0 && filtered.length === 0,
    // First load with nothing held (a warm store skips it); errors fall through.
    awaitingFirstData: !firstFetchSettled && allExecutions.length === 0 && !executionsError,
  };
}
