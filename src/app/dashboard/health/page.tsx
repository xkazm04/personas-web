"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";

import GradientText from "@/components/GradientText";
import ExecuteToast from "@/app/dashboard/agents/agents-page/ExecuteToast";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { HealthCheckItem } from "@/lib/mock-dashboard-data";
import { DiskUsageBar } from "./health-page/DiskUsageBar";
import { HealthSectionCard } from "./health-page/HealthSectionCard";
import { useSystemHealth } from "./health-page/useSystemHealth";

/**
 * System Health Panel — runtime / services / resources / integrations status
 * cards with status dots, a disk-usage gauge, and illustrative install/
 * configure actions (demo no-ops → toast). Mirrors the desktop overview's
 * System Health Panel; demo-only.
 */
export default function HealthPage() {
  const { t } = useTranslation();
  const labels = t.healthPage;
  const { sections, diskUsage, isLoading } = useSystemHealth();
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const handleAction = (item: HealthCheckItem) => {
    const verb = item.action === "install" ? labels.toast.installed : labels.toast.configured;
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message: `${item.name} ${verb}` }));
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div
        variants={fadeUp}
        data-tour-diagram="dashboard-health"
        className="mb-6 flex items-center gap-3"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{labels.title}</GradientText>
          </h1>
          <p className="text-sm text-muted-dark">{labels.subtitle}</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <motion.div key={section.key} variants={fadeUp}>
              <HealthSectionCard
                section={section}
                onAction={handleAction}
                footer={
                  section.key === "resources" ? (
                    <DiskUsageBar usedGb={diskUsage.usedGb} totalGb={diskUsage.totalGb} />
                  ) : undefined
                }
              />
            </motion.div>
          ))}
        </div>
      )}

      {toast && (
        <ExecuteToast
          key={toast.id}
          status="success"
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </motion.div>
  );
}
