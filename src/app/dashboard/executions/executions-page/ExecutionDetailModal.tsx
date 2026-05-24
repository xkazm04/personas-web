"use client";

import { AlertTriangle, Clock, DollarSign, Hash, RotateCw } from "lucide-react";

import { Modal } from "@/components/dashboard/Modal";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useTranslation } from "@/i18n/useTranslation";
import { formatCost, formatDuration, relativeTime } from "@/lib/format";
import type { GlobalExecution } from "@/lib/types";

import { ExecutionOutput } from "./ExecutionOutput";

/**
 * Web counterpart to the desktop sub_activity ExecutionDetailModal. Shows the
 * persona + status, a KPI strip (duration / cost / tokens / retries), the
 * error explanation if the run failed, and the streaming output viewer
 * (reused from the previous expandable row).
 */
export function ExecutionDetailModal({
  execution,
  onClose,
}: {
  execution: GlobalExecution | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const personaName = execution?.personaName ?? "—";
  const startedAt = execution?.startedAt ?? execution?.createdAt ?? null;
  const totalTokens =
    (execution?.inputTokens ?? 0) + (execution?.outputTokens ?? 0);

  return (
    <Modal
      open={execution !== null}
      onClose={onClose}
      ariaLabel={personaName}
      maxWidth="max-w-3xl"
      title={
        execution && (
          <span className="flex flex-wrap items-center gap-3">
            <PersonaAvatar
              icon={execution.personaIcon}
              color={execution.personaColor}
              name={personaName}
              size="sm"
            />
            <span className="min-w-0 truncate">{personaName}</span>
            <StatusBadge status={execution.status} />
          </span>
        )
      }
      subtitle={startedAt ? relativeTime(startedAt) : undefined}
    >
      {execution && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <KpiTile
              icon={Clock}
              label={t.executionsPage.duration}
              value={formatDuration(execution.durationMs)}
            />
            <KpiTile
              icon={DollarSign}
              label={t.executionsPage.cost}
              value={formatCost(execution.costUsd)}
            />
            <KpiTile
              icon={Hash}
              label={t.executionsPage.tokens}
              value={totalTokens.toLocaleString()}
            />
            <KpiTile
              icon={RotateCw}
              label={t.executionsPage.retries}
              value={String(execution.retryCount)}
            />
          </div>

          {execution.errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
              <p className="text-sm leading-relaxed text-rose-200/90">
                {execution.errorMessage}
              </p>
            </div>
          )}

          <ExecutionOutput
            executionId={execution.id}
            labels={{
              status: t.common.status,
              duration: t.executionsPage.duration,
              cost: t.executionsPage.cost,
              stdout: t.dashboardUi.stdout,
              waitingForWorker: t.executionsPage.waitingForWorker,
              noOutputYet: t.executionsPage.noOutputYet,
              jumpToLatest: t.dashboardUi.jumpToLatest,
            }}
          />
        </>
      )}
    </Modal>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-dark">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
