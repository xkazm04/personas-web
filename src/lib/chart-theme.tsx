import { memo } from "react";
import type { ReactNode } from "react";

/**
 * Single source of truth for recharts axis / grid / series styling.
 *
 * Every chart surface across the dashboard (latency, traffic, cost, exec,
 * usage, spend) reads its tick colors, grid stroke, series palette and
 * tooltip from here so the observability area renders as one cohesive
 * system — and a single edit re-themes every chart at once.
 */

/** Tick style for value / date axes, spread into a recharts `tick={...}`. */
export const AXIS_TICK = { fontSize: 10, fill: "#64748b" } as const;

/** Brighter tick for category / name axes that carry the primary labels. */
export const AXIS_TICK_LABEL = { fontSize: 10, fill: "#94a3b8" } as const;

/** Stroke for `<CartesianGrid>` lines. */
export const GRID_STROKE = "rgba(255,255,255,0.04)";

/** Named series colors shared by every line / area / bar / reference line. */
export const SERIES = {
  cyan: "#06b6d4",
  violet: "#a855f7",
  rose: "#f43f5e",
  emerald: "#34d399",
  amber: "#fbbf24",
  blue: "#3b82f6",
  pink: "#ec4899",
  orange: "#f97316",
} as const;

/**
 * Ordered categorical palette for multi-series / pie charts. Re-exported as
 * `CHART_COLORS` from `@/lib/constants` for backward compatibility.
 */
export const CHART_PALETTE: string[] = [
  SERIES.cyan,
  SERIES.violet,
  SERIES.rose,
  SERIES.emerald,
  SERIES.amber,
  SERIES.blue,
  SERIES.pink,
  SERIES.orange,
];

/** Shared shell classes for every chart tooltip surface. */
export const CHART_TOOLTIP_CLASS =
  "rounded-xl border border-glass-hover bg-background/95 px-3 py-2 text-sm shadow-xl backdrop-blur-md";

export interface ChartTooltipEntry {
  value: number;
  name: string;
  color: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
  valueFormatter?: (value: number) => ReactNode;
  nameFormatter?: (name: string) => string;
}

/**
 * The one tooltip every recharts surface renders. Replaces the formerly
 * near-duplicate `ChartTooltipContent` / `LatencyTooltipContent`; pass a
 * `valueFormatter` for unit-aware values (ms/s, dollars) and a
 * `nameFormatter` to relabel series.
 */
export const ChartTooltip = memo(function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  nameFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {nameFormatter ? nameFormatter(entry.name) : entry.name}:{" "}
          <span className="font-medium">
            {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
});
