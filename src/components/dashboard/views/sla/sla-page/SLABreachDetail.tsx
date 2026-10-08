import { useRef } from "react";

import RelatedIncidentLinks from "@/components/dashboard/RelatedIncidentLinks";
import { useFocusParam, useScrollIntoViewWhen } from "@/hooks/useFocusParam";
import { DEMO_THREADS, relatedTo } from "@/lib/incidentThreads";
import type { SLABreach } from "@/lib/mock-dashboard-data";

import { formatAbsolute } from "@/lib/slaFormat";

// Expanded view of a single breach. Adds what the collapsed row can't show:
// the full (untruncated) summary, absolute start/resolve timestamps, a
// duration bar scaled against the longest breach currently in view, whether
// this persona is a repeat offender in the current set, and "Related" links to
// the same incident on Observability and Health. A ?focus= deep link rings it
// (a class only, so markup shape never depends on the URL) and scrolls it in.
export function SLABreachDetail({
  breach,
  durationLabel,
  maxDuration,
  samePersonaCount,
  labels,
}: {
  breach: SLABreach;
  durationLabel: string;
  maxDuration: number;
  samePersonaCount: number;
  labels: {
    started: string;
    resolved: string;
    ongoing: string;
    otherBreaches: string;
    timeToResolve: string;
    elapsed: string;
  };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocusParam() === breach.id;
  useScrollIntoViewWhen(ref, focused);
  const ongoing = breach.resolvedAt === null;
  const barPct =
    maxDuration > 0
      ? Math.max(4, (breach.durationMinutes / maxDuration) * 100)
      : 0;

  return (
    <div
      ref={ref}
      className={`border-t border-glass px-2 pb-3 pt-2.5 ${focused ? "rounded-b-lg ring-2 ring-inset ring-brand-cyan/50" : ""}`}
    >
      <p className="text-sm text-foreground">{breach.summary}</p>
      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <div>
          <span className="text-sm text-muted-dark">{labels.started}</span>
          <p className="text-sm font-medium tabular-nums text-foreground">
            {formatAbsolute(breach.startedAt)}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-dark">{labels.resolved}</span>
          <p className="text-sm font-medium tabular-nums text-foreground">
            {ongoing ? labels.ongoing : formatAbsolute(breach.resolvedAt ?? "")}
          </p>
        </div>
      </div>
      <div className="mt-2.5">
        <div className="mb-1 flex justify-between text-sm tabular-nums text-muted-dark">
          <span>{ongoing ? labels.elapsed : labels.timeToResolve}</span>
          <span>{durationLabel}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className={`h-full rounded-full ${ongoing ? "bg-rose-400/70" : "bg-amber-400/70"}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>
      {samePersonaCount > 0 && (
        <p className="mt-2.5 text-sm text-muted-dark">
          {labels.otherBreaches
            .replace("{persona}", breach.persona)
            .replace("{n}", String(samePersonaCount))}
        </p>
      )}
      <RelatedIncidentLinks links={relatedTo(DEMO_THREADS, breach.id)} />
    </div>
  );
}
