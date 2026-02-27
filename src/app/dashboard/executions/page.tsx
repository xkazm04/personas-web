"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, XCircle, Loader2 } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import DataTable from "@/components/dashboard/DataTable";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDashboardStore } from "@/stores/dashboardStore";
import { usePolling } from "@/hooks/usePolling";
import { useExecutionPolling } from "@/hooks/useExecutionPolling";
import type { GlobalExecution } from "@/lib/types";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatCost(usd: number): string {
  if (usd === 0) return "-";
  return `$${usd.toFixed(4)}`;
}

function ExecutionOutput({ executionId }: { executionId: string }) {
  const { output, status, durationMs, totalCostUsd } =
    useExecutionPolling(executionId);

  return (
    <div className="space-y-3">
      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-dark">
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
      <div className="relative mt-2 max-h-80 overflow-auto rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-4 font-mono text-xs leading-relaxed text-slate-300 shadow-inner">
        {/* Decorative terminal header */}
        <div className="absolute left-0 top-0 flex w-full items-center gap-1.5 bg-white/[0.02] px-3 py-2 border-b border-white/[0.05]">
          <div className="h-2 w-2 rounded-full bg-red-500/80"></div>
          <div className="h-2 w-2 rounded-full bg-amber-500/80"></div>
          <div className="h-2 w-2 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 text-[10px] text-muted-dark">stdout</span>
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
                  <span className="mr-2 text-white/20 select-none">{">"}</span>
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
  const executions = useDashboardStore((s) => s.executions);
  const executionsLoading = useDashboardStore((s) => s.executionsLoading);
  const fetchExecutions = useDashboardStore((s) => s.fetchExecutions);
  const cancelExecution = useDashboardStore((s) => s.cancelExecution);
  const [filter, setFilter] = useState("all");

  // Initial fetch
  useEffect(() => {
    void fetchExecutions();
  }, [fetchExecutions]);

  // Poll while any running
  const hasRunning = useMemo(
    () => executions.some((e) => e.status === "running" || e.status === "queued"),
    [executions],
  );
  usePolling(fetchExecutions, 3_000, hasRunning);

  const filtered = useMemo(() => {
    if (filter === "all") return executions;
    return executions.filter((e) => e.status === filter);
  }, [executions, filter]);

  const counts = useMemo(() => {
    const c = { all: executions.length, running: 0, completed: 0, failed: 0 };
    for (const e of executions) {
      if (e.status === "running" || e.status === "queued") c.running++;
      else if (e.status === "completed") c.completed++;
      else if (e.status === "failed") c.failed++;
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
            <span className="truncate text-sm text-foreground">
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
        className: "w-24 text-right",
        render: (row: GlobalExecution) => (
          <span className="font-mono text-xs text-muted tabular-nums">
            {formatDuration(row.durationMs)}
          </span>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        className: "w-20 text-right",
        render: (row: GlobalExecution) => (
          <span className="font-mono text-xs text-muted tabular-nums">
            {formatCost(row.costUsd)}
          </span>
        ),
      },
      {
        key: "time",
        header: "Started",
        className: "w-24 text-right",
        render: (row: GlobalExecution) => (
          <span className="text-xs text-muted-dark">
            {relativeTime(row.startedAt ?? row.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-10",
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
          <GradientText>Executions</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Monitor agent execution runs in real-time
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between">
        <FilterBar
          options={[
            { key: "all", label: "All", count: counts.all },
            { key: "running", label: "Running", count: counts.running },
            { key: "completed", label: "Completed", count: counts.completed },
            { key: "failed", label: "Failed", count: counts.failed },
          ]}
          active={filter}
          onChange={setFilter}
        />
        {executionsLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
        )}
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(row) => row.id}
          expandable={(row) => <ExecutionOutput executionId={row.id} />}
          emptyState={
            <EmptyState
              icon={Zap}
              title="No executions yet"
              description="Execute an agent to see results here"
            />
          }
        />
      </motion.div>
    </motion.div>
  );
}
