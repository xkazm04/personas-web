"use client";

import { BRAND_VAR, STATE_COLORS } from "@/lib/brand-theme";
import {
  STATUS_BRAND,
  STATUS_LABEL,
  kpiStatus,
  progressPct,
  type Kpi,
  type KpiStatus,
} from "./kpiData";

/**
 * Shared leaf widgets for the "From goal to shipped" KPI variants — the marketing
 * cousins of the desktop `sub_factory/factoryPrimitives.tsx`. Styling-neutral and
 * static (variants own the animation + reduced-motion gating); all colors resolve
 * through BRAND_VAR / tint so they stay theme-correct (no raw hex).
 */

/** Resolve a KPI status to its themed accent color. */
export function statusColor(status: KpiStatus): string {
  return BRAND_VAR[STATUS_BRAND[status]];
}

/** Compact measurement sparkline (oldest → newest). */
export function Sparkline({
  series,
  color,
  width = 72,
  height = 20,
}: {
  series: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (series.length < 2) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true" className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StatusDot({ status, size = 8 }: { status: KpiStatus; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: statusColor(status) }}
    />
  );
}

/** Traffic-light verdict chip. */
export function StatusPill({ status, className = "" }: { status: KpiStatus; className?: string }) {
  const c = statusColor(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
      style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 16%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Calibration track — baseline→target rail with warn/crit zones shaded, the
 * current value as a marker, and the target as a flag. The "steer by KPI" affordance.
 */
export function CalibrationTrack({ kpi, height = 26 }: { kpi: Kpi; height?: number }) {
  const status = kpiStatus(kpi);
  const lo = Math.min(kpi.baseline, kpi.target, kpi.critAt, kpi.current);
  const hi = Math.max(kpi.baseline, kpi.target, kpi.critAt, kpi.current);
  const pad = (hi - lo) * 0.08 || 1;
  const min = lo - pad;
  const max = hi + pad;
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;

  const up = kpi.direction === "up";
  const critFrom = up ? min : kpi.critAt;
  const critTo = up ? kpi.critAt : max;
  const warnFrom = up ? kpi.critAt : kpi.warnAt;
  const warnTo = up ? kpi.warnAt : kpi.critAt;
  const zone = (from: number, to: number, color: string) => (
    <div
      className="absolute top-0 bottom-0"
      style={{
        left: pos(Math.min(from, to)),
        width: `calc(${pos(Math.max(from, to))} - ${pos(Math.min(from, to))})`,
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    />
  );

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-full" style={{ height, background: "rgba(var(--surface-overlay), 0.06)" }}>
        {zone(critFrom, critTo, STATE_COLORS.error)}
        {zone(warnFrom, warnTo, STATE_COLORS.warning)}
        <div className="absolute top-0 bottom-0 w-0.5" style={{ left: pos(kpi.target), background: STATE_COLORS.success }} />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: pos(kpi.current),
            width: height * 0.55,
            height: height * 0.55,
            background: statusColor(status),
            boxShadow: `0 0 0 2px var(--background)`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-muted">
        <span>base {kpi.baseline}{kpi.unit}</span>
        <span style={{ color: STATE_COLORS.success }}>target {kpi.target}{kpi.unit}</span>
      </div>
    </div>
  );
}

/** A KPI's baseline→target progress as a status-colored bar (static fill). */
export function KpiBar({ kpi, width }: { kpi: Kpi; width?: number | string }) {
  const c = statusColor(kpiStatus(kpi));
  const pct = progressPct(kpi);
  return (
    <div className="h-2 overflow-hidden rounded-full" style={{ width, background: "rgba(var(--surface-overlay), 0.08)" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(3, pct)}%`, background: c }} />
    </div>
  );
}

/** Circular 0–100 health ring (green/amber/rose ramp). Static — variant animates if desired. */
export function HealthRing({ value, size = 92, stroke = 7 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = value >= 70 ? STATE_COLORS.success : value >= 40 ? STATE_COLORS.warning : STATE_COLORS.error;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(var(--surface-overlay), 0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-foreground font-mono" style={{ fontSize: size * 0.26, fontWeight: 600 }}>
        {value}
      </text>
    </svg>
  );
}
