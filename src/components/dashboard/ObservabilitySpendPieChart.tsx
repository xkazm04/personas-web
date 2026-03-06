"use client";

import { memo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { ChartTooltipContent } from "@/components/dashboard/ObservabilityCharts";

interface SpendPiePoint {
  name: string;
  value: number;
  color?: string;
}

const formatDollar = (v: number) => `$${v.toFixed(2)}`;

export default memo(function ObservabilitySpendPieChart({ data }: { data: SpendPiePoint[] }) {
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
