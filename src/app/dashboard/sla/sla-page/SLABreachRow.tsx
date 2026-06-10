import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { relativeTime } from "@/lib/format";
import type { SLABreach, SLAMetricType, SLASeverity } from "@/lib/mock-dashboard-data";

import { SLABreachDetail } from "./SLABreachDetail";
import { metricKey, severityPill } from "./slaFormat";

export function SLABreachRow({
  breach,
  labels,
  reduce,
  pulse,
  maxDuration,
  samePersonaCount,
  isOpen,
  onToggle,
}: {
  breach: SLABreach;
  labels: {
    duration: string;
    ongoing: string;
    started: string;
    resolved: string;
    otherBreaches: string;
    timeToResolve: string;
    elapsed: string;
    metricType: Record<SLAMetricType, string>;
    severity: Record<SLASeverity, string>;
  };
  reduce: boolean | null;
  pulse: string;
  maxDuration: number;
  samePersonaCount: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const durationLabel = labels.duration.replace(
    "{n}",
    String(breach.durationMinutes),
  );
  const ongoing = breach.resolvedAt === null;

  return (
    <motion.div
      layout={!reduce}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.15 }}
      className="rounded-lg transition-colors hover:bg-white/[0.03]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-2 py-2 text-left"
      >
        <span
          className={`rounded-full border px-2 py-0.5 text-sm font-medium ${severityPill[breach.severity]}`}
        >
          {labels.severity[breach.severity]}
        </span>
        <div className="min-w-0">
          <p
            className="truncate text-sm font-medium text-foreground"
            title={breach.summary}
          >
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
              ? "flex items-center gap-1.5 border border-rose-500/25 bg-rose-500/10 text-rose-300"
              : "text-muted-dark"
          }`}
        >
          {ongoing ? (
            <>
              <span className={`h-1.5 w-1.5 rounded-full bg-rose-400 ${pulse}`} />
              {labels.ongoing}
            </>
          ) : (
            relativeTime(breach.resolvedAt ?? breach.startedAt)
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-dark transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <SLABreachDetail
              breach={breach}
              durationLabel={durationLabel}
              maxDuration={maxDuration}
              samePersonaCount={samePersonaCount}
              labels={{
                started: labels.started,
                resolved: labels.resolved,
                ongoing: labels.ongoing,
                otherBreaches: labels.otherBreaches,
                timeToResolve: labels.timeToResolve,
                elapsed: labels.elapsed,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
