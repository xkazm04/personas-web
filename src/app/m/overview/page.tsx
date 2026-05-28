"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Bot,
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import MobileStatCard from "@/components/mobile/MobileStatCard";
import { RecentActivityCard } from "@/app/dashboard/home/home-page/RecentActivityCard";
import { useGreeting } from "@/app/dashboard/home/home-page/useGreeting";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useAuthStore } from "@/stores/authStore";
import { MOCK_HEALTH_ISSUES } from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function MobileOverviewPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const executions = useEnrichedExecutions();
  const personas = usePersonaStore((s) => s.personas);
  const pendingReviewCount = useReviewStore((s) => s.pendingReviewCount);
  const fetchExecutions = useExecutionStore((s) => s.fetchExecutions);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  useEffect(() => {
    void fetchExecutions();
    void fetchReviews();
  }, [fetchExecutions, fetchReviews]);

  const greeting = useGreeting(t.dashboard.greeting);
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? "";

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

  const openAlerts = useMemo(
    () => MOCK_HEALTH_ISSUES.filter((issue) => issue.status === "open").length,
    [],
  );
  const hasAlerts = openAlerts > 0;
  const recentExecs = useMemo(() => executions.slice(0, 8), [executions]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-5"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-brand-cyan/80">
            {displayName ? `${greeting}, ${displayName}` : greeting}
          </p>
          <h1 className="mt-0.5 text-[26px] font-bold leading-none tracking-tight">
            {t.dashboard.overview}
          </h1>
        </div>
        {stats.running > 0 && (
          <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/[0.08] px-2.5 py-1 text-[13px] font-medium text-cyan-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            {stats.running} {t.dashboard.running}
          </span>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2.5">
        <MobileStatCard
          icon={TrendingUp}
          label={t.dashboard.successRate}
          value={`${stats.successRate}%`}
          accent="emerald"
        />
        <MobileStatCard
          icon={Zap}
          label={t.dashboard.home.vitals.runs}
          value={stats.total}
          accent="cyan"
        />
        <MobileStatCard
          icon={Bot}
          label={t.dashboard.agents}
          value={stats.activeAgents}
          accent="purple"
        />
        <MobileStatCard
          icon={ClipboardCheck}
          label={t.dashboard.reviews}
          value={pendingReviewCount}
          accent="amber"
          href="/m/reviews"
        />
      </motion.div>

      <motion.div variants={fadeUp} whileTap={{ scale: 0.98 }}>
        <Link
          href="/m/alerts"
          className={`focus-ring flex items-center gap-3 rounded-2xl border p-3.5 ${
            hasAlerts
              ? "border-rose-500/25 bg-rose-500/[0.06]"
              : "border-emerald-500/20 bg-emerald-500/[0.05]"
          }`}
        >
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${
              hasAlerts
                ? "bg-rose-500/12 text-rose-300 ring-rose-500/20"
                : "bg-emerald-500/12 text-emerald-300 ring-emerald-500/20"
            }`}
          >
            {hasAlerts ? (
              <AlertTriangle className="h-[18px] w-[18px]" />
            ) : (
              <ShieldCheck className="h-[18px] w-[18px]" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              {hasAlerts
                ? `${openAlerts} ${t.dashboard.home.vitals.alerts}`
                : t.observabilityPage.allSystemsHealthy}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-dark" />
        </Link>
      </motion.div>

      <motion.div variants={fadeUp}>
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
    </motion.div>
  );
}
