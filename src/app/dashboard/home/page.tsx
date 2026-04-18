"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ClipboardCheck,
  Zap,
  TrendingUp,
  Bot,
  Activity,
  ArrowUpRight,
  Mail,
} from "lucide-react";

const TrafficChart = dynamic(
  () => import("@/components/dashboard/TrafficChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[200px] sm:h-[280px] lg:h-[320px]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-glass-hover border-t-brand-cyan" />
      </div>
    ),
  },
);
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import StatusBadge from "@/components/dashboard/StatusBadge";
import StatBadge from "@/components/dashboard/StatBadge";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import HealthDigestPanel from "@/components/dashboard/HealthDigestPanel";
import MemoryActionsPanel from "@/components/dashboard/MemoryActionsPanel";
import FleetOptimizationCard from "@/components/dashboard/FleetOptimizationCard";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import {
  MOCK_FLEET_RECOMMENDATION,
  MOCK_GLOBAL_EXECUTIONS,
  MOCK_UNREAD_MESSAGES,
} from "@/lib/mock-dashboard-data";
import { usePersonaStore } from "@/stores/personaStore";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";
import { useAuthStore } from "@/stores/authStore";
import useSWR from "swr";
import { api } from "@/lib/api";
import Link from "next/link";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";

export default function DashboardHomePage() {
  const { t } = useTranslation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greeting.morning;
    if (hour < 18) return t.dashboard.greeting.afternoon;
    return t.dashboard.greeting.evening;
  };
  const user = useAuthStore((s) => s.user);
  const personas = usePersonaStore((s) => s.personas);
  const executions = useEnrichedExecutions();
  const pendingReviewCount = useReviewStore((s) => s.pendingReviewCount);
  const health = useSystemStore((s) => s.health);
  const fetchExecutions = useExecutionStore((s) => s.fetchExecutions);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  const chartSectionRef = useRef<HTMLDivElement | null>(null);
  const [loadObservability, setLoadObservability] = useState(false);
  const [panelsReady, setPanelsReady] = useState(false);
  const [observabilityFetchedAt, setObservabilityFetchedAt] = useState<
    number | null
  >(null);

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

  // Simulate brief loading state for intelligence panels
  useEffect(() => {
    const timer = setTimeout(() => setPanelsReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const recentExecs = useMemo(
    () => executions.slice(0, 12),
    [executions],
  );

  const stats = useMemo(() => {
    const total = executions.length;
    const completed = executions.filter((e) => e.status === "completed").length;
    const running = executions.filter(
      (e) => e.status === "running" || e.status === "queued",
    ).length;
    return {
      total,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      running,
      activeAgents: personas.filter((p) => p.enabled).length,
    };
  }, [executions, personas]);

  const chartData = useMemo(
    () =>
      dailyMetrics.map((d) => ({
        date: d.date.slice(5), // MM-DD
        Executions: d.executions,
        Errors: d.failures,
      })),
    [dailyMetrics],
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Greeting */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">
            {getGreeting()}, {displayName}
          </GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.dashboard.agentsStatus}
        </p>
      </motion.div>

      {/* Quick stat badges */}
      <motion.div
        variants={fadeUp}
        className="mb-8 flex flex-wrap gap-3"
      >
        <StatBadge
          icon={ClipboardCheck}
          label={t.dashboard.pendingReviews}
          value={pendingReviewCount}
          accent="amber"
          href="/dashboard/reviews"
        />
        <StatBadge
          icon={Zap}
          label={t.dashboard.totalExecutions}
          value={stats.total}
          accent="cyan"
          href="/dashboard/executions"
        />
        <StatBadge
          icon={TrendingUp}
          label={t.dashboard.successRate}
          value={`${stats.successRate}%`}
          accent="emerald"
          href="/dashboard/observability"
        />
        <StatBadge
          icon={Bot}
          label={t.dashboard.activeAgents}
          value={stats.activeAgents}
          accent="purple"
          href="/dashboard/agents"
        />
        <StatBadge
          icon={Mail}
          label={t.dashboard.unreadMessages}
          value={MOCK_UNREAD_MESSAGES}
          accent="rose"
          href="/dashboard/messages"
        />
      </motion.div>

      {/* Fleet optimization — top recommendation */}
      <motion.div variants={fadeUp} className="mb-6">
        <FleetOptimizationCard
          recommendation={MOCK_FLEET_RECOMMENDATION}
          executionCount={Math.max(stats.total, MOCK_GLOBAL_EXECUTIONS)}
        />
      </motion.div>

      {/* Health Digest + Memory Actions row */}
      <motion.div variants={fadeUp} className="mb-6 grid gap-6 lg:grid-cols-2">
        {panelsReady ? (
          <>
            <GlowCard accent="emerald" className="p-5">
              <HealthDigestPanel />
            </GlowCard>
            <GlowCard accent="purple" className="p-5">
              <MemoryActionsPanel />
            </GlowCard>
          </>
        ) : (
          <>
            <SkeletonCard lines={5} />
            <SkeletonCard lines={4} />
          </>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlowCard accent="cyan" className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-brand-cyan" />
              <h2 className="text-base font-semibold text-foreground">
                {t.dashboard.recentActivity}
              </h2>
              {stats.running > 0 && (
                <span className="ml-auto flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-2 py-0.5 text-sm font-medium text-cyan-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  {stats.running} {t.dashboard.running}
                </span>
              )}
            </div>

            {recentExecs.length === 0 ? (
              <p className="text-sm text-muted-dark py-8 text-center">
                {t.dashboard.noExecutionsYet} {t.dashboard.executeToSee}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {recentExecs.map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.03]"
                  >
                    <PersonaAvatar
                      icon={exec.personaIcon}
                      color={exec.personaColor}
                      name={exec.personaName}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {exec.personaName ?? exec.personaId.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-dark">
                        {relativeTime(exec.startedAt ?? exec.createdAt)}
                        {exec.durationMs && ` · ${(exec.durationMs / 1000).toFixed(1)}s`}
                        {exec.costUsd > 0 && ` · $${exec.costUsd.toFixed(4)}`}
                      </p>
                    </div>
                    <StatusBadge status={exec.status} />
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        </motion.div>

        {/* Traffic & Errors Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-3" ref={chartSectionRef}>
          <GlowCard accent="purple" className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-purple" />
                <h2 className="text-base font-semibold text-foreground">
                  {t.dashboard.trafficErrors}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-dark">{t.dashboard.last14Days}</span>
                <StalenessIndicator fetchedAt={observabilityFetchedAt} />
              </div>
            </div>

            {loadObservability ? (
              <TrafficChart chartData={chartData} />
            ) : (
              <div className="flex items-center justify-center h-[200px] sm:h-[280px] lg:h-[320px]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-glass-hover border-t-brand-cyan" />
              </div>
            )}
          </GlowCard>
        </motion.div>
      </div>

      {/* Quick links row */}
      <motion.div variants={fadeUp} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t.dashboard.agents, desc: `${personas.length} ${t.dashboard.deployed}`, icon: Bot, href: "/dashboard/agents", accent: "cyan" as const },
          { label: t.dashboard.observability, desc: t.dashboard.metricsHealth, icon: Activity, href: "/dashboard/observability", accent: "emerald" as const },
          { label: t.dashboard.usageAnalytics, desc: t.dashboard.toolUtilization, icon: TrendingUp, href: "/dashboard/observability", accent: "purple" as const },
          { label: t.dashboard.settings, desc: `${health?.workers.total ?? 0} ${t.dashboard.workers}`, icon: Activity, href: "/dashboard/settings", accent: "amber" as const },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <GlowCard
              accent={link.accent}
              className="p-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]`}>
                  <link.icon className="h-4 w-4 text-muted" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">
                    {link.label}
                  </p>
                  <p className="text-sm text-muted-dark">{link.desc}</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-dark opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </GlowCard>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
