"use client";

import { ListTree } from "lucide-react";

import { DashLink } from "@/components/dashboard/spa/navigate";
import { useTranslation } from "@/i18n/useTranslation";
import { drillScopeChoice, type MetricDrill } from "@/lib/metricDrill";
import { useDashboardFilterStore } from "@/stores/dashboardFilterStore";

/** Point the dashboard scope at a drill's persona and days (the executions table reads it). */
export function applyDrill(drill: MetricDrill): void {
  const choice = drillScopeChoice(drill);
  const store = useDashboardFilterStore.getState();
  store.setPersonaId(choice.personaId);
  store.setCustomRange(choice.customStart, choice.customEnd);
}

/**
 * "Show these runs": opens Executions scoped to the persona and the days a
 * figure sums (lib/metricDrill.ts), so the table holds exactly the runs behind
 * it. A real `<a>` (copy-link and new tab keep working); a plain click sets
 * the scope, then moves in place. `iconOnly` for a row (the label becomes its
 * accessible name).
 */
export default function DrillToRuns({
  drill,
  iconOnly = false,
  className = "",
}: {
  drill: MetricDrill | null;
  iconOnly?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  if (!drill) return null;
  const label = t.executionsPage.drill.showRuns;
  return (
    <DashLink
      href="/dashboard/executions"
      onClick={() => applyDrill(drill)}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      data-drill={drill.personaId ?? "all"}
      className={`inline-flex items-center gap-1.5 rounded-md text-sm text-muted-dark transition-colors hover:text-foreground focus-ring ${className}`}
    >
      <ListTree aria-hidden className="h-3.5 w-3.5" />
      {!iconOnly && label}
    </DashLink>
  );
}
