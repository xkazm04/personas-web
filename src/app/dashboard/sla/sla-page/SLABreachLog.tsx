import { motion } from "framer-motion";
import { Clock } from "lucide-react";

import { relativeTime } from "@/lib/format";
import { fadeUp } from "@/lib/animations";
import type { SLABreach, SLAMetricType, SLASeverity } from "@/lib/mock-dashboard-data";

import { metricKey, severityPill } from "./slaFormat";

export function SLABreachLog({
  breaches,
  labels,
}: {
  breaches: SLABreach[];
  labels: {
    title: string;
    empty: string;
    duration: string;
    ongoing: string;
    metricType: Record<SLAMetricType, string>;
    severity: Record<SLASeverity, string>;
  };
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-dark" />
        <h2 className="text-base font-semibold text-foreground">
          {labels.title}
        </h2>
      </div>
      {breaches.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-dark">
          {labels.empty}
        </p>
      ) : (
        <div className="space-y-1">
          {breaches.map((breach) => {
            const durationLabel = labels.duration.replace(
              "{n}",
              String(breach.durationMinutes),
            );
            const ongoing = breach.resolvedAt === null;

            return (
              <div
                key={breach.id}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`rounded-full border px-2 py-0.5 text-sm font-medium ${severityPill[breach.severity]}`}
                >
                  {labels.severity[breach.severity]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {breach.summary}
                  </p>
                  <p className="text-sm text-muted-dark">
                    {breach.persona} - {labels.metricType[metricKey(breach.metric)]}{" "}
                    - {relativeTime(breach.startedAt)}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-muted-dark">
                  {durationLabel}
                </span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-sm font-medium ${
                    ongoing
                      ? "border border-rose-500/25 bg-rose-500/10 text-rose-300"
                      : "text-muted-dark"
                  }`}
                >
                  {ongoing ? labels.ongoing : relativeTime(breach.resolvedAt ?? breach.startedAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
