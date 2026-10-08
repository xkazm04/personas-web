import dynamic from "next/dynamic";
import { LineChart, TrendingUp } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";

/** Shared by dynamic() and the home view's <Deferred preload>: one chunk, fetched once. */
export const loadTrafficChart = () => import("@/components/dashboard/TrafficChart");

const TrafficChart = dynamic(loadTrafficChart, {
  ssr: false,
  loading: () => <TrafficChartReservation />,
});

/** The chart's own height, held empty while its chunk or data is in flight (no spinner placeholder). */
function TrafficChartReservation() {
  return <div aria-busy="true" className="h-[200px] sm:h-[280px] lg:h-[320px]" />;
}

export function TrafficErrorsCard({
  chartData,
  loadObservability,
  loading,
  error,
  onRetry,
  fetchedAt,
  labels,
}: {
  chartData: { date: string; Executions: number; Errors: number }[];
  loadObservability: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fetchedAt: number | null;
  labels: { title: string; last14Days: string; noTrafficYet: string };
}) {
  const hasTraffic = chartData.some((d) => d.Executions > 0 || d.Errors > 0);

  return (
    <GlowCard accent="purple" className="p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-purple" />
          <h2 className="text-base font-semibold text-foreground">
            {labels.title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-dark">{labels.last14Days}</span>
          <StalenessIndicator fetchedAt={fetchedAt} />
        </div>
      </div>

      {/* The reservation covers both the pre-trigger window and the in-flight
          fetch — previously the empty state flashed (and, on failure, stuck)
          while data was still loading. The empty state now means "resolved,
          truly empty". */}
      {!loadObservability || loading ? (
        <TrafficChartReservation />
      ) : error ? (
        <DashboardErrorBanner message={error} onRetry={onRetry} />
      ) : hasTraffic ? (
        <TrafficChart chartData={chartData} />
      ) : (
        <EmptyState icon={LineChart} title={labels.noTrafficYet} />
      )}
    </GlowCard>
  );
}
