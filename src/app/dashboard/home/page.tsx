"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

import FleetOptimizationCard from "@/components/dashboard/FleetOptimizationCard";
import LazyMount from "@/components/LazyMount";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_FLEET_RECOMMENDATION,
  MOCK_GLOBAL_EXECUTIONS,
} from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";

import { DashboardGreetingHeader } from "./home-page/DashboardGreetingHeader";
import { InstrumentsBay } from "./home-page/InstrumentsBay";
import { RecentActivityCard } from "./home-page/RecentActivityCard";
import { StatusTicker } from "./home-page/StatusTicker";
import { TriagePane } from "./home-page/TriagePane";
import { VitalsConsole } from "./home-page/VitalsConsole";
import { useDeferredObservability } from "./home-page/useDeferredObservability";
import { useGreeting } from "./home-page/useGreeting";
import { useLastVisit } from "./home-page/useLastVisit";

/**
 * Mission Control — the dashboard home, restructured to mirror the desktop
 * overview's mission-control IA: a top fleet recommendation, a 3-column cockpit
 * (Triage / Vitals Console / Activity Stream), a live status ticker, then the
 * below-fold Instruments Bay (deferred via LazyMount).
 */
export default function DashboardHomePage() {
  const { t } = useTranslation();
  const { user, isDemo } = useAuthStore(
    useShallow((state) => ({ user: state.user, isDemo: state.isDemo })),
  );
  const personas = usePersonaStore((state) => state.personas);
  const executions = useEnrichedExecutions();
  const pendingReviewCount = useReviewStore((state) => state.pendingReviewCount);
  const health = useSystemStore((state) => state.health);
  const fetchExecutions = useExecutionStore((state) => state.fetchExecutions);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);

  // Deferred below-the-fold observability fetch (loading/error/retry surfaced
  // to the Traffic & Errors chart).
  const {
    instrumentsRef,
    loadObservability,
    dailyMetrics,
    observabilityLoading,
    observabilityError: observabilityErrorMsg,
    retryObservability,
    fetchedAt: observabilityFetchedAt,
  } = useDeferredObservability();

  useEffect(() => {
    void fetchExecutions();
    void fetchReviews();
  }, [fetchExecutions, fetchReviews]);

  const greeting = useGreeting(t.dashboard.greeting);
  const lastVisitedAt = useLastVisit();
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? t.dashboard.greetingFallback;

  const recentExecs = useMemo(() => executions.slice(0, 12), [executions]);
  const stats = useMemo(() => {
    const total = executions.length;
    const completed = executions.filter((execution) => execution.status === "completed").length;
    const running = executions.filter(
      (execution) => execution.status === "running" || execution.status === "queued",
    ).length;
    return {
      total,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      running,
      activeAgents: personas.filter((persona) => persona.enabled).length,
    };
  }, [executions, personas]);

  const chartData = useMemo(
    () =>
      dailyMetrics.map((metric) => ({
        date: metric.date.slice(5),
        Executions: metric.executions,
        Errors: metric.failures,
      })),
    [dailyMetrics],
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start justify-between gap-4">
        <DashboardGreetingHeader
          greeting={greeting}
          displayName={displayName}
          lastVisitedAt={lastVisitedAt}
        />
        <TourLauncher tourId="dashboard" />
      </motion.div>

      {/* Fleet optimization is a heuristic recommendation with no synced
          source — demo only; real mode omits it entirely. */}
      {isDemo && (
        <motion.div variants={fadeUp} data-tour-diagram="dashboard-fleet" className="mb-6">
          <FleetOptimizationCard
            recommendation={MOCK_FLEET_RECOMMENDATION}
            executionCount={Math.max(stats.total, MOCK_GLOBAL_EXECUTIONS)}
          />
        </motion.div>
      )}

      {/* Cockpit: Triage · Vitals · Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp}>
          <TriagePane />
        </motion.div>
        <motion.div variants={fadeUp} data-tour-diagram="dashboard-vitals">
          <VitalsConsole
            successRate={stats.successRate}
            runs={stats.total}
            agents={stats.activeAgents}
            reviews={pendingReviewCount}
          />
        </motion.div>
        <motion.div variants={fadeUp} data-tour-diagram="dashboard-activity">
          <RecentActivityCard
            executions={recentExecs}
            runningCount={stats.running}
            labels={{
              title: t.dashboard.recentActivity,
              running: t.dashboard.running,
              noExecutionsYet: t.dashboard.noExecutionsYet,
              executeToSee: t.dashboard.executeToSee,
            }}
          />
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mt-6">
        <StatusTicker successRate={stats.successRate} agents={stats.activeAgents} />
      </motion.div>

      {/* Below the fold: deferred instruments bay (charts, heatmap, panels). */}
      <div ref={instrumentsRef} className="mt-6">
        <LazyMount minHeight={720} label={t.dashboard.home.cockpit.instrumentsTitle}>
          <InstrumentsBay
            chartData={chartData}
            loadObservability={loadObservability}
            observabilityLoading={observabilityLoading}
            observabilityError={observabilityErrorMsg}
            onRetryObservability={() => void retryObservability()}
            fetchedAt={observabilityFetchedAt}
            personasCount={personas.length}
            workersTotal={health?.workers.total ?? 0}
          />
        </LazyMount>
      </div>
    </motion.div>
  );
}
