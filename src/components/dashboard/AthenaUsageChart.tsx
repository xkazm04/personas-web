"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

/**
 * The recharts half of AthenaUsageCard, split out so the card can defer it with
 * `next/dynamic({ ssr: false })` — the same shape LatencyChart and
 * ObservabilitySpendPieChart already use. recharts (+ its d3 dependencies) is a
 * 344 KB chunk; importing it from the card put it in the first load of every
 * dashboard route that renders one of these cards.
 */

export interface AthenaAction {
  key: "invoke" | "recall" | "fallback";
  color: string;
}

export interface AthenaUsageLabels {
  invoke: string;
  recall: string;
  fallback: string;
  previous: string;
}

function UsageTooltip({
  active,
  payload,
  label,
  labels,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  labels: AthenaUsageLabels;
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

export default function AthenaUsageChart({
  data,
  compare,
  labels,
  actions,
}: {
  data: AthenaUsagePoint[];
  compare: boolean;
  labels: AthenaUsageLabels;
  // Passed in rather than exported from here: the card renders the legend from
  // the same list, and importing it FROM this module would pull recharts back
  // into the card's static graph and undo the whole split.
  actions: readonly AthenaAction[];
}) {
  const anim = useChartAnimation();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          {actions.map((a) => (
            <linearGradient key={a.key} id={`grad-athena-${a.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={a.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={a.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
        <Tooltip content={<UsageTooltip labels={labels} />} cursor={CHART_CURSOR_LINE} />
        {actions.map((a) => (
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
  );
}
