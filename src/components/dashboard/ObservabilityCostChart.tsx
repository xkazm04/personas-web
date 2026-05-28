"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, GRID_STROKE, SERIES, ChartTooltip } from "@/lib/chart-theme";

interface CostPoint {
  date: string;
  Cost: number;
}

const formatDollar = (v: number) => `$${v.toFixed(2)}`;

export default memo(function ObservabilityCostChart({ data }: { data: CostPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.cyan} stopOpacity={0.3} />
            <stop offset="100%" stopColor={SERIES.cyan} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip content={<ChartTooltip valueFormatter={formatDollar} />} />
        <Area type="monotone" dataKey="Cost" stroke={SERIES.cyan} strokeWidth={2} fill="url(#gradCost)" />
      </AreaChart>
    </ResponsiveContainer>
  );
});
