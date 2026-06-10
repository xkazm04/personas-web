import { Loader2, XCircle } from "lucide-react";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { formatCost, formatDuration, relativeTime } from "@/lib/format";
import type { GlobalExecution } from "@/lib/types";

export function executionRowClassName(row: GlobalExecution): string {
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
}

export function buildExecutionColumns({
  labels,
  cancellingIds,
  onCancel,
}: {
  labels: {
    agent: string;
    status: string;
    duration: string;
    cost: string;
    started: string;
    cancelling: string;
    cancelQueuedRun: string;
    cancel: string;
  };
  cancellingIds: Record<string, boolean>;
  onCancel: (id: string) => void;
}) {
  return [
    {
      key: "persona",
      header: labels.agent,
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
      header: labels.status,
      className: "w-32",
      render: (row: GlobalExecution) => <StatusBadge status={row.status} />,
    },
    {
      key: "duration",
      header: labels.duration,
      className: "w-24 text-right hidden sm:block",
      render: (row: GlobalExecution) => (
        <span className="font-mono text-sm text-muted tabular-nums">
          {formatDuration(row.durationMs)}
        </span>
      ),
    },
    {
      key: "cost",
      header: labels.cost,
      className: "w-20 text-right hidden sm:block",
      render: (row: GlobalExecution) => (
        <span className="font-mono text-sm text-muted tabular-nums">
          {formatCost(row.costUsd)}
        </span>
      ),
    },
    {
      key: "time",
      header: labels.started,
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
      render: (row: GlobalExecution) => {
        if (row.status !== "running" && row.status !== "queued") return null;
        const pending = !!cancellingIds[row.id];
        return (
          <button
            onClick={(event) => {
              event.stopPropagation();
              if (pending) return;
              onCancel(row.id);
            }}
            disabled={pending}
            aria-busy={pending}
            aria-label={
              pending
                ? labels.cancelling
                : row.status === "queued"
                  ? labels.cancelQueuedRun
                  : labels.cancel
            }
            className="rounded-md text-red-400 transition-colors hover:text-red-300 focus-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-red-400"
            title={
              pending
                ? labels.cancelling
                : row.status === "queued"
                  ? labels.cancelQueuedRun
                  : labels.cancel
            }
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
          </button>
        );
      },
    },
  ];
}
