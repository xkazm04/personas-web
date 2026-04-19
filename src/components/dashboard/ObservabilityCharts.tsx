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

export const ChartTooltipContent = memo(function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
  nameFormatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  valueFormatter?: (value: number) => React.ReactNode;
  nameFormatter?: (name: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-glass-hover bg-background/95 px-3 py-2 text-sm shadow-xl backdrop-blur-md">
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {nameFormatter ? nameFormatter(entry.name) : entry.name}: <span className="font-medium">
            {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
});

export const CostChart = memo(function CostChart({ data }: { data: CostPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip content={<ChartTooltipContent valueFormatter={formatDollar} />} />
        <Area type="monotone" dataKey="Cost" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCost)" />
      </AreaChart>
    </ResponsiveContainer>
  );
});

export const ExecChart = memo(function ExecChart({ data }: { data: ExecPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltipContent />} />
        <Bar dataKey="Successes" stackId="exec" fill="#34d399" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Failures" stackId="exec" fill="#f43f5e" radius={[4, 4, 0, 0]} />
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
        <Tooltip content={<ChartTooltipContent valueFormatter={formatDollar} />} />
      </PieChart>
    </ResponsiveContainer>
  );
});
