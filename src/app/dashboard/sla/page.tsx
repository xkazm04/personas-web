"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

import { SLABreachLog } from "./sla-page/SLABreachLog";
import { SLASummaryGrid } from "./sla-page/SLASummaryGrid";
import { SLATargetGrid } from "./sla-page/SLATargetGrid";
import { useSlaData } from "./useSlaData";

export default function SLAPage() {
  const { t } = useTranslation();
  const [fetchedAt] = useState(() => Date.now());
  const { targets, breaches, loading, error } = useSlaData();

  const { overallCompliance, activeBreachCount } = useMemo(() => {
    const avg =
      targets.reduce((sum, target) => sum + target.timeInSLA, 0) /
      Math.max(1, targets.length);
    const active = targets.filter((target) => target.activeBreach).length;
    return { overallCompliance: avg, activeBreachCount: active };
  }, [targets]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-emerald/25 bg-brand-emerald/10">
          <Activity className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.slaPage.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">{t.slaPage.subtitle}</p>
        </div>
        <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
      </motion.div>

      {error && <DashboardErrorBanner message={error} />}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
          <SkeletonCard className="sm:col-span-3" lines={5} />
        </div>
      ) : (
        <>
          <SLASummaryGrid
            overallCompliance={overallCompliance}
            activeBreachCount={activeBreachCount}
            objectiveCount={targets.length}
            labels={{
              compliance: t.slaPage.compliance,
              activeBreaches: t.slaPage.activeBreaches,
              objectives: t.slaPage.objectives,
            }}
          />
          <SLATargetGrid
            targets={targets}
            labels={{
              metricType: t.slaPage.metricType,
              target: t.slaPage.target,
              current: t.slaPage.current,
              timeInSla: t.slaPage.timeInSla,
              filter: t.slaPage.targetFilter,
            }}
          />
          <SLABreachLog
            breaches={breaches}
            labels={{
              title: t.slaPage.breachLog.title,
              empty: t.slaPage.breachLog.empty,
              all: t.slaPage.breachLog.all,
              duration: t.slaPage.breachLog.duration,
              ongoing: t.slaPage.breachLog.ongoing,
              started: t.slaPage.breachLog.started,
              resolved: t.slaPage.breachLog.resolved,
              otherBreaches: t.slaPage.breachLog.otherBreaches,
              timeToResolve: t.slaPage.breachLog.timeToResolve,
              elapsed: t.slaPage.breachLog.elapsed,
              metricType: t.slaPage.metricType,
              severity: t.slaPage.severity,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
