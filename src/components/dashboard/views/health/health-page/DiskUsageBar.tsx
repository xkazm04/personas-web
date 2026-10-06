"use client";

import { HardDrive } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Disk-usage gauge for the Resources card: a labeled bar tinted by fill level
 * (emerald < 75% < amber < 90% < rose) with used / free readouts.
 */
export function DiskUsageBar({ usedGb, totalGb }: { usedGb: number; totalGb: number }) {
  const { t } = useTranslation();
  const labels = t.healthPage;
  const pct = totalGb > 0 ? Math.round((usedGb / totalGb) * 100) : 0;
  const tone = pct >= 90 ? "bg-rose-400" : pct >= 75 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-dark">
          <HardDrive className="h-3.5 w-3.5" />
          {labels.diskUsage}
        </span>
        <span className="tabular-nums text-foreground">
          {usedGb} / {totalGb} GB
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-dark">
        <span className="tabular-nums">{pct}% {labels.used}</span>
        <span className="tabular-nums">{totalGb - usedGb} GB {labels.free}</span>
      </div>
    </div>
  );
}
