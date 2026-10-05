"use client";

import { memo } from "react";
import { Bot, Coins, DollarSign, Gauge, Zap } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import type { AthenaLedgerTotals } from "@/lib/mock-dashboard-data";

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatTile({
  icon: Icon,
  tint,
  label,
  value,
  caption,
}: {
  icon: React.ElementType;
  tint: string;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-dark">
        <Icon className={`h-3.5 w-3.5 ${tint}`} />
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{value}</p>
      {caption && <p className="text-xs tabular-nums text-muted-dark">{caption}</p>}
    </div>
  );
}

/**
 * Athena spend lane — headline totals from the companion's per-turn usage
 * ledger (turns, cost, avg per turn, tokens) plus a single Athena-vs-fleet
 * ratio bar. Desktop parity: the Activity tab's Athena lane summary over the
 * `companion_turn` ledger.
 */
export const AthenaSpendLane = memo(function AthenaSpendLane({
  ledger,
}: {
  ledger: AthenaLedgerTotals;
}) {
  const { t } = useTranslation();
  const lp = t.observabilityPage;
  const avgPerTurn = ledger.turns > 0 ? ledger.costUsd / ledger.turns : 0;
  const share = ledger.fleetCostUsd > 0 ? Math.min(ledger.costUsd / ledger.fleetCostUsd, 1) : 0;

  return (
    <GlowCard accent="purple" className="flex flex-col p-5 lg:col-span-2">
      <div className="mb-4 flex items-center gap-2">
        <Bot className="h-4 w-4 text-purple-400" />
        <h2 className="text-base font-semibold text-foreground">{lp.athenaSpendLane}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={Zap} tint="text-blue-400" label={lp.spendTurns} value={compact(ledger.turns)} />
        <StatTile
          icon={DollarSign}
          tint="text-purple-400"
          label={lp.spendCost}
          value={`$${ledger.costUsd.toFixed(2)}`}
        />
        <StatTile
          icon={Gauge}
          tint="text-amber-400"
          label={lp.spendAvgPerTurn}
          value={`$${avgPerTurn.toFixed(3)}`}
        />
        <StatTile
          icon={Coins}
          tint="text-brand-cyan"
          label={lp.spendTokens}
          value={compact(ledger.inputTokens + ledger.outputTokens)}
          caption={lp.spendTokensDetail
            .replace("{in}", compact(ledger.inputTokens))
            .replace("{out}", compact(ledger.outputTokens))}
        />
      </div>

      <div className="mt-auto pt-4">
        <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-dark">{lp.athenaVsFleet}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-purple-400/70"
            style={{ width: `${Math.max(share * 100, 2)}%` }}
          />
        </div>
        <p className="mt-1.5 text-sm text-muted-dark">
          {lp.athenaVsFleetCaption
            .replace("{athena}", `$${ledger.costUsd.toFixed(2)}`)
            .replace("{total}", `$${ledger.fleetCostUsd.toFixed(2)}`)}
        </p>
      </div>
    </GlowCard>
  );
});
