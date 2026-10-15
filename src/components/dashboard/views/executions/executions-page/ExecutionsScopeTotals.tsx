"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";

/**
 * The scoped list's run count and spend, stated beside the table (demo). The
 * demo serves its whole log, so these are the totals of exactly the runs the
 * scope bar (or a metric's drill-down) chose: a figure opened here reads the
 * same count and the same cents. A real plane serves its newest 50 runs, so
 * there the line would describe a page, not a scope: it is not shown.
 */
export function ExecutionsScopeTotals({ runs, costUsd }: { runs: number; costUsd: number }) {
  const { t } = useTranslation();
  const isDemo = useAuthStore((s) => s.isDemo);
  if (!isDemo) return null;
  const copy = t.executionsPage.drill;
  return (
    <p data-testid="executions-scope-totals" className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-dark">
      <span>
        {copy.scopeRuns}{" "}
        <span data-scope-runs={runs} className="font-medium tabular-nums text-foreground">
          {runs.toLocaleString()}
        </span>
      </span>
      <span>
        {copy.scopeSpend}{" "}
        <span data-scope-spend={costUsd.toFixed(2)} className="font-medium tabular-nums text-foreground">
          ${costUsd.toFixed(2)}
        </span>
      </span>
    </p>
  );
}
