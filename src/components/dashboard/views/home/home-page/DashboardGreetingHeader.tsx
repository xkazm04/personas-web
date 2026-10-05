"use client";

import { motion } from "framer-motion";

import GradientText from "@/components/GradientText";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { relativeTime } from "@/lib/format";

/**
 * Dashboard home greeting: the time-of-day welcome, fleet-status subtitle, and
 * last-visit line. Fleet vitals now live in the cockpit's Vitals Console, so
 * this header stays a slim title block.
 */
export function DashboardGreetingHeader({
  greeting,
  displayName,
  lastVisitedAt,
}: {
  greeting: string;
  displayName: string;
  lastVisitedAt: number | null;
}) {
  const { t } = useTranslation();
  return (
    <motion.div variants={fadeUp} className="min-w-0">
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
    </motion.div>
  );
}
