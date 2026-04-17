"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import DataTable from "@/components/dashboard/DataTable";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import EmptyState from "@/components/dashboard/EmptyState";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePolling } from "@/hooks/usePolling";
import { useExecutionPolling } from "@/hooks/useExecutionPolling";
import type { GlobalExecution } from "@/lib/types";
import { relativeTime, formatDuration, formatCost } from "@/lib/format";

const INITIAL_VISIBLE_EXECUTIONS = 200;
const EXECUTIONS_LOAD_STEP = 200;

function ExecutionOutput({ executionId }: { executionId: string }) {
  const { output, status, durationMs, totalCostUsd } =
    useExecutionPolling(executionId);

  return (
    <div className="space-y-3">
      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-dark">
        <span>
          Status: <StatusBadge status={status} />
        </span>
        {durationMs !== undefined && (
          <span>Duration: {formatDuration(durationMs)}</span>
        )}
        {totalCostUsd !== undefined && (
          <span>Cost: {formatCost(totalCostUsd)}</span>
        )}
      </div>

      {/* Output stream */}
      <div className="relative mt-2 max-h-80 overflow-auto rounded-xl border border-white/[0.08] bg-background p-4 font-mono text-sm leading-relaxed text-slate-300 shadow-inner">
        {/* Decorative terminal header */}
        <div className="absolute left-0 top-0 flex w-full items-center gap-1.5 bg-white/[0.02] px-3 py-2 border-b border-white/[0.05]">
          <div className="h-2 w-2 rounded-full bg-red-500/80"></div>
          <div className="h-2 w-2 rounded-full bg-amber-500/80"></div>
          <div className="h-2 w-2 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 text-sm text-muted-dark">stdout</span>
        </div>
        <div className="mt-6">
          {output.length === 0 ? (
            <span className="text-muted-dark flex items-center gap-2">
              {status === "queued" ? "Waiting for worker..." : "No output yet"}
              {status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-cyan"></span>}
            </span>
          ) : (
            <div className="space-y-1">
              {output.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all text-emerald-400/90">
                  <span className="mr-2 text-white/60 select-none">{">"}</span>
                  {line}
                </div>
              ))}
              {status === "running" && (
                <div className="animate-pulse text-brand-cyan/80">_</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExecutionsPage() {
  const executions = useEnrichedExecutions();
  const executionsLoading = useExecutionStore((s) => s.executionsLoading);
  const executionsError = useExecutionStore((s) => s.executionsError);
  const fetchExecutions = useExecutionStore((s) => s.fetchExecutions);
  const cancelExecution = useExecutionStore((s) => s.cancelExecution);
  const [filter, setFilter] = useState("all");
  const [expandedExecutionId, setExpandedExecutionId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_EXECUTIONS);

  // Initial fetch
  useEffect(() => {
    void fetchExecutions();
  }, [fetchExecutions]);

  // Poll while any running
  const hasRunning = useMemo(
    () => executions.some((e) => e.status === "running" || e.status === "queued"),
    [executions],
  );
  usePolling(fetchExecutions, 3_000, hasRunning && !expandedExecutionId);

  const filtered = useMemo(() => {
    if (filter === "all") return executions;
    if (filter === "running") return executions.filter((e) => e.status === "running" || e.status === "queued");
    return executions.filter((e) => e.status === filter);
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
    const c = { all: executions.length, running: 0, completed: 0, failed: 0, cancelled: 0 };
    for (const e of executions) {
      if (e.status === "running" || e.status === "queued") c.running++;
      else if (e.status === "completed") c.completed++;
      else if (e.status === "failed") c.failed++;
      else if (e.status === "cancelled") c.cancelled++;
    }
    return c;
  }, [executions]);

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await cancelExecution(id);
      } catch {
        // TODO: toast
      }
    },
    [cancelExecution],
  );

  const columns = useMemo(
    () => [
      {
        key: "persona",
        header: "Agent",
        className: "w-48",
        render: (row: GlobalExecution) => (
          <div className="flex items-center gap-2">
            <PersonaAvatar
              icon={row.personaIcon}
              color={row.personaColor}
              name={row.personaName}
            />
            <span className="truncate text-base text-foreground">
              {row.personaName ?? row.personaId.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        render: (row: GlobalExecution) => <StatusBadge status={row.status} />,
      },
      {
        key: "duration",
        header: "Duration",
        className: "w-24 text-right hidden sm:block",
        render: (row: GlobalExecution) => (
          <span className="font-mono text-sm text-muted tabular-nums">
            {formatDuration(row.durationMs)}
          </span>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        className: "w-20 text-right hidden sm:block",
        render: (row: GlobalExecution) => (
          <span className="font-mono text-sm text-muted tabular-nums">
            {formatCost(row.costUsd)}
          </span>
        ),
      },
      {
        key: "time",
        header: "Started",
        className: "w-24 text-right",
        render: (row: GlobalExecution) => (
          <span className="text-sm text-muted-dark">
            {relativeTime(row.startedAt ?? row.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-14 text-right",
        render: (row: GlobalExecution) =>
          row.status === "running" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleCancel(row.id);
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Cancel"
            >
              <XCircle className="h-4 w-4" />
            </button>
          ) : null,
      },
    ],
    [handleCancel],
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">Executions</GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          Monitor agent execution runs in real-time
        </p>
      </motion.div>

      {executionsError && (
        <motion.div
          variants={fadeUp}
          className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-base text-amber-300">
            Failed to refresh executions — showing last known data.{" "}
            <span className="text-amber-300/60">{executionsError}</span>
          </p>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          options={[
            { key: "all", label: "All", count: counts.all },
            { key: "running", label: "Active", count: counts.running },
            { key: "completed", label: "Completed", count: counts.completed },
            { key: "failed", label: "Failed", count: counts.failed },
            { key: "cancelled", label: "Cancelled", count: counts.cancelled },
          ]}
          active={filter}
          onChange={handleFilterChange}
        />
        {executionsLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
        )}
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={visibleExecutions}
          keyExtractor={(row) => row.id}
          expandable={(row) => <ExecutionOutput executionId={row.id} />}
          onExpandedChange={setExpandedExecutionId}
          rowClassName={(row) => {
            switch (row.status) {
              case "running":
              case "queued":
                return "border-l-2 border-l-blue-400/40";
              case "completed":
                return "border-l-2 border-l-emerald-400/40";
              case "failed":
                return "border-l-2 border-l-red-400/40 bg-red-500/[0.02]";
              case "cancelled":
                return "border-l-2 border-l-amber-400/40";
              default:
                return "";
            }
          }}
          emptyState={
            <EmptyState
              icon={Zap}
              title="No executions yet"
              description="Execute an agent to see results here"
            />
          }
        />

        {filtered.length > visibleExecutions.length && (
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setVisibleCount((prev) =>
                  Math.min(filtered.length, prev + EXECUTIONS_LOAD_STEP),
                );
              }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/[0.14] hover:text-foreground"
            >
              Load more executions ({visibleExecutions.length}/{filtered.length})
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
