import dynamic from "next/dynamic";
import { Clock } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import { fadeUp } from "@/lib/animations";
import { MOCK_LATENCY_DATA } from "@/lib/mock-dashboard-data";
import type { ObservabilityLabels } from "./performanceViewTypes";

const LatencyChart = dynamic(() => import("@/components/dashboard/LatencyChart"), { ssr: false });

export function PerformanceLatencyCard({ labels }: { labels: ObservabilityLabels }) {
  return (
    <div className="mb-8">
      <GlowCard accent="amber" variants={fadeUp} className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          {labels.latencyDistribution}
          <span className="ml-auto text-sm text-muted-dark font-normal">{labels.latencyPercentiles}</span>
        </h3>
        <LatencyChart data={MOCK_LATENCY_DATA} />
      </GlowCard>
    </div>
  );
}
