import { Clock } from "lucide-react";

import { ExecutionLink } from "@/components/dashboard/ExecutionLink";

/** The run a review is about: its id opens that run's detail in Executions (Back returns). */
export function ReviewExecutionRow({ executionId, label }: { executionId: string; label: string }) {
  return (
    <div className="rounded-lg border border-glass bg-white/[0.02] p-2.5">
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-muted-dark" />
        <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">{label}</span>
        <ExecutionLink
          executionId={executionId}
          className="ml-auto rounded font-mono text-sm text-brand-cyan hover:underline focus-ring focus-visible:ring-offset-0"
        >
          {executionId.slice(0, 16)}
        </ExecutionLink>
      </div>
    </div>
  );
}
