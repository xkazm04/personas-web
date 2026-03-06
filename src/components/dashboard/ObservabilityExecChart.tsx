"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltipContent } from "@/components/dashboard/ObservabilityCharts";

interface ExecPoint {
  date: string;
  Successes: number;
  Failures: number;
}

export default memo(function ObservabilityExecChart({ data }: { data: ExecPoint[] }) {
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
