"use client";

import dynamic from "next/dynamic";
import { Clock } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import type { ObservabilityLabels } from "./performanceViewTypes";
import { useLatencyData } from "./useLatencyData";

const LatencyChart = dynamic(() => import("@/components/dashboard/LatencyChart"), { ssr: false });

export function PerformanceLatencyCard({ labels }: { labels: ObservabilityLabels }) {
  const { t } = useTranslation();
  const { points } = useLatencyData();
  return (
    <div className="mb-8">
      <GlowCard accent="amber" variants={fadeUp} className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          {labels.latencyDistribution}
          <span className="ml-auto text-sm text-muted-dark font-normal">{labels.latencyPercentiles}</span>
        </h3>
        {points.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-dark">{t.dashboard.noExecutionsYet}</p>
        ) : (
          <LatencyChart data={points} />
        )}
      </GlowCard>
    </div>
  );
}
