import type { SLAMetricType, SLASeverity, SLATarget } from "@/lib/mock-dashboard-data";

export function complianceBand(value: number): {
  text: string;
  bar: string;
  pill: string;
} {
  if (value >= 0.995)
    return {
      text: "text-emerald-400",
      bar: "bg-emerald-400/70",
      pill: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    };
  if (value >= 0.98)
    return {
      text: "text-cyan-400",
      bar: "bg-cyan-400/70",
      pill: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    };
  if (value >= 0.95)
    return {
      text: "text-amber-400",
      bar: "bg-amber-400/70",
      pill: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    };
  return {
    text: "text-rose-400",
    bar: "bg-rose-400/70",
    pill: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  };
}

export const severityPill: Record<SLASeverity, string> = {
  minor: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  major: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export function formatValue(target: SLATarget): string {
  if (target.unit === "ms") {
    return target.current >= 1000
      ? `${(target.current / 1000).toFixed(1)}s`
      : `${Math.round(target.current)}ms`;
  }
  return `${target.current.toFixed(target.current < 100 ? 2 : 1)}${target.unit}`;
}

export function formatTarget(target: SLATarget): string {
  if (target.unit === "ms") {
    return target.target >= 1000
      ? `${(target.target / 1000).toFixed(0)}s`
      : `${target.target}ms`;
  }
  return `${target.target}${target.unit}`;
}

export function metricKey(metric: SLAMetricType) {
  return metric;
}
