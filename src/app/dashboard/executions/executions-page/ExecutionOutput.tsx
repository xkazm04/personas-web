import StatusBadge from "@/components/dashboard/StatusBadge";
import { useExecutionPolling } from "@/hooks/useExecutionPolling";
import { formatCost, formatDuration } from "@/lib/format";

export function ExecutionOutput({
  executionId,
  labels,
}: {
  executionId: string;
  labels: {
    status: string;
    duration: string;
    cost: string;
    stdout: string;
    waitingForWorker: string;
    noOutputYet: string;
  };
}) {
  const { output, status, durationMs, totalCostUsd } =
    useExecutionPolling(executionId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm text-muted-dark">
        <span>
          {labels.status}: <StatusBadge status={status} />
        </span>
        {durationMs !== undefined && (
          <span>{labels.duration}: {formatDuration(durationMs)}</span>
        )}
        {totalCostUsd !== undefined && (
          <span>{labels.cost}: {formatCost(totalCostUsd)}</span>
        )}
      </div>

      <div className="relative mt-2 max-h-80 overflow-auto rounded-xl border border-glass-hover bg-background p-4 font-mono text-sm leading-relaxed text-slate-300 shadow-inner">
        <div className="absolute left-0 top-0 flex w-full items-center gap-1.5 bg-white/[0.02] px-3 py-2 border-b border-glass">
          <div className="h-2 w-2 rounded-full bg-red-500/80" />
          <div className="h-2 w-2 rounded-full bg-amber-500/80" />
          <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-sm text-muted-dark">{labels.stdout}</span>
        </div>
        <div className="mt-6">
          {output.length === 0 ? (
            <span className="text-muted-dark flex items-center gap-2">
              {status === "queued" ? labels.waitingForWorker : labels.noOutputYet}
              {status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-cyan" />}
            </span>
          ) : (
            <div className="space-y-1">
              {output.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap break-all text-emerald-400/90">
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
