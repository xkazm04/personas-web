import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";

import FilterBar from "@/components/dashboard/FilterBar";
import { relativeTime } from "@/lib/format";
import { fadeUp } from "@/lib/animations";
import type { SLABreach, SLAMetricType, SLASeverity } from "@/lib/mock-dashboard-data";

import { SLABreachDetail } from "./SLABreachDetail";
import { metricKey, severityPill } from "./slaFormat";

type SeverityFilter = "all" | SLASeverity;
const SEVERITY_ORDER: SLASeverity[] = ["critical", "major", "minor"];

export function SLABreachLog({
  breaches,
  labels,
}: {
  breaches: SLABreach[];
  labels: {
    title: string;
    empty: string;
    all: string;
    duration: string;
    ongoing: string;
    started: string;
    resolved: string;
    metricType: Record<SLAMetricType, string>;
    severity: Record<SLASeverity, string>;
  };
}) {
  const reduce = useReducedMotion();
  const pulse = reduce ? "" : "animate-pulse";
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const tally: Record<SeverityFilter, number> = {
      all: breaches.length,
      critical: 0,
      major: 0,
      minor: 0,
    };
    for (const breach of breaches) tally[breach.severity] += 1;
    return tally;
  }, [breaches]);

  const filtered =
    filter === "all"
      ? breaches
      : breaches.filter((breach) => breach.severity === filter);

  const maxDuration = filtered.reduce(
    (max, breach) => Math.max(max, breach.durationMinutes),
    0,
  );

  const filterOptions = [
    { key: "all", label: labels.all, count: counts.all },
    ...SEVERITY_ORDER.map((severity) => ({
      key: severity,
      label: labels.severity[severity],
      count: counts[severity],
    })),
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-4"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Clock className="h-4 w-4 text-muted-dark" />
        <h2 className="text-base font-semibold text-foreground">
          {labels.title}
        </h2>
        {breaches.length > 0 && (
          <div className="ml-auto">
            <FilterBar
              options={filterOptions}
              active={filter}
              onChange={(key) => setFilter(key as SeverityFilter)}
              compact
            />
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-dark">
          {labels.empty}
        </p>
      ) : (
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filtered.map((breach) => {
              const durationLabel = labels.duration.replace(
                "{n}",
                String(breach.durationMinutes),
              );
              const ongoing = breach.resolvedAt === null;
              const isOpen = openId === breach.id;

              return (
                <motion.div
                  key={breach.id}
                  layout={!reduce}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.15 }}
                  className="rounded-lg transition-colors hover:bg-white/[0.03]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : breach.id)}
                    aria-expanded={isOpen}
                    className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-2 py-2 text-left"
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
                          labels={{
                            started: labels.started,
                            resolved: labels.resolved,
                            ongoing: labels.ongoing,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
