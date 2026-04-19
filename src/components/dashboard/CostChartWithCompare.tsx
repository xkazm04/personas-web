"use client";

import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { MOCK_COST_COMPARE, MOCK_ANNOTATIONS } from "@/lib/mock-dashboard-data";
import type { ChartAnnotation } from "@/lib/mock-dashboard-data";

const annotationStyles: Record<ChartAnnotation["type"], { stroke: string; emoji: string }> = {
  deployment: { stroke: "#06b6d4", emoji: "\u{1F680}" },
  incident: { stroke: "#f43f5e", emoji: "\u26A0\uFE0F" },
  milestone: { stroke: "#34d399", emoji: "\u{1F3AF}" },
};

interface CostPoint {
  date: string;
  Cost: number;
}

interface MergedCostPoint {
  date: string;
  Cost: number;
  Previous?: number;
}

function CompareTooltipContent({
  active,
  payload,
  label,
  compare,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
  label?: string;
  compare: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-glass-hover bg-background/95 px-3 py-2 text-sm shadow-xl backdrop-blur-md">
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === "Previous" && compare ? "Previous" : "Current"}:{" "}
          <span className="font-medium">${entry.value.toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
}

export default memo(function CostChartWithCompare({
  data,
  compare,
}: {
  data: CostPoint[];
  compare: boolean;
}) {
  const mergedData: MergedCostPoint[] = useMemo(() => {
    if (!compare) return data;
    const compareMap = new Map(MOCK_COST_COMPARE.map((c) => [c.date, c.previous]));
    return data.map((d) => ({
      ...d,
      Previous: compareMap.get(d.date),
    }));
  }, [data, compare]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={mergedData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCostCompare" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCostPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip content={<CompareTooltipContent compare={compare} />} />
        {/* Annotations */}
        {MOCK_ANNOTATIONS.map((a) => {
          const style = annotationStyles[a.type];
          return (
            <ReferenceLine
              key={`${a.type}-${a.date}`}
              x={a.date}
              stroke={style.stroke}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: `${style.emoji} ${a.label}`,
                position: "top",
                fill: style.stroke,
                fontSize: 10,
              }}
            />
          );
        })}
        {compare && (
          <Area
            type="monotone"
            dataKey="Previous"
            stroke="#a855f7"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            fill="url(#gradCostPrev)"
          />
        )}
        <Area
          type="monotone"
          dataKey="Cost"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#gradCostCompare)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
