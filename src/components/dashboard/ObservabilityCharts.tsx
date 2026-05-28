"use client";

import { memo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { AXIS_TICK, GRID_STROKE, SERIES, ChartTooltip } from "@/lib/chart-theme";

const formatDollar = (v: number) => `$${v.toFixed(2)}`;

interface CostPoint {
  date: string;
  Cost: number;
}

interface ExecPoint {
  date: string;
  Successes: number;
  Failures: number;
}

interface SpendPiePoint {
  name: string;
  value: number;
  color?: string;
}

export const CostChart = memo(function CostChart({ data }: { data: CostPoint[] }) {
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

export const ExecChart = memo(function ExecChart({ data }: { data: ExecPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="Successes" stackId="exec" fill={SERIES.emerald} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Failures" stackId="exec" fill={SERIES.rose} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

export const SpendPieChart = memo(function SpendPieChart({ data }: { data: SpendPiePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip valueFormatter={formatDollar} />} />
      </PieChart>
    </ResponsiveContainer>
  );
});
