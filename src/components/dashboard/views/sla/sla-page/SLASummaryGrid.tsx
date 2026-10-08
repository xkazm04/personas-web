import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";

import { complianceBand } from "@/lib/slaFormat";

/**
 * T1 tile chrome (border + label) paints with the view; the T2 value either
 * renders at once or, on a cold load with nothing held, holds a delayed,
 * value-sized ghost (`dash-ghost`) in the same 2rem line box, so the value
 * lands without moving anything. `settle` adds the T2 entrance on the
 * loading -> settled edge (the value element is kept, never re-keyed).
 */
export function SLASummaryGrid({
  overallCompliance,
  activeBreachCount,
  objectiveCount,
  pending,
  settle,
  labels,
}: {
  overallCompliance: number;
  activeBreachCount: number;
  objectiveCount: number;
  pending: boolean;
  settle: boolean;
  labels: { compliance: string; activeBreaches: string; objectives: string };
}) {
  const band = complianceBand(overallCompliance);
  const enter = settle && !pending ? ` ${ARRIVE}` : "";
  const ghost = (
    <span aria-hidden className="dash-ghost block h-8 py-1">
      <span className="block h-6 w-20 rounded-md bg-glass" />
    </span>
  );

  return (
    <div
      className={`${ARRIVE} mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3`}
      style={arriveAt(0)}
      aria-busy={pending || undefined}
    >
      <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.compliance}
        </p>
        <p className={`mt-1 text-2xl font-bold tabular-nums ${band.text}${enter}`}>
          {pending ? ghost : `${(overallCompliance * 100).toFixed(2)}%`}
        </p>
      </div>
      <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.activeBreaches}
        </p>
        <p
          className={`mt-1 text-2xl font-bold tabular-nums ${
            activeBreachCount > 0 ? "text-rose-400" : "text-emerald-400"
          }${enter}`}
        >
          {pending ? ghost : activeBreachCount}
        </p>
      </div>
      <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.objectives}
        </p>
        <p className={`mt-1 text-2xl font-bold tabular-nums text-foreground${enter}`}>
          {pending ? ghost : objectiveCount}
        </p>
      </div>
    </div>
  );
}
