"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import FleetOptimizationCard from "@/components/dashboard/FleetOptimizationCard";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import { api } from "@/lib/api";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_FLEET_RECOMMENDATION,
  MOCK_GLOBAL_EXECUTIONS,
} from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";
import useSWR from "swr";

import { DashboardGreetingHeader } from "./home-page/DashboardGreetingHeader";
import { DashboardInstruments } from "./home-page/DashboardInstruments";
import { DashboardQuickLinks } from "./home-page/DashboardQuickLinks";
import { DashboardIntelligencePanels } from "./home-page/DashboardIntelligencePanels";
import { RecentActivityCard } from "./home-page/RecentActivityCard";
import { TrafficErrorsCard } from "./home-page/TrafficErrorsCard";
import { useGreeting } from "./home-page/useGreeting";
import { useLastVisit } from "./home-page/useLastVisit";

export default function DashboardHomePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const personas = usePersonaStore((state) => state.personas);
  const executions = useEnrichedExecutions();
  const pendingReviewCount = useReviewStore((state) => state.pendingReviewCount);
  const health = useSystemStore((state) => state.health);
  const fetchExecutions = useExecutionStore((state) => state.fetchExecutions);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);

  const chartSectionRef = useRef<HTMLDivElement | null>(null);
  const [loadObservability, setLoadObservability] = useState(false);
  const [panelsReady, setPanelsReady] = useState(false);
  const [observabilityFetchedAt, setObservabilityFetchedAt] = useState<number | null>(null);

  const { data: observabilityData } = useSWR(
    loadObservability ? "observability" : null,
    api.getObservability,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
      focusThrottleInterval: 60_000,
      onSuccess: () => setObservabilityFetchedAt(Date.now()),
    },
  );
  const dailyMetrics = useMemo(
    () => observabilityData?.dailyMetrics ?? [],
    [observabilityData],
  );

  useEffect(() => {
    const target = chartSectionRef.current;
    if (!target || loadObservability) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadObservability(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadObservability]);

  useEffect(() => {
    void fetchExecutions();
    void fetchReviews();
  }, [fetchExecutions, fetchReviews]);

  useEffect(() => {
    const timer = setTimeout(() => setPanelsReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

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
      <motion.div variants={fadeUp} className="mb-6 flex justify-end">
        <TourLauncher tourId="dashboard" />
      </motion.div>

      <DashboardGreetingHeader
        greeting={greeting}
        displayName={displayName}
        lastVisitedAt={lastVisitedAt}
        successRate={stats.successRate}
        runs={stats.total}
        agents={stats.activeAgents}
        reviews={pendingReviewCount}
      />

      <motion.div variants={fadeUp} data-tour-diagram="dashboard-fleet" className="mb-6">
        <FleetOptimizationCard
          recommendation={MOCK_FLEET_RECOMMENDATION}
          executionCount={Math.max(stats.total, MOCK_GLOBAL_EXECUTIONS)}
        />
      </motion.div>

      <motion.div variants={fadeUp} data-tour-diagram="dashboard-intelligence" className="mb-6 grid gap-6 lg:grid-cols-2">
        <DashboardIntelligencePanels ready={panelsReady} />
      </motion.div>

      <div data-tour-diagram="dashboard-activity" className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={fadeUp} className="lg:col-span-2">
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

        <motion.div variants={fadeUp} className="lg:col-span-3" ref={chartSectionRef}>
          <TrafficErrorsCard
            chartData={chartData}
            loadObservability={loadObservability}
            fetchedAt={observabilityFetchedAt}
            labels={{
              title: t.dashboard.trafficErrors,
              last14Days: t.dashboard.last14Days,
              noTrafficYet: t.dashboard.noTrafficYet,
            }}
          />
        </motion.div>
      </div>

      <DashboardInstruments />

      <motion.div variants={fadeUp} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardQuickLinks
          labels={t.dashboard}
          personasCount={personas.length}
          workersTotal={health?.workers.total ?? 0}
        />
      </motion.div>
    </motion.div>
  );
}
