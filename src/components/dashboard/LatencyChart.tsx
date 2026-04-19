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

const formatYAxis = (v: number): string => {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}s`;
  return `${v}ms`;
};

function LatencyTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-glass-hover bg-background/95 px-3 py-2 text-sm shadow-xl backdrop-blur-md">
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}:{" "}
          <span className="font-medium">
            {entry.value >= 1000
              ? `${(entry.value / 1000).toFixed(2)}s`
              : `${entry.value}ms`}
          </span>
        </p>
      ))}
    </div>
  );
}

export default memo(function LatencyChart({ data }: { data: LatencyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<LatencyTooltipContent />} />
        <ReferenceLine
          y={1000}
          stroke="#f43f5e"
          strokeDasharray="6 4"
          strokeOpacity={0.6}
          label={{
            value: "1s SLO",
            position: "right",
            fill: "#f43f5e",
            fontSize: 10,
          }}
        />
        <Line
          type="monotone"
          dataKey="p50"
          name="P50"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="p95"
          name="P95"
          stroke="#fbbf24"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="p99"
          name="P99"
          stroke="#f43f5e"
          strokeWidth={2}
          dot={false}
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
