"use client";

import { mutate } from "swr";
import GlowCard from "@/components/GlowCard";
import FleetOptimizationCard from "@/components/dashboard/FleetOptimizationCard";
import HealthDigestPanel from "@/components/dashboard/HealthDigestPanel";
import MemoryActionsPanel from "@/components/dashboard/MemoryActionsPanel";
import DrillToRuns from "@/components/dashboard/drill/DrillToRuns";
import { useTranslation } from "@/i18n/useTranslation";
import { MOCK_FLEET_RECOMMENDATION } from "@/lib/mock-dashboard-data";
import { drillOver } from "@/lib/metricDrill";
import type { DailyMetric, HealthIssue } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { RotationOverviewCard } from "../../settings/settings-sections/RotationOverviewCard";
import { ApprovedWorkCard } from "../home-page/ApprovedWorkCard";
import { ExecutionHeatmapCard } from "../home-page/ExecutionHeatmapCard";
import { FleetSessionsStrip } from "../home-page/FleetSessionsStrip";
import { StatusTicker } from "../home-page/StatusTicker";
import { TopPerformersCard } from "../home-page/TopPerformersCard";
import { TrafficErrorsCard } from "../home-page/TrafficErrorsCard";
import { TriagePane } from "../home-page/TriagePane";
import { UpcomingRoutinesCard } from "../home-page/UpcomingRoutinesCard";
import { VaultChangesCard } from "../home-page/VaultChangesCard";
import { CostByDay, HealingIssues, SourcesList } from "./detailParts";
import type { DimensionId, MissionReadings } from "./readings";
import type { SourceState } from "./useMissionReadings";

/**
 * The evidence behind each dimension, built from the dashboard's existing
 * cards. Demo-only cards render nothing for a real tenant (they gate
 * themselves), so a dimension without a synced source shows what it can.
 */
export function DimDetail({
  id,
  readings,
  sources,
  daily,
  issues,
}: {
  id: DimensionId;
  readings: MissionReadings;
  sources: SourceState[];
  daily: DailyMetric[];
  issues: HealthIssue[];
}) {
  const { t } = useTranslation();
  const isDemo = useAuthStore((s) => s.isDemo);
  const outcomes = readings.outcomes;
  // The run total and the spend sum these scoped days of the fleet: in the demo
  // they open the executions behind them (the whole log is served there).
  const drill = isDemo ? drillOver(null, daily) : null;

  switch (id) {
    case "outcomes":
      return (
        <>
          <DrillToRuns drill={drill} className="mb-3" />
          <TrafficErrorsCard
            chartData={daily.map((day) => ({ date: day.date.slice(5), Executions: day.executions, Errors: day.failures }))}
            loadObservability
            loading={outcomes.status === "pending"}
            error={outcomes.status === "failed" ? outcomes.error : null}
            onRetry={() => void mutate("observability:daily")}
            fetchedAt={null}
            labels={{
              title: t.dashboard.trafficErrors,
              last14Days: t.dashboard.last14Days,
              noTrafficYet: t.dashboard.noTrafficYet,
            }}
          />
          <ExecutionHeatmapCard />
        </>
      );
    case "agents":
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          {isDemo && (
            <GlowCard accent="emerald" className="p-5">
              <HealthDigestPanel />
            </GlowCard>
          )}
          <TopPerformersCard />
        </div>
      );
    case "queue":
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <TriagePane />
          {isDemo && (
            <GlowCard accent="purple" className="p-5">
              <MemoryActionsPanel />
            </GlowCard>
          )}
          {isDemo && (
            <div className="lg:col-span-2">
              <ApprovedWorkCard />
            </div>
          )}
        </div>
      );
    case "recovery":
      return (
        <>
          {isDemo && (
            <FleetOptimizationCard recommendation={MOCK_FLEET_RECOMMENDATION} executionCount={daily.reduce((sum, day) => sum + day.executions, 0)} />
          )}
          <HealingIssues issues={issues} />
        </>
      );
    case "spend":
      return (
        <>
          <DrillToRuns drill={drill} className="mb-3" />
          <CostByDay daily={daily} />
        </>
      );
    case "autonomy":
      return (
        <>
          <UpcomingRoutinesCard />
          {isDemo && <FleetSessionsStrip />}
        </>
      );
    case "vault":
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          {isDemo && <VaultChangesCard />}
          <RotationOverviewCard />
        </div>
      );
    case "instruments": {
      const agents = readings.agents.status === "ready" ? readings.agents.value.healthy + readings.agents.value.degraded + readings.agents.value.critical : 0;
      return (
        <>
          <StatusTicker
            successRate={outcomes.status === "ready" ? (outcomes.value.successRate ?? 0) : 0}
            agents={agents}
            loading={outcomes.status === "pending"}
          />
          <SourcesList sources={sources} />
        </>
      );
    }
  }
}
