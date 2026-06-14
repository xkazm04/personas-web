"use client";

import { motion } from "framer-motion";

import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";
import { DashboardIntelligencePanels } from "./DashboardIntelligencePanels";
import { DashboardQuickLinks } from "./DashboardQuickLinks";
import { ExecutionHeatmapCard } from "./ExecutionHeatmapCard";
import { TopPerformersCard } from "./TopPerformersCard";
import { TrafficErrorsCard } from "./TrafficErrorsCard";
import { UpcomingRoutinesCard } from "./UpcomingRoutinesCard";
import { VaultChangesCard } from "./VaultChangesCard";

// Self-driven reveal: this region mounts lazily (after the page's one-shot
// stagger has already fired), so inherited variants would stay hidden — each
// section animates itself on scroll-in instead (see SectionWrapper gotcha).
const reveal = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.4, ease: "easeOut" },
} as const;

/**
 * Below-the-fold "Instruments Bay" of the Mission-Control home: analytics
 * inserts + memory actions, the execution heatmap, top performers alongside
 * traffic/errors, then routines & vault and the quick-link rail. Lazy-mounted
 * by the page via LazyMount; observability data is threaded in from the page's
 * deferred fetch.
 */
export function InstrumentsBay({
  chartData,
  loadObservability,
  fetchedAt,
  personasCount,
  workersTotal,
}: {
  chartData: { date: string; Executions: number; Errors: number }[];
  loadObservability: boolean;
  fetchedAt: number | null;
  personasCount: number;
  workersTotal: number;
}) {
  const { t } = useTranslation();
  const isDemo = useAuthStore((s) => s.isDemo);

  return (
    <div className="space-y-6">
      <motion.div {...reveal} data-tour-diagram="dashboard-intelligence" className="grid gap-6 lg:grid-cols-2">
        <DashboardIntelligencePanels ready />
      </motion.div>

      <motion.div {...reveal} data-tour-diagram="dashboard-heatmap">
        <ExecutionHeatmapCard />
      </motion.div>

      <motion.div {...reveal} data-tour-diagram="dashboard-instruments" className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TopPerformersCard />
        </div>
        <div className="lg:col-span-3">
          <TrafficErrorsCard
            chartData={chartData}
            loadObservability={loadObservability}
            fetchedAt={fetchedAt}
            labels={{
              title: t.dashboard.trafficErrors,
              last14Days: t.dashboard.last14Days,
              noTrafficYet: t.dashboard.noTrafficYet,
            }}
          />
        </div>
      </motion.div>

      <motion.div {...reveal} className={`grid gap-6 ${isDemo ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
        <UpcomingRoutinesCard />
        {isDemo && <VaultChangesCard />}
      </motion.div>

      <motion.div {...reveal} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardQuickLinks
          labels={t.dashboard}
          personasCount={personasCount}
          workersTotal={workersTotal}
        />
      </motion.div>
    </div>
  );
}
