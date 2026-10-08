"use client";

import { Coins, Gauge, Star, Users } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { ARRIVE } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import type { DirectorPortfolio } from "@/lib/mock-dashboard-data";

import { scoreTone } from "./directorMeta";

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  valueClass = "text-foreground",
  enter = false,
}: {
  icon: React.ElementType;
  label: string;
  /** `null` while the snapshot is pending: the line box is held, empty or ghosted. */
  value: React.ReactNode;
  hint: React.ReactNode;
  accent: "cyan" | "purple" | "emerald" | "amber";
  valueClass?: string;
  /** T2 entrance on the loading -> settled edge (the same `<p>` is kept). */
  enter?: boolean;
}) {
  const iconTint = {
    cyan: "text-brand-cyan",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  }[accent];
  return (
    <GlowCard accent={accent} className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon className={`h-4 w-4 ${iconTint}`} />
        </div>
        <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">{label}</span>
      </div>
      <p
        className={`h-8 text-2xl font-bold tracking-tight tabular-nums ${valueClass}${enter ? ` ${ARRIVE}` : ""}`}
      >
        {value}
      </p>
      <p className="mt-1 min-h-5 text-sm text-muted-dark">{hint}</p>
    </GlowCard>
  );
}

/**
 * Portfolio scorecard — the Director's four headline KPIs: value-delivered
 * rate, mean latest verdict, cost per value-delivered run, and coaching-scope
 * size. Desktop parity: the Director tab's StatCard row.
 */
export function DirectorKpiGrid({
  portfolio,
  ghost = false,
  settle = false,
}: {
  portfolio: DirectorPortfolio | null;
  /** Cold load with nothing held: draw delayed, value-sized ghosts. */
  ghost?: boolean;
  /** The view mounted without data: values enter when they land. */
  settle?: boolean;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.kpi;

  // T1 chrome (card, icon, label) paints without data; the T2 value and
  // caption hold their line boxes (`h-8` / `h-5`) so arrival moves nothing.
  if (!portfolio) {
    const value = ghost ? (
      <span aria-hidden className="dash-ghost block py-1">
        <span className="block h-6 w-20 rounded-md bg-glass" />
      </span>
    ) : null;
    const hint = ghost ? (
      <span aria-hidden className="dash-ghost block py-1">
        <span className="block h-3 w-32 rounded bg-glass" />
      </span>
    ) : null;
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={Gauge} label={lp.valueRate} value={value} hint={hint} accent="emerald" />
        <KpiTile icon={Star} label={lp.avgVerdict} value={value} hint={hint} accent="purple" />
        <KpiTile icon={Coins} label={lp.costPerValue} value={value} hint={hint} accent="cyan" />
        <KpiTile icon={Users} label={lp.inScope} value={value} hint={hint} accent="amber" />
      </div>
    );
  }

  const valueRate =
    portfolio.assessedExecutions > 0
      ? portfolio.breakdown.delivered / portfolio.assessedExecutions
      : 0;
  const costPerValue =
    portfolio.breakdown.delivered > 0
      ? portfolio.totalCostUsd / portfolio.breakdown.delivered
      : null;
  const avgTone = portfolio.avgScore !== null ? scoreTone(portfolio.avgScore) : null;
  const rateClass =
    valueRate >= 0.6 ? "text-emerald-300" : valueRate >= 0.3 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <KpiTile
        icon={Gauge}
        label={lp.valueRate}
        value={`${Math.round(valueRate * 100)}%`}
        hint={lp.valueRateHint}
        accent="emerald"
        valueClass={rateClass}
        enter={settle}
      />
      <KpiTile
        icon={Star}
        label={lp.avgVerdict}
        value={portfolio.avgScore !== null ? portfolio.avgScore.toFixed(1) : "—"}
        hint={lp.avgVerdictHint}
        accent="purple"
        valueClass={avgTone?.text ?? "text-foreground"}
        enter={settle}
      />
      <KpiTile
        icon={Coins}
        label={lp.costPerValue}
        value={costPerValue !== null ? `$${costPerValue.toFixed(3)}` : "—"}
        hint={lp.costPerValueHint}
        accent="cyan"
        enter={settle}
      />
      <KpiTile
        icon={Users}
        label={lp.inScope}
        value={String(portfolio.inScope)}
        hint={lp.inScopeHint
          .replace("{reviewed}", String(portfolio.reviewed))
          .replace("{unreviewed}", String(portfolio.unreviewed))}
        accent="amber"
        enter={settle}
      />
    </div>
  );
}
