"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Bot, ClipboardCheck, Zap } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { healthScoreColor } from "@/components/dashboard/healthScoreColor";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";

// SVG ring geometry (mirrors HealthDigestPanel's success ring).
const RING_SIZE = 96;
const STROKE_WIDTH = 7;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Accent = "cyan" | "purple" | "amber" | "emerald" | "rose";

const tileTint: Record<Accent, string> = {
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  rose: "text-rose-400",
};

/**
 * Mission-vitals console: a success-rate ring beside four KPI tiles
 * (Runs / Agents / Alerts / Reviews). The web counterpart to the desktop
 * overview's VitalsConsole, kept in the airy glow-card style. The ring fill
 * animates on mount via a CSS transition; the count uses useAnimatedNumber
 * (both honor prefers-reduced-motion).
 */
export function VitalsConsole({
  successRate,
  runs,
  agents,
  alerts,
  reviews,
}: {
  successRate: number;
  runs: number;
  agents: number;
  alerts: number;
  reviews: number;
}) {
  const { t } = useTranslation();
  const labels = t.dashboard.home.vitals;
  const colors = healthScoreColor(successRate);

  const [offset, setOffset] = useState(CIRCUMFERENCE);
  const [countTarget, setCountTarget] = useState(0);
  const animatedScore = useAnimatedNumber(countTarget, 1000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(CIRCUMFERENCE - (successRate / 100) * CIRCUMFERENCE);
      setCountTarget(successRate);
    }, 200);
    return () => clearTimeout(timer);
  }, [successRate]);

  const tiles: Array<{ icon: React.ElementType; label: string; value: number; accent: Accent }> = [
    { icon: Zap, label: labels.runs, value: runs, accent: "cyan" },
    { icon: Bot, label: t.dashboard.agents, value: agents, accent: "purple" },
    { icon: AlertTriangle, label: labels.alerts, value: alerts, accent: alerts > 0 ? "rose" : "emerald" },
    { icon: ClipboardCheck, label: t.dashboard.reviews, value: reviews, accent: "amber" },
  ];

  return (
    <GlowCard accent="cyan" className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 sm:flex-row"
      >
        {/* Success-rate ring */}
        <motion.div variants={fadeUp} className="relative flex flex-shrink-0 flex-col items-center">
          <svg width={RING_SIZE} height={RING_SIZE} className="rotate-[-90deg]">
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.hex}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>
              {Math.round(animatedScore)}%
            </span>
          </div>
          <span className="mt-1.5 text-sm font-medium uppercase tracking-wider text-muted-dark">
            {t.dashboard.successRate}
          </span>
        </motion.div>

        {/* KPI tiles */}
        <motion.div variants={fadeUp} className="grid w-full grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-3.5 py-3"
            >
              <tile.icon className={`h-4 w-4 flex-shrink-0 ${tileTint[tile.accent]}`} />
              <div className="min-w-0">
                <p className="text-xl font-bold leading-tight tabular-nums text-foreground">
                  {tile.value}
                </p>
                <p className="truncate text-sm text-muted-dark">{tile.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </GlowCard>
  );
}
