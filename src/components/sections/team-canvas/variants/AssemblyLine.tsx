"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { GOAL, KPIS, kpiStatus, progressPct, health } from "./kpiData";
import { CalibrationTrack, HealthRing, StatusPill, Sparkline, statusColor } from "./kpiPrimitives";

/**
 * AssemblyLine — variant 1 of 3 of the "From goal to shipped" redesign.
 *
 * A left→right factory line: a GOAL node, four agent stations (Plan · Build ·
 * Test · Review) each producing one KPI, and a SHIPPED node with a composite
 * HealthRing. A run cascades through the stations (useAutoCycle), lighting each
 * in order and calibrating its KPI track toward target. Under reduced motion the
 * line renders fully shipped (all stations lit, all KPIs at value, no cascade).
 */

const STATIONS = [
  { label: "Plan", sub: "scope + estimate", kpi: KPIS[0], brand: "cyan" as const },
  { label: "Build", sub: "implement", kpi: KPIS[3], brand: "purple" as const },
  { label: "Test", sub: "verify", kpi: KPIS[1], brand: "amber" as const },
  { label: "Review", sub: "approve", kpi: KPIS[2], brand: "emerald" as const },
];

// Cascade slots: station 0..3 then the SHIPPED slot (4).
const SLOTS = STATIONS.length + 1;
const SHIPPED_SLOT = STATIONS.length;

export default function AssemblyLine() {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const { active } = useAutoCycle({ count: SLOTS, intervalMs: 1400 });

  // A slot is "produced" once the run has reached or passed it.
  const reached = (slot: number) => reduced || slot <= active;
  const composite = health(KPIS);

  return (
    <div className="mx-auto flex h-[420px] w-full max-w-4xl flex-col justify-center gap-6 px-2 py-4">
      {/* The line: goal → stations → shipped */}
      <div className="flex items-stretch gap-3">
        {/* GOAL */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex w-40 shrink-0 flex-col justify-center rounded-2xl border border-glass px-4 py-3"
          style={{ background: "rgba(var(--surface-overlay), 0.05)" }}
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Goal</span>
          <span className="mt-1 text-sm font-semibold leading-snug text-foreground">{GOAL}</span>
        </motion.div>

        {/* CONVEYOR + STATIONS */}
        <div className="relative flex flex-1 items-center">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" style={{ background: "rgba(var(--surface-overlay), 0.14)" }} />
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
              style={{ background: BRAND_VAR.cyan, boxShadow: `0 0 10px ${tint("cyan", 60)}` }}
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 1.4 * SLOTS, repeat: Infinity, ease: "linear" }}
            />
          )}
          <div className="relative grid w-full grid-cols-4 gap-2">
            {STATIONS.map((s, i) => {
              const lit = reached(i);
              const accent = BRAND_VAR[s.brand];
              const status = kpiStatus(s.kpi);
              return (
                <motion.div
                  key={s.label}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="rounded-xl border px-2.5 py-2 transition-all duration-500"
                  style={{
                    borderColor: lit ? accent : "rgba(var(--surface-overlay), 0.16)",
                    background: lit ? tint(s.brand, 8) : "rgba(var(--surface-overlay), 0.04)",
                    boxShadow: lit ? `0 0 18px ${tint(s.brand, 22)}` : undefined,
                    opacity: lit ? 1 : 0.55,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: lit ? statusColor(status) : "rgba(var(--surface-overlay), 0.3)" }} />
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold leading-tight text-foreground">{s.label}</div>
                  <div className="truncate text-[10px] leading-tight text-muted">{s.sub}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SHIPPED */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex w-40 shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-2 transition-all duration-500"
          style={{
            borderColor: reached(SHIPPED_SLOT) ? BRAND_VAR.emerald : "rgba(var(--surface-overlay), 0.16)",
            background: reached(SHIPPED_SLOT) ? tint("emerald", 8) : "rgba(var(--surface-overlay), 0.05)",
            boxShadow: reached(SHIPPED_SLOT) ? `0 0 24px ${tint("emerald", 24)}` : undefined,
          }}
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Shipped</span>
          <HealthRing value={reached(SHIPPED_SLOT) ? composite : 0} size={76} stroke={6} />
          <span className="text-[10px] text-muted">composite health</span>
        </motion.div>
      </div>

      {/* CALIBRATION DECK — the KPI each station calibrates toward target */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2" aria-hidden>
        {STATIONS.map((s, i) => {
          const lit = reached(i);
          const status = kpiStatus(s.kpi);
          const pct = progressPct(s.kpi);
          return (
            <div key={s.kpi.id} className="flex flex-col gap-1.5" style={{ opacity: lit ? 1 : 0.5, transition: "opacity 0.5s" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                  <span className="font-mono text-[10px] text-muted">{s.label}</span>
                  {s.kpi.label}
                </span>
                <span className="flex items-center gap-2">
                  <Sparkline series={s.kpi.series} color={statusColor(status)} width={56} height={16} />
                  <StatusPill status={status} />
                </span>
              </div>
              {/* The calibration rail; the fill overlay sweeps to target as the run reaches it. */}
              <div className="relative">
                <CalibrationTrack kpi={s.kpi} height={22} />
                {!reduced && (
                  <motion.div
                    key={`${uid}-${lit}`}
                    className="pointer-events-none absolute inset-y-0 left-0 top-0 rounded-full"
                    style={{ height: 22, background: `linear-gradient(90deg, transparent, ${tint(s.brand, 14)})` }}
                    initial={{ width: 0 }}
                    animate={{ width: lit ? `${pct}%` : 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
