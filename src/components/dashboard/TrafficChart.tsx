"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AXIS_TICK,
  GRID_STROKE,
  SERIES,
  ChartTooltip,
  useChartAnimation,
  ACTIVE_DOT,
  CHART_CURSOR_LINE,
} from "@/lib/chart-theme";
import { useTranslation } from "@/i18n/useTranslation";

export interface TrafficChartProps {
  chartData: Array<{ date: string; Executions: number; Errors: number }>;
}

export default function TrafficChart({ chartData }: TrafficChartProps) {
  const { t } = useTranslation();
  const anim = useChartAnimation();
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-dark">
        {t.dashboardUi.noDataAvailable}
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%" minHeight={200} className="!h-[200px] sm:!h-[280px] lg:!h-[320px]">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradExec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES.cyan} stopOpacity={0.3} />
              <stop offset="100%" stopColor={SERIES.cyan} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradErr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES.rose} stopOpacity={0.3} />
              <stop offset="100%" stopColor={SERIES.rose} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={GRID_STROKE}
            vertical={false}
          />
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
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={CHART_CURSOR_LINE} />
          <Area
            type="monotone"
            dataKey="Executions"
            stroke={SERIES.cyan}
            strokeWidth={2}
            fill="url(#gradExec)"
            activeDot={ACTIVE_DOT}
            {...anim}
          />
          <Area
            type="monotone"
            dataKey="Errors"
            stroke={SERIES.rose}
            strokeWidth={2}
            fill="url(#gradErr)"
            activeDot={ACTIVE_DOT}
            {...anim}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-sm text-muted-dark">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          {t.observabilityPage.executions}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          {t.dashboardUi.errors}
        </span>
      </div>
    </>
  );
}
