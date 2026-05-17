"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import GradientText from "@/components/GradientText";
import FleetOptimizationCard from "@/components/dashboard/FleetOptimizationCard";
import { useTranslation } from "@/i18n/useTranslation";
import { api } from "@/lib/api";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_FLEET_RECOMMENDATION,
  MOCK_GLOBAL_EXECUTIONS,
  MOCK_UNREAD_MESSAGES,
} from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";
import useSWR from "swr";

import { DashboardQuickLinks } from "./home-page/DashboardQuickLinks";
import { DashboardIntelligencePanels } from "./home-page/DashboardIntelligencePanels";
import { DashboardStatsBadges } from "./home-page/DashboardStatsBadges";
import { RecentActivityCard } from "./home-page/RecentActivityCard";
import { TrafficErrorsCard } from "./home-page/TrafficErrorsCard";

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

  // Lazy init keeps new Date() out of the render path (React 19 purity).
  // The hourly tick lets the greeting cross noon/6pm boundaries without a
  // page reload — a user who opens at 11:50am sees "Good Afternoon" at 12:00.
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const interval = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const greeting =
    hour < 12
      ? t.dashboard.greeting.morning
      : hour < 18
        ? t.dashboard.greeting.afternoon
        : t.dashboard.greeting.evening;

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
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">
            {greeting}, {displayName}
          </GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.dashboard.agentsStatus}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-8 flex flex-wrap gap-3">
        <DashboardStatsBadges
          labels={t.dashboard}
          stats={stats}
          pendingReviewCount={pendingReviewCount}
          unreadMessages={MOCK_UNREAD_MESSAGES}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6">
        <FleetOptimizationCard
          recommendation={MOCK_FLEET_RECOMMENDATION}
          executionCount={Math.max(stats.total, MOCK_GLOBAL_EXECUTIONS)}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6 grid gap-6 lg:grid-cols-2">
        <DashboardIntelligencePanels ready={panelsReady} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
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
            }}
          />
        </motion.div>
      </div>

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
