import type { BrandKey } from "@/lib/brand-theme";

/**
 * Shared KPI dataset for the "From goal to shipped" redesign variants.
 *
 * Models the desktop Factory/KPI mechanism (personas `sub_factory/factoryMock.ts`)
 * in miniature for a marketing illustration: a goal, and the measurable outcomes
 * an agent team moves toward target — each KPI a baseline→current→target with
 * warn/crit threshold bands, a traffic-light status, and a deterministic trend.
 *
 * Hardcoded EN (Stream-1 i18n descope). Colors are resolved by consumers via
 * STATUS_BRAND → BRAND_VAR (no raw hex), so they stay theme-correct.
 */

export type KpiStatus = "met" | "ok" | "warn" | "crit";

export interface Kpi {
  id: string;
  label: string;
  unit: string;
  direction: "up" | "down";
  baseline: number;
  current: number;
  target: number;
  /** Crossing warnAt is a soft alert; critAt a hard one. */
  warnAt: number;
  critAt: number;
  /** oldest → newest, for sparklines. */
  series: number[];
}

export const GOAL = "Ship the v0.5 release";

/** Status → a brand key (consumer maps to BRAND_VAR / tint — never raw hex). */
export const STATUS_BRAND: Record<KpiStatus, BrandKey> = {
  met: "emerald",
  ok: "cyan",
  warn: "amber",
  crit: "rose",
};

export const STATUS_LABEL: Record<KpiStatus, string> = {
  met: "Target met",
  ok: "On track",
  warn: "At risk",
  crit: "Off track",
};

/** Deterministic noisy trend baseline→current (no Math.random — stable across renders). */
function trend(from: number, to: number, n = 8): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    const wob = Math.sin(i * 1.7 + from) * Math.abs(to - from) * 0.06;
    out.push(Math.round((from + (to - from) * f + wob) * 100) / 100);
  }
  return out;
}

function kpi(
  id: string,
  label: string,
  unit: string,
  direction: "up" | "down",
  baseline: number,
  current: number,
  target: number,
  warnAt: number,
  critAt: number,
): Kpi {
  return { id, label, unit, direction, baseline, current, target, warnAt, critAt, series: trend(baseline, current) };
}

export const KPIS: Kpi[] = [
  kpi("lead-time", "Lead time", "d", "down", 14, 6, 3, 8, 12),
  kpi("coverage", "Test coverage", "%", "up", 61, 84, 90, 70, 60),
  kpi("error-rate", "Error rate", "%", "down", 4.2, 0.9, 0.5, 1.5, 3),
  kpi("review", "Review pass rate", "%", "up", 70, 92, 95, 80, 70),
  kpi("cost", "Cost / run", "$", "down", 0.12, 0.04, 0.03, 0.06, 0.1),
  kpi("adoption", "Weekly users", "k", "up", 1.2, 3.1, 5, 2, 1.2),
];

/** Traffic-light status from current vs target/thresholds (direction-aware). */
export function kpiStatus(k: Kpi): KpiStatus {
  const better = k.direction === "down" ? k.current <= k.target : k.current >= k.target;
  if (better) return "met";
  const breach = (t: number) => (k.direction === "down" ? k.current >= t : k.current <= t);
  if (breach(k.critAt)) return "crit";
  if (breach(k.warnAt)) return "warn";
  return "ok";
}

/** 0–100 progress from baseline toward target, direction-aware, clamped. */
export function progressPct(k: Kpi): number {
  if (k.target === k.baseline) return 100;
  const frac = (k.current - k.baseline) / (k.target - k.baseline);
  return Math.round(Math.min(1, Math.max(0, frac)) * 100);
}

/** 0–100 composite health = mean progress, lightly weighted toward met KPIs. */
export function health(kpis: Kpi[] = KPIS): number {
  if (!kpis.length) return 0;
  const sum = kpis.reduce((acc, k) => {
    const p = progressPct(k);
    return acc + (kpiStatus(k) === "met" ? Math.max(p, 92) : p);
  }, 0);
  return Math.round(sum / kpis.length);
}
