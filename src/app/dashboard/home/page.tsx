"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import FleetOptimizationCard from "@/components/dashboard/FleetOptimizationCard";
import LazyMount from "@/components/LazyMount";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_FLEET_EXECUTIONS,
  MOCK_FLEET_RECOMMENDATION,
} from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";

import { ApprovedWorkCard } from "./home-page/ApprovedWorkCard";
import { DashboardGreetingHeader } from "./home-page/DashboardGreetingHeader";
import { FleetSessionsStrip } from "./home-page/FleetSessionsStrip";
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
  const executionsLoading = useExecutionStore((state) => state.executionsLoading);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);

  // `executionsLoading` only flips true once the effect below has run, so on
  // the very first paint it is false while the list is still empty. This latch
  // covers that window: without it the cockpit paints a rose 0% ring, an empty
  // activity stream and a "0%" ticker tick before the first mock response
  // (~300ms) lands, then jumps. Cleared once the initial fetches settle.
  const [awaitingFirstLoad, setAwaitingFirstLoad] = useState(true);
  const cockpitLoading = awaitingFirstLoad || executionsLoading;

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
    let cancelled = false;
    void Promise.allSettled([fetchExecutions(), fetchReviews()]).then(() => {
      if (!cancelled) setAwaitingFirstLoad(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchExecutions, fetchReviews]);

  const greeting = useGreeting(t.dashboard.greeting);
  const lastVisitedAt = useLastVisit();
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? t.dashboard.greetingFallback;

  const recentExecs = useMemo(() => executions.slice(0, 12), [executions]);
  const stats = useMemo(() => {
    const total = executions.length;
    const completed = executions.filter((execution) => execution.status === "completed").length;
    const failed = executions.filter((execution) => execution.status === "failed").length;
    const running = executions.filter(
      (execution) => execution.status === "running" || execution.status === "queued",
    ).length;
    // Success rate is completed ÷ FINISHED runs. Dividing by every loaded run
    // counted still-running, queued and cancelled executions as failures, which
    // scored a healthy fleet at 43% (amber) while the sparkline underneath and
    // the observability page both reported ~89%.
    const terminal = completed + failed;
    return {
      total,
      successRate: terminal > 0 ? Math.round((completed / terminal) * 100) : 0,
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
            executionCount={Math.max(stats.total, MOCK_FLEET_EXECUTIONS)}
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
            loading={cockpitLoading}
          />
        </motion.div>
        <motion.div variants={fadeUp} data-tour-diagram="dashboard-activity">
          <RecentActivityCard
            executions={recentExecs}
            runningCount={stats.running}
            loading={cockpitLoading}
            labels={{
              title: t.dashboard.recentActivity,
              running: t.dashboard.running,
              noExecutionsYet: t.dashboard.noExecutionsYet,
              executeToSee: t.dashboard.executeToSee,
            }}
          />
        </motion.div>
      </div>

      {/* Current-era Mission Control: fleet session ledger + approved-work
          reconciliation. Pure fixtures with no synced source — demo only,
          like the fleet recommendation above. */}
      {isDemo && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <FleetSessionsStrip />
          </motion.div>
          <motion.div variants={fadeUp}>
            <ApprovedWorkCard />
          </motion.div>
        </div>
      )}

      <motion.div variants={fadeUp} className="mt-6">
        <StatusTicker
          successRate={stats.successRate}
          agents={stats.activeAgents}
          loading={cockpitLoading}
        />
      </motion.div>

      {/* Below the fold: deferred instruments bay (charts, heatmap, panels). */}
      <div ref={instrumentsRef} className="mt-6">
        {/* Reserve the bay's measured height (headless Chromium, demo mode):
            1689px at >=1280px wide — see home-overview.md for the per-section
            breakdown. Below `lg` the grids stack to ~2.7k, which no single
            reserve covers. The old 720 under-reserved by ~1000px. */}
        <LazyMount minHeight={1690} label={t.dashboard.home.cockpit.instrumentsTitle}>
          <InstrumentsBay
            chartData={chartData}
            loadObservability={loadObservability}
            observabilityLoading={observabilityLoading}
            observabilityError={observabilityErrorMsg}
            onRetryObservability={() => void retryObservability()}
            fetchedAt={observabilityFetchedAt}
            personasCount={personas.length}
            executionsCount={stats.total}
            workersTotal={health?.workers.total ?? 0}
          />
        </LazyMount>
      </div>
    </motion.div>
  );
}
