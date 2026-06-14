"use client";

import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import {
  ACTIVE_DOT,
  AXIS_TICK,
  CHART_CURSOR_LINE,
  CHART_TOOLTIP_CLASS,
  GRID_STROKE,
  SERIES,
  useChartAnimation,
} from "@/lib/chart-theme";
import type { AthenaUsagePoint } from "@/lib/mock-dashboard-data";

const ACTIONS = [
  { key: "invoke", color: SERIES.cyan },
  { key: "recall", color: SERIES.violet },
  { key: "fallback", color: SERIES.amber },
] as const;

function UsageTooltip({
  active,
  payload,
  label,
  labels,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  labels: { invoke: string; recall: string; fallback: string; previous: string };
}) {
  if (!active || !payload?.length) return null;
  const name: Record<string, string> = {
    invoke: labels.invoke,
    recall: labels.recall,
    fallback: labels.fallback,
    prevTotal: labels.previous,
  };
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {name[entry.dataKey] ?? entry.dataKey}: <span className="font-medium">${entry.value.toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Athena (Companion) usage: a stacked area of daily cost by action — invoke /
 * recall / fallback — with a dashed previous-period total overlaid when compare
 * is on. The web counterpart to the desktop overview's Athena Usage chart.
 */
export const AthenaUsageCard = memo(function AthenaUsageCard({
  data,
  compare,
}: {
  data: AthenaUsagePoint[];
  compare: boolean;
}) {
  const { t } = useTranslation();
  const lp = t.observabilityPage;
  const anim = useChartAnimation();
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.invoke + d.recall + d.fallback, 0),
    [data],
  );

  return (
    <GlowCard accent="purple" className="p-5 lg:col-span-3">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <div>
            <h2 className="text-base font-semibold text-foreground">{lp.athenaUsage}</h2>
            <p className="text-sm text-muted-dark">{lp.athenaSubtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-foreground">${total.toFixed(2)}</p>
          <p className="text-sm text-muted-dark">{lp.last14Days}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {ACTIONS.map((a) => (
              <linearGradient key={a.key} id={`grad-athena-${a.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={a.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={a.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            content={
              <UsageTooltip
                labels={{
                  invoke: lp.athenaActions.invoke,
                  recall: lp.athenaActions.recall,
                  fallback: lp.athenaActions.fallback,
                  previous: lp.previousPeriod,
                }}
              />
            }
            cursor={CHART_CURSOR_LINE}
          />
          {ACTIONS.map((a) => (
            <Area
              key={a.key}
              type="monotone"
              dataKey={a.key}
              stackId="cost"
              stroke={a.color}
              strokeWidth={1.5}
              fill={`url(#grad-athena-${a.key})`}
              activeDot={ACTIVE_DOT}
              {...anim}
            />
          ))}
          {compare && (
            <Area
              type="monotone"
              dataKey="prevTotal"
              stroke={SERIES.rose}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              fill="none"
              activeDot={ACTIVE_DOT}
              {...anim}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-dark">
        {ACTIONS.map((a) => (
          <span key={a.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
            {lp.athenaActions[a.key]}
          </span>
        ))}
        {compare && (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3" style={{ backgroundColor: SERIES.rose }} />
            {lp.previousPeriod}
          </span>
        )}
      </div>
    </GlowCard>
  );
});
