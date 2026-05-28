"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Bot, AlertTriangle, ClipboardCheck } from "lucide-react";

import StatBadge from "@/components/dashboard/StatBadge";
import { RecentActivityCard } from "@/app/dashboard/home/home-page/RecentActivityCard";
import { useExecutionStore, useEnrichedExecutions } from "@/stores/executionStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { MOCK_HEALTH_ISSUES } from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function MobileOverviewPage() {
  const { t } = useTranslation();
  const executions = useEnrichedExecutions();
  const personas = usePersonaStore((s) => s.personas);
  const pendingReviewCount = useReviewStore((s) => s.pendingReviewCount);
  const fetchExecutions = useExecutionStore((s) => s.fetchExecutions);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  useEffect(() => {
    void fetchExecutions();
    void fetchReviews();
  }, [fetchExecutions, fetchReviews]);

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

  const recentExecs = useMemo(() => executions.slice(0, 8), [executions]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-5"
    >
      <motion.h1 variants={fadeUp} className="text-2xl font-bold tracking-tight">
        {t.dashboard.overview}
      </motion.h1>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        <StatBadge
          icon={TrendingUp}
          label={t.dashboard.successRate}
          value={`${stats.successRate}%`}
          accent="emerald"
        />
        <StatBadge
          icon={Zap}
          label={t.dashboard.home.vitals.runs}
          value={stats.total}
          accent="cyan"
          pulseOnIncrease
        />
        <StatBadge
          icon={Bot}
          label={t.dashboard.agents}
          value={stats.activeAgents}
          accent="purple"
        />
        <StatBadge
          icon={ClipboardCheck}
          label={t.dashboard.reviews}
          value={pendingReviewCount}
          accent="amber"
          href="/m/reviews"
          pulseOnIncrease
        />
        <div className="col-span-2">
          <StatBadge
            icon={AlertTriangle}
            label={t.dashboard.home.vitals.alerts}
            value={openAlerts}
            accent={openAlerts > 0 ? "rose" : "emerald"}
            href="/m/alerts"
          />
        </div>
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
