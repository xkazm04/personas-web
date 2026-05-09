"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Heart, CheckCircle, AlertCircle } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { MOCK_HEALTH_DIGEST } from "@/lib/mock-dashboard-data";
import { relativeTime } from "@/lib/format";

/** Resolve score to a Tailwind color token class. */
function scoreColor(score: number): {
  text: string;
  stroke: string;
  bg: string;
  hex: string;
} {
  if (score >= 80)
    return {
      text: "text-emerald-400",
      stroke: "stroke-emerald-400",
      bg: "bg-emerald-400",
      hex: "#34d399",
    };
  if (score >= 60)
    return {
      text: "text-amber-400",
      stroke: "stroke-amber-400",
      bg: "bg-amber-400",
      hex: "#fbbf24",
    };
  return {
    text: "text-red-400",
    stroke: "stroke-red-400",
    bg: "bg-red-400",
    hex: "#f43f5e",
  };
}

// SVG circle math
const RING_SIZE = 80;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Animation timings
const RING_ANIMATION_DELAY = 0.2;
const RING_DURATION = 1;
const BAR_DURATION = 0.7;

/** Score number that climbs in lockstep with its accompanying ring/bar fill. */
function AnimatedScoreNumber({
  value,
  duration,
  delay = 0,
  className,
}: {
  value: number;
  duration: number;
  delay?: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(mv, value, { duration, delay, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, delay, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}

/** Clamp an upstream score to [0,100] and substitute 0 for non-finite input. */
function safeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, score));
}

export default function HealthDigestPanel() {
  const { overallScore, agents } = MOCK_HEALTH_DIGEST;
  const safeOverall = safeScore(overallScore);
  const colors = scoreColor(safeOverall);

  // Animate the ring fill on mount
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    // Small delay so the animation is visible after mount
    const timer = setTimeout(() => {
      setOffset(CIRCUMFERENCE - (safeOverall / 100) * CIRCUMFERENCE);
    }, RING_ANIMATION_DELAY * 1000);
    return () => clearTimeout(timer);
  }, [safeOverall]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-2 self-start mb-4"
      >
        <Heart className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-sm font-semibold text-foreground">
          System Health
        </h2>
      </motion.div>

      {/* Score Ring */}
      <motion.div
        variants={fadeUp}
        className="relative flex flex-col items-center mb-6"
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="rotate-[-90deg]"
        >
          {/* Background track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress arc */}
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

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedScoreNumber
            value={safeOverall}
            duration={RING_DURATION}
            delay={RING_ANIMATION_DELAY}
            className={`text-2xl font-bold tabular-nums ${colors.text}`}
          />
        </div>

        <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-dark">
          Health
        </span>
      </motion.div>

      {/* Agent Rows */}
      <div className="w-full space-y-1.5">
        {agents.map((agent) => {
          const agentSafeScore = safeScore(agent.score);
          const agentColors = scoreColor(agentSafeScore);
          return (
            <motion.div
              key={agent.name}
              variants={fadeUp}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              {/* Color dot */}
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: agent.color }}
              />

              {/* Agent name */}
              <span className="text-xs font-medium text-foreground truncate min-w-0 flex-shrink-0 w-24">
                {agent.name}
              </span>

              {/* Score bar */}
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${agentColors.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${agentSafeScore}%` }}
                  transition={{ duration: BAR_DURATION, ease: "easeOut" }}
                  style={{ opacity: 0.8 }}
                />
              </div>

              {/* Score number */}
              <AnimatedScoreNumber
                value={agentSafeScore}
                duration={BAR_DURATION}
                className={`text-[10px] font-medium tabular-nums w-6 text-right ${agentColors.text}`}
              />

              {/* Issue count badge */}
              {agent.issues > 0 ? (
                <span className="flex items-center gap-0.5 rounded-full border border-red-500/20 bg-red-500/8 px-1.5 py-0.5 text-[9px] font-medium text-red-400">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {agent.issues}
                </span>
              ) : (
                <span className="flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/8 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                  <CheckCircle className="h-2.5 w-2.5" />
                </span>
              )}

              {/* Last run */}
              <span className="text-[10px] text-muted-dark whitespace-nowrap w-12 text-right">
                {relativeTime(agent.lastRun)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
