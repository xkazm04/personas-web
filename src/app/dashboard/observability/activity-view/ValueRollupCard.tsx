"use client";

import { ArrowDownRight, ArrowUpRight, Target } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { trendColor } from "@/components/dashboard/trendColor";
import { useTranslation } from "@/i18n/useTranslation";
import type { ValueRollup } from "@/lib/mock-dashboard-data";

const OUTCOME_TONE = {
  delivered: { bar: "bg-emerald-400", dot: "bg-emerald-400" },
  partial: { bar: "bg-amber-400", dot: "bg-amber-400" },
  blocked: { bar: "bg-rose-400", dot: "bg-rose-400" },
} as const;

function Delta({ value, goodDirection, format }: { value: number; goodDirection: "up" | "down"; format: (n: number) => string }) {
  if (Math.abs(value) < 1e-9) return null;
  const rising = value > 0;
  const Icon = rising ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-sm tabular-nums ${trendColor(value, { goodDirection })}`}>
      <Icon className="h-3 w-3" />
      {format(Math.abs(value))}
    </span>
  );
}

/**
 * Value Rollup: the period's value-delivered rate and cost per delivered
 * outcome (with period-over-period deltas when compare is on), plus a stacked
 * outcome bar (delivered / partial / blocked). Mirrors the desktop overview's
 * Value Rollup card.
 */
export function ValueRollupCard({ rollup, compare }: { rollup: ValueRollup; compare: boolean }) {
  const { t } = useTranslation();
  const lp = t.observabilityPage;
  const total = rollup.delivered + rollup.partial + rollup.blocked;
  const rate = total > 0 ? rollup.delivered / total : 0;
  const costPerValue = rollup.delivered > 0 ? rollup.costUsd / rollup.delivered : 0;
  const rateDelta = rate - rollup.prevDeliveredRate; // +pts is better
  const cpvDelta = costPerValue - rollup.prevCostPerValue; // lower cost is better

  const outcomes = [
    { key: "delivered" as const, count: rollup.delivered },
    { key: "partial" as const, count: rollup.partial },
    { key: "blocked" as const, count: rollup.blocked },
  ];

  return (
    <GlowCard accent="emerald" className="flex flex-col p-5 lg:col-span-2">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-400" />
        <h2 className="text-base font-semibold text-foreground">{lp.valueRollup}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-glass bg-white/[0.02] p-3.5">
          <p className="text-sm text-muted-dark">{lp.valueDelivered}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400">{Math.round(rate * 100)}%</p>
          {compare && <Delta value={rateDelta * 100} goodDirection="up" format={(n) => `${n.toFixed(0)} pts`} />}
        </div>
        <div className="rounded-xl border border-glass bg-white/[0.02] p-3.5">
          <p className="text-sm text-muted-dark">{lp.costPerValue}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">${costPerValue.toFixed(3)}</p>
          {compare && <Delta value={cpvDelta} goodDirection="down" format={(n) => `$${n.toFixed(3)}`} />}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          {outcomes.map((o) =>
            o.count > 0 ? (
              <div
                key={o.key}
                className={OUTCOME_TONE[o.key].bar}
                style={{ width: `${(o.count / total) * 100}%` }}
                title={`${lp.outcomes[o.key]}: ${o.count}`}
              />
            ) : null,
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {outcomes.map((o) => (
            <span key={o.key} className="flex items-center gap-1.5 text-muted-dark">
              <span className={`h-2 w-2 rounded-full ${OUTCOME_TONE[o.key].dot}`} />
              {lp.outcomes[o.key]}
              <span className="font-semibold tabular-nums text-foreground">{o.count}</span>
            </span>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}
