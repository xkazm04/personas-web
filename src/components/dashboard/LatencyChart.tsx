"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from "recharts";
import type { LatencyPoint } from "@/lib/mock-dashboard-data";
import {
  AXIS_TICK,
  GRID_STROKE,
  SERIES,
  ChartTooltip,
  useChartAnimation,
  ACTIVE_DOT,
  CHART_CURSOR_LINE,
} from "@/lib/chart-theme";

const formatYAxis = (v: number): string => {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}s`;
  return `${v}ms`;
};

const formatLatencyValue = (v: number): string =>
  v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${v}ms`;

export default memo(function LatencyChart({ data }: { data: LatencyPoint[] }) {
  const anim = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="date"
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<ChartTooltip valueFormatter={formatLatencyValue} />} cursor={CHART_CURSOR_LINE} />
        <ReferenceLine
          y={1000}
          stroke={SERIES.rose}
          strokeDasharray="6 4"
          strokeOpacity={0.6}
          label={{
            value: "1s SLO",
            position: "right",
            fill: SERIES.rose,
            fontSize: 10,
          }}
        />
        <Line
          type="monotone"
          dataKey="p50"
          name="P50"
          stroke={SERIES.cyan}
          strokeWidth={2}
          dot={false}
          activeDot={ACTIVE_DOT}
          {...anim}
        />
        <Line
          type="monotone"
          dataKey="p95"
          name="P95"
          stroke={SERIES.amber}
          strokeWidth={2}
          dot={false}
          activeDot={ACTIVE_DOT}
          {...anim}
        />
        <Line
          type="monotone"
          dataKey="p99"
          name="P99"
          stroke={SERIES.rose}
          strokeWidth={2}
          dot={false}
          activeDot={ACTIVE_DOT}
          {...anim}
        />
        <Legend
          verticalAlign="bottom"
          height={24}
          wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
