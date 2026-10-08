"use client";

import dynamic from "next/dynamic";
import { Clock } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import Deferred from "@/components/dashboard/arrival/Deferred";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import type { ObservabilityLabels } from "./performanceViewTypes";
import { useLatencyData } from "./useLatencyData";

/** LatencyChart renders a 200px ResponsiveContainer. */
const CHART_HEIGHT = 200;

// T3 body: one named loader for dynamic() and the slot's `preload`; the slot
// owns the wait, so the chunk's `loading` is a held block of the chart height.
const loadLatencyChart = () => import("@/components/dashboard/LatencyChart");
const LatencyChart = dynamic(loadLatencyChart, {
  ssr: false,
  loading: () => <div aria-hidden style={{ height: CHART_HEIGHT }} />,
});

export function PerformanceLatencyCard({ labels }: { labels: ObservabilityLabels }) {
  const { t } = useTranslation();
  const { points } = useLatencyData();
  return (
    <div className={`${ARRIVE} mb-8`} style={arriveAt(4)}>
      <GlowCard accent="amber" variants={fadeUp} className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          {labels.latencyDistribution}
          <span className="ml-auto text-sm text-muted-dark font-normal">{labels.latencyPercentiles}</span>
        </h3>
        {points.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-dark">{t.dashboard.noExecutionsYet}</p>
        ) : (
          <Deferred minHeight={CHART_HEIGHT} order={2} preload={loadLatencyChart}>
            <LatencyChart data={points} />
          </Deferred>
        )}
      </GlowCard>
    </div>
  );
}
