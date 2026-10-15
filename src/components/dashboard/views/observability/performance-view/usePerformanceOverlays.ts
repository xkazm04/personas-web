"use client";

import { useMemo } from "react";
import useSWR from "swr";

import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { drillOver, type MetricDrill } from "@/lib/metricDrill";
import { getObservabilityWorld } from "@/lib/mockApi";
import { MOCK_PERSONAS } from "@/lib/mockData";
import { detectCostAnomalies, previousSeries } from "@/lib/observabilitySeries";
import type { DailyMetric, PersonaSpend } from "@/lib/types";

/** Slices the spend donut shows before the rest folds into "Other" (demo: 99 agents). */
const PIE_SLICES = 8;
const OTHER_COLOR = "#64748b";
const SYNCED = new Set(MOCK_PERSONAS.map((p) => p.id));

/**
 * What the Performance tab draws on top of the served window. Real mode: the
 * donut as served, no prior period, no anomaly banner, no drill-down (exactly
 * as before). Demo: everything projects from the world's one log
 * (getObservabilityWorld): the Compare overlay, the anomaly days, the
 * annotations, the population the figures cover, and the drill-downs from the
 * window's totals and each synced agent's spend to the runs behind them.
 */
export function usePerformanceOverlays(isDemo: boolean, daily: DailyMetric[], spend: PersonaSpend[]) {
  const { t } = useTranslation();
  const { data: world } = useSWR(isDemo ? "observability:world" : null, getObservabilityWorld, { revalidateOnFocus: false });
  const otherLabel = t.observabilityPage.other;
  const populationTemplate = t.executionsPage.population.fleetWindow;

  return useMemo(() => {
    const prior = isDemo ? (world?.prior ?? []) : [];
    const all = spend.map((p) => ({ name: p.personaName, value: p.totalCost, color: p.personaColor }));
    const rest = isDemo ? all.slice(PIE_SLICES) : [];
    const spendPieData = rest.length
      ? [...all.slice(0, PIE_SLICES), { name: otherLabel, value: rest.reduce((sum, s) => sum + s.value, 0), color: OTHER_COLOR }]
      : all;
    const drill: MetricDrill | null = isDemo ? drillOver(null, daily) : null;
    return {
      costPrevious: prior.length ? previousSeries(daily, prior, "cost") : [],
      execPrevious: prior.length ? previousSeries(daily, prior, "executions") : [],
      // Cost-anomaly detection isn't synced: demo only, over the window the charts plot.
      anomalies: isDemo ? detectCostAnomalies(daily, 2) : [],
      annotations: isDemo ? (world?.annotations ?? []) : [],
      spendPieData,
      drill,
      /** A spend row's drill: the synced agents only (the scope bar can hold them). */
      drillFor: (personaId: string) => (isDemo && SYNCED.has(personaId) ? drillOver(personaId, daily) : null),
      population: isDemo && world ? fillTemplate(populationTemplate, { count: world.agents, days: daily.length }) : null,
      /** Long lists scroll in the demo (99 agents); real mode lists as before. */
      compactSpend: isDemo,
    };
  }, [isDemo, world, daily, spend, otherLabel, populationTemplate]);
}
