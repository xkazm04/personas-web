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
import type { ChartAnnotation } from "@/lib/mock-dashboard-data";
import {
  AXIS_TICK,
  GRID_STROKE,
  SERIES,
  CHART_TOOLTIP_CLASS,
  useChartAnimation,
  ACTIVE_DOT,
  CHART_CURSOR_LINE,
} from "@/lib/chart-theme";

const annotationStyles: Record<ChartAnnotation["type"], { stroke: string; emoji: string }> = {
  deployment: { stroke: SERIES.cyan, emoji: "\u{1F680}" },
  incident: { stroke: SERIES.rose, emoji: "\u26A0\uFE0F" },
  milestone: { stroke: SERIES.emerald, emoji: "\u{1F3AF}" },
};

interface CostPoint {
  date: string;
  Cost: number;
}

export interface ComparePoint {
  date: string;
  previous: number;
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
    <div className={CHART_TOOLTIP_CLASS}>
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
  previousSeries = [],
  annotations = [],
}: {
  data: CostPoint[];
  compare: boolean;
  /** Previous-period overlay. Empty in real mode (no synced prior period) so
   *  no fabricated "Previous" line is drawn over genuine data. */
  previousSeries?: ComparePoint[];
  /** Timeline annotations (deploys/incidents). Empty in real mode. */
  annotations?: ChartAnnotation[];
}) {
  const anim = useChartAnimation();
  const compareMap = useMemo(
    () => new Map(previousSeries.map((c) => [c.date, c.previous])),
    [previousSeries],
  );
  const showPrevious = compare && previousSeries.length > 0;
  const mergedData: MergedCostPoint[] = useMemo(() => {
    if (!showPrevious) return data;
    return data.map((d) => ({
      ...d,
      Previous: compareMap.get(d.date),
    }));
  }, [data, showPrevious, compareMap]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={mergedData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCostCompare" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.cyan} stopOpacity={0.3} />
            <stop offset="100%" stopColor={SERIES.cyan} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCostPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.violet} stopOpacity={0.15} />
            <stop offset="100%" stopColor={SERIES.violet} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip content={<CompareTooltipContent compare={showPrevious} />} cursor={CHART_CURSOR_LINE} />
        {/* Annotations (real mode passes none) */}
        {annotations.map((a) => {
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
        {showPrevious && (
          <Area
            type="monotone"
            dataKey="Previous"
            stroke={SERIES.violet}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            fill="url(#gradCostPrev)"
            activeDot={ACTIVE_DOT}
            {...anim}
          />
        )}
        <Area
          type="monotone"
          dataKey="Cost"
          stroke={SERIES.cyan}
          strokeWidth={2}
          fill="url(#gradCostCompare)"
          activeDot={ACTIVE_DOT}
          {...anim}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
