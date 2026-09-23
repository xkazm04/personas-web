import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";

import FilterBar from "@/components/dashboard/FilterBar";
import { useFocusParam } from "@/hooks/useFocusParam";
import { fadeUp } from "@/lib/animations";
import { initialBreachLogState } from "@/lib/incidentThreads";
import type { SLABreach, SLAMetricType, SLASeverity } from "@/lib/mock-dashboard-data";

import { SLABreachRow } from "./SLABreachRow";

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
    otherBreaches: string;
    timeToResolve: string;
    elapsed: string;
    metricType: Record<SLAMetricType, string>;
    severity: Record<SLASeverity, string>;
  };
}) {
  const reduce = useReducedMotion();
  const pulse = reduce ? "" : "animate-pulse";
  // A ?focus=<breach id> deep link opens that breach with no filter hiding it.
  // The focus arrives one commit after hydration, so re-seed on change
  // (prev-state pattern) as well as at mount.
  const focusId = useFocusParam();
  const [filter, setFilter] = useState<SeverityFilter>(() => initialBreachLogState(breaches, focusId).filter);
  const [openId, setOpenId] = useState<string | null>(() => initialBreachLogState(breaches, focusId).openId);
  const [seenFocus, setSeenFocus] = useState(focusId);
  if (focusId !== seenFocus) {
    setSeenFocus(focusId);
    const next = initialBreachLogState(breaches, focusId);
    if (next.openId) {
      setFilter(next.filter);
      setOpenId(next.openId);
    }
  }

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
            {filtered.map((breach) => (
              <SLABreachRow
                key={breach.id}
                breach={breach}
                labels={labels}
                reduce={reduce}
                pulse={pulse}
                maxDuration={maxDuration}
                samePersonaCount={
                  filtered.filter(
                    (other) =>
                      other.persona === breach.persona &&
                      other.id !== breach.id,
                  ).length
                }
                isOpen={openId === breach.id}
                onToggle={() =>
                  setOpenId(openId === breach.id ? null : breach.id)
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
