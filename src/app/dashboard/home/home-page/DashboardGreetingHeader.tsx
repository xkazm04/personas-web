"use client";

import { motion } from "framer-motion";

import GradientText from "@/components/GradientText";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { relativeTime } from "@/lib/format";
import { DashboardHeaderStats } from "./DashboardHeaderStats";

/**
 * Dashboard home header: the greeting on the left and the compact fleet-vitals
 * badges on the right (success rate, runs, agents, alerts, reviews).
 */
export function DashboardGreetingHeader({
  greeting,
  displayName,
  lastVisitedAt,
  successRate,
  runs,
  agents,
  reviews,
}: {
  greeting: string;
  displayName: string;
  lastVisitedAt: number | null;
  successRate: number;
  runs: number;
  agents: number;
  reviews: number;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={fadeUp}
      className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">
            {greeting}, {displayName}
          </GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">{t.dashboard.agentsStatus}</p>
        {lastVisitedAt !== null && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-1 text-sm text-muted-dark"
          >
            {t.dashboard.lastSeen} {relativeTime(new Date(lastVisitedAt).toISOString())}
          </motion.p>
        )}
      </div>

      <DashboardHeaderStats
        successRate={successRate}
        runs={runs}
        agents={agents}
        reviews={reviews}
      />
    </motion.div>
  );
}
