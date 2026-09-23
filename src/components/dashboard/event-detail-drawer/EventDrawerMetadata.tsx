"use client";

import { Clock, Timer } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export function EventDrawerMetadata({
  timestamp,
  durationMs,
  labels,
}: {
  timestamp: string;
  durationMs: number;
  labels: { timestamp: string; duration: string };
}) {
  const { t } = useTranslation();
  const speed =
    durationMs < 500
      ? t.eventsPage.durationFast
      : durationMs < 2000
        ? t.eventsPage.durationNormal
        : t.eventsPage.durationSlow;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-dark">
          <Clock className="h-3 w-3" />
          {labels.timestamp}
        </div>
        <p className="mt-1 text-sm font-mono text-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
        <p className="text-sm text-muted-dark">
          {new Date(timestamp).toLocaleDateString()}
        </p>
      </div>

      <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-dark">
          <Timer className="h-3 w-3" />
          {labels.duration}
        </div>
        <p className="mt-1 text-sm font-mono text-foreground">
          {t.eventsPage.durationMs.replace("{n}", durationMs.toLocaleString())}
        </p>
        <p className="text-sm text-muted-dark">{speed}</p>
      </div>
    </div>
  );
}
