"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import { useTranslation } from "@/i18n/useTranslation";
import { HEATMAP_DAYS } from "@/lib/mock-dashboard-data";
import { useExecutionHeatmap } from "./useExecutionHeatmap";

function CardSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-glass-hover border-t-brand-cyan" />
    </div>
  );
}

// Violet intensity ramp (0 = no activity … 4 = peak), mirroring the desktop
// ExecutionHeatmap colour scale.
const FILL = [
  "rgba(255,255,255,0.04)",
  "rgba(99,102,241,0.28)",
  "rgba(99,102,241,0.55)",
  "rgba(139,92,246,0.78)",
  "rgba(167,139,250,0.95)",
];

function intensity(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}

/**
 * Execution-activity heatmap: one row per agent, one cell per day across the
 * last 7 days, coloured by run volume. The web counterpart to the desktop
 * overview's ExecutionHeatmap, compacted to a fleet × week grid. Weekday
 * labels are derived once via Intl (locale-aware, no new i18n keys).
 */
export function ExecutionHeatmapCard() {
  const { t } = useTranslation();
  const labels = t.dashboard.home.heatmap;
  const { rows, loading, error, retry } = useExecutionHeatmap();

  // Cache the impure date math in a lazy initializer (React 19 purity rule).
  const [weekdays] = useState(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
    const today = new Date();
    return Array.from({ length: HEATMAP_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (HEATMAP_DAYS - 1 - i));
      return fmt.format(d);
    });
  });

  const max = Math.max(1, ...rows.flatMap((row) => row.days));
  const isEmpty = rows.length === 0 || rows.every((row) => row.days.every((c) => c === 0));

  return (
    <GlowCard accent="purple" className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-purple-400" />
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        <span className="ml-auto text-sm text-muted-dark">{labels.subtitle}</span>
      </div>

      {/* Spinner while loading and error banner on failure precede the empty
          state, so "no activity" only means resolved-and-truly-empty — not a
          fetch in flight or a swallowed error. */}
      {loading ? (
        <CardSpinner />
      ) : error ? (
        <DashboardErrorBanner message={error} onRetry={retry} />
      ) : isEmpty ? (
        <p className="py-8 text-center text-sm text-muted-dark">{labels.empty}</p>
      ) : (
        <>
          {/* Screen-reader summary — conveys the per-agent weekly totals in
              text so the data isn't locked behind the colour-only cells. */}
          <p className="sr-only">
            {`${labels.title} · ${labels.subtitle}. `}
            {rows
              .map((row) => `${row.persona}: ${row.days.reduce((a, b) => a + b, 0)}`)
              .join(", ")}
          </p>

          {/* Weekday header aligned to the cell grid */}
          <div className="mt-4 flex items-center gap-2">
            <span className="w-24 flex-shrink-0" />
            <div className="grid flex-1 grid-cols-7 gap-1">
              {weekdays.map((d, i) => (
                <span key={i} className="text-center text-sm text-muted-dark">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1.5 space-y-1.5">
            {rows.map((row) => (
              <div key={row.persona} className="flex items-center gap-2">
                <span className="flex w-24 flex-shrink-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="truncate text-sm font-medium text-foreground">{row.persona}</span>
                </span>
                <div className="grid flex-1 grid-cols-7 gap-1">
                  {row.days.map((count, i) => (
                    <span
                      key={i}
                      role="img"
                      aria-label={`${row.persona}, ${weekdays[i]}: ${count}`}
                      title={`${row.persona} — ${count}`}
                      className="h-5 rounded-[3px]"
                      style={{ backgroundColor: FILL[intensity(count, max)] }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-1.5 text-sm text-muted-dark">
            <span>{labels.less}</span>
            {FILL.map((fill, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: fill }}
              />
            ))}
            <span>{labels.more}</span>
          </div>
        </>
      )}
    </GlowCard>
  );
}
