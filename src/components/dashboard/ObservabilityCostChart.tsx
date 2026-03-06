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
import { ChartTooltipContent } from "@/components/dashboard/ObservabilityCharts";

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
