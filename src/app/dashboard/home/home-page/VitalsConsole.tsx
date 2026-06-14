"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Bot, ClipboardCheck, Gauge, Zap } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import Sparkline from "@/components/dashboard/Sparkline";
import { healthScoreColor } from "@/components/dashboard/healthScoreColor";
import { useTranslation } from "@/i18n/useTranslation";
import { SPARKLINE_SUCCESS } from "@/lib/mock-dashboard-data";
import { useOpenAlertCount } from "./useOpenAlertCount";

const RING = { size: 132, stroke: 9 };
const RADIUS = (RING.size - RING.stroke) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Radial success-rate gauge. Sweeps from empty to `value`% on mount; static
 * when the user prefers reduced motion. Stroke colour follows the dashboard's
 * 4-band score ramp (healthScoreColor).
 */
function SuccessRing({ value, label }: { value: number; label: string }) {
  const reduced = useReducedMotion() ?? false;
  const pct = Math.max(0, Math.min(100, value));
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  const color = healthScoreColor(value);

  return (
    <div className="relative flex-shrink-0" style={{ width: RING.size, height: RING.size }}>
      <svg width={RING.size} height={RING.size} viewBox={`0 0 ${RING.size} ${RING.size}`}>
        <circle
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={RING.stroke}
        />
        <motion.circle
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={RADIUS}
          fill="none"
          stroke={color.hex}
          strokeWidth={RING.stroke}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          transform={`rotate(-90 ${RING.size / 2} ${RING.size / 2})`}
          initial={{ strokeDashoffset: reduced ? offset : CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums ${color.text}`}>{pct}%</span>
        <span className="mt-0.5 text-xs text-muted-dark">{label}</span>
      </div>
    </div>
  );
}

type CounterAccent = "cyan" | "purple" | "rose" | "amber" | "emerald";

const COUNTER_TINT: Record<CounterAccent, string> = {
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
};

function VitalCounter({
  icon: Icon,
  label,
  value,
  href,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
  accent: CounterAccent;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg border border-glass bg-white/[0.02] px-2.5 py-2 transition-colors hover:bg-white/[0.04] focus-ring focus-visible:ring-offset-0"
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${COUNTER_TINT[accent]}`} />
      <div className="min-w-0">
        <p className="text-base font-bold leading-none tabular-nums text-foreground">{value}</p>
        <p className="mt-0.5 truncate text-xs text-muted-dark">{label}</p>
      </div>
    </Link>
  );
}

/**
 * Vitals Console — the Mission-Control cockpit's centre column. Success-rate
 * ring + 14-day success sparkline over a 2×2 grid of fleet counters (runs,
 * agents, open alerts, pending reviews). The web counterpart to the desktop
 * overview's Vitals Console.
 */
export function VitalsConsole({
  successRate,
  runs,
  agents,
  reviews,
}: {
  successRate: number;
  runs: number;
  agents: number;
  reviews: number;
}) {
  const { t } = useTranslation();
  const labels = t.dashboard.home.cockpit;
  const openAlerts = useOpenAlertCount();

  return (
    <GlowCard accent="emerald" className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-emerald-400" />
        <h2 className="text-base font-semibold text-foreground">{labels.vitalsTitle}</h2>
      </div>

      <div className="flex flex-col items-center">
        <SuccessRing value={successRate} label={t.dashboard.successRate} />
        <div className="mt-3 flex w-full items-center justify-center gap-2 text-xs text-muted-dark">
          <span>{labels.vitalsTrend}</span>
          <Sparkline data={SPARKLINE_SUCCESS} accent="emerald" width={84} height={22} />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <VitalCounter icon={Zap} label={t.dashboard.home.vitals.runs} value={runs} href="/dashboard/executions" accent="cyan" />
        <VitalCounter icon={Bot} label={t.dashboard.agents} value={agents} href="/dashboard/agents" accent="purple" />
        <VitalCounter
          icon={AlertTriangle}
          label={t.dashboard.home.vitals.alerts}
          value={openAlerts}
          href="/dashboard/observability"
          accent={openAlerts > 0 ? "rose" : "emerald"}
        />
        <VitalCounter icon={ClipboardCheck} label={t.dashboard.reviews} value={reviews} href="/dashboard/reviews" accent="amber" />
      </div>
    </GlowCard>
  );
}
