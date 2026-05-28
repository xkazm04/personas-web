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
import { AXIS_TICK, GRID_STROKE, SERIES, ChartTooltip } from "@/lib/chart-theme";

interface ExecPoint {
  date: string;
  Successes: number;
  Failures: number;
}

export default memo(function ObservabilityExecChart({ data }: { data: ExecPoint[] }) {
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
