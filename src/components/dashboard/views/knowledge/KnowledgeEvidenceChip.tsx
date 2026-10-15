import { History } from "lucide-react";

import { ExecutionLink } from "@/components/dashboard/ExecutionLink";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Evidence link for a knowledge item: the execution that taught a pattern or
 * that a memory was promoted from. It opens that exact run's detail (Back
 * returns here). Renders nothing when no id was synced, so the UI never
 * implies provenance it does not have.
 */
export function KnowledgeEvidenceChip({ executionId }: { executionId?: string | null }) {
  const { t } = useTranslation();
  if (!executionId) return null;
  return (
    <ExecutionLink
      executionId={executionId}
      className="inline-flex items-center gap-1 rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm text-muted-dark transition-colors hover:text-foreground focus-ring focus-visible:ring-offset-0"
    >
      <History className="h-3 w-3" aria-hidden />
      <span>{t.dashboard.executions}</span>
      <span className="font-mono tabular-nums">{executionId.slice(0, 8)}</span>
    </ExecutionLink>
  );
}
