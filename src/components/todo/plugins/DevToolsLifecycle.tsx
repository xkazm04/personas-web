"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/* ── Variant B: Goal Lifecycle Kanban — mirrors sub_lifecycle ── */
/* 4 columns: Idea · Scoped · Active · Shipped */

interface Goal {
  id: string;
  title: string;
  effort: "S" | "M" | "L";
  risk: "low" | "med" | "high";
}

interface Column {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  goals: Goal[];
}

const COLUMNS: Column[] = [
  {
    key: "idea",
    label: "Idea",
    icon: Sparkles,
    color: "#a855f7",
    goals: [
      { id: "g1", title: "Voice-to-agent command mode", effort: "L", risk: "high" },
      { id: "g2", title: "Local vector cache for memories", effort: "M", risk: "med" },
      { id: "g3", title: "OTel spans for tool calls", effort: "S", risk: "low" },
    ],
  },
  {
    key: "scoped",
    label: "Scoped",
    icon: Target,
    color: "#06b6d4",
    goals: [
      { id: "g4", title: "Retry with exponential backoff", effort: "S", risk: "low" },
      { id: "g5", title: "Credential rotation dashboard", effort: "M", risk: "med" },
    ],
  },
  {
    key: "active",
    label: "Active",
    icon: Zap,
    color: "#fbbf24",
    goals: [
      { id: "g6", title: "3×3 persona matrix builder", effort: "L", risk: "med" },
      { id: "g7", title: "BYOM Ollama routing rules", effort: "M", risk: "low" },
      { id: "g8", title: "Self-healing circuit breaker", effort: "M", risk: "med" },
    ],
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Trophy,
    color: "#34d399",
    goals: [
      { id: "g9", title: "Event bus with DLQ replay", effort: "L", risk: "low" },
      { id: "g10", title: "Arena A/B prompt testing", effort: "M", risk: "low" },
    ],
  },
];

const EFFORT_STYLE: Record<Goal["effort"], { label: string; color: string }> = {
  S: { label: "S · 1d", color: "#34d399" },
  M: { label: "M · 3d", color: "#06b6d4" },
  L: { label: "L · 1w", color: "#a855f7" },
};

const RISK_STYLE: Record<Goal["risk"], { label: string; color: string }> = {
  low: { label: "low risk", color: "#34d399" },
  med: { label: "med risk", color: "#fbbf24" },
  high: { label: "high risk", color: "#f43f5e" },
};

function GoalCard({ goal, delay }: { goal: Goal; delay: number }) {
  const effort = EFFORT_STYLE[goal.effort];
  const risk = RISK_STYLE[goal.risk];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] px-3 py-2.5 cursor-default"
    >
      <div className="text-base text-foreground/95 leading-snug mb-2 font-medium">
        {goal.title}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="rounded-full border px-2 py-0.5 text-base font-mono"
          style={{
            borderColor: `${effort.color}40`,
            backgroundColor: `${effort.color}12`,
            color: effort.color,
          }}
        >
          {effort.label}
        </span>
        <span
          className="rounded-full border px-2 py-0.5 text-base font-mono"
          style={{
            borderColor: `${risk.color}40`,
            backgroundColor: `${risk.color}12`,
            color: risk.color,
          }}
        >
          {risk.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function DevToolsLifecycle() {
  return (
    <div className="p-5">
      {/* Header: project selector */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
            <Target className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground leading-tight">
              personas-web
            </div>
            <div className="text-base font-mono text-foreground/55">
              10 goals · 3 active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-base font-mono">
          <span className="text-foreground/55 uppercase tracking-widest">
            Lifecycle
          </span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/[0.08] px-2 py-0.5 text-cyan-300">
            kanban
          </span>
        </div>
      </div>

      {/* 4-column kanban */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {COLUMNS.map((col, ci) => {
          const ColIcon = col.icon;
          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.1 }}
              className="rounded-xl border p-3 space-y-2 min-h-[280px]"
              style={{
                borderColor: `${col.color}30`,
                background: `linear-gradient(180deg, ${col.color}08 0%, transparent 60%)`,
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between pb-2 border-b border-foreground/[0.06]">
                <div className="flex items-center gap-1.5">
                  <ColIcon className="h-4 w-4" style={{ color: col.color }} />
                  <span
                    className="text-base font-mono uppercase tracking-widest font-bold"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  className="text-base font-mono font-bold tabular-nums"
                  style={{ color: col.color }}
                >
                  {col.goals.length}
                </span>
              </div>

              {/* Cards */}
              {col.goals.map((g, gi) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  delay={ci * 0.1 + 0.2 + gi * 0.08}
                />
              ))}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom metrics */}
      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex items-center justify-between text-base font-mono uppercase tracking-widest text-foreground/60">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
          2 shipped this week
        </span>
        <span>
          Velocity{" "}
          <span className="text-cyan-300 font-semibold">+18% vs last sprint</span>
        </span>
      </div>
    </div>
  );
}
