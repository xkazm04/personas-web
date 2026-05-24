"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import GradientText from "@/components/GradientText";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
} from "@/lib/mock-dashboard-data";

import { SLABreachLog } from "./sla-page/SLABreachLog";
import { SLASummaryGrid } from "./sla-page/SLASummaryGrid";
import { SLATargetGrid } from "./sla-page/SLATargetGrid";

export default function SLAPage() {
  const { t } = useTranslation();
  const [fetchedAt] = useState(() => Date.now());

  const { overallCompliance, activeBreachCount } = useMemo(() => {
    const avg =
      MOCK_SLA_TARGETS.reduce((sum, target) => sum + target.timeInSLA, 0) /
      Math.max(1, MOCK_SLA_TARGETS.length);
    const active = MOCK_SLA_TARGETS.filter((target) => target.activeBreach).length;
    return { overallCompliance: avg, activeBreachCount: active };
  }, []);

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

      <SLASummaryGrid
        overallCompliance={overallCompliance}
        activeBreachCount={activeBreachCount}
        objectiveCount={MOCK_SLA_TARGETS.length}
        labels={{
          compliance: t.slaPage.compliance,
          activeBreaches: t.slaPage.activeBreaches,
          objectives: t.slaPage.objectives,
        }}
      />
      <SLATargetGrid
        targets={MOCK_SLA_TARGETS}
        labels={{
          metricType: t.slaPage.metricType,
          target: t.slaPage.target,
          current: t.slaPage.current,
          timeInSla: t.slaPage.timeInSla,
        }}
      />
      <SLABreachLog
        breaches={MOCK_SLA_BREACHES}
        labels={{
          title: t.slaPage.breachLog.title,
          empty: t.slaPage.breachLog.empty,
          duration: t.slaPage.breachLog.duration,
          ongoing: t.slaPage.breachLog.ongoing,
          metricType: t.slaPage.metricType,
          severity: t.slaPage.severity,
        }}
      />
    </motion.div>
  );
}
