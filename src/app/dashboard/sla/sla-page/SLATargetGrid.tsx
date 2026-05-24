import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { fadeUp } from "@/lib/animations";
import type { SLAMetricType, SLATarget } from "@/lib/mock-dashboard-data";

import { complianceBand, formatTarget, formatValue, metricKey } from "./slaFormat";

export function SLATargetGrid({
  targets,
  labels,
}: {
  targets: SLATarget[];
  labels: {
    metricType: Record<SLAMetricType, string>;
    target: string;
    current: string;
    timeInSla: string;
  };
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {targets.map((target) => {
        const band = complianceBand(target.timeInSLA);

        return (
          <div
            key={target.id}
            className="rounded-2xl border border-glass bg-white/[0.02] p-4"
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: target.personaColor }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {target.persona}
                </p>
                <p className="text-sm text-muted-dark">
                  {labels.metricType[metricKey(target.metric)]}
                </p>
              </div>
              {target.activeBreach ? (
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-dark">{labels.target}</p>
                <p className="tabular-nums font-medium text-foreground">
                  {formatTarget(target)}
                </p>
              </div>
              <div>
                <p className="text-muted-dark">{labels.current}</p>
                <p
                  className={`tabular-nums font-medium ${
                    target.activeBreach ? "text-rose-400" : "text-foreground"
                  }`}
                >
                  {formatValue(target)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-dark">{labels.timeInSla}</span>
                <span className={`tabular-nums font-medium ${band.text}`}>
                  {(target.timeInSLA * 100).toFixed(2)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full ${band.bar}`}
                  style={{ width: `${target.timeInSLA * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
