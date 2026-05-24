"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";

import { COLUMNS } from "./dev-tools-lifecycle/devToolsLifecycleData";
import { GoalCard } from "./dev-tools-lifecycle/GoalCard";

export default function DevToolsLifecycle() {
  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
            <Target className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground leading-tight">
              personas-web
            </div>
            <div className="text-base font-mono text-foreground/60">
              10 goals - 3 active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-base font-mono">
          <span className="text-foreground/60 uppercase tracking-widest">
            Lifecycle
          </span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/[0.08] px-2 py-0.5 text-cyan-300">
            kanban
          </span>
        </div>
      </div>

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

              {col.goals.map((goal, gi) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  delay={ci * 0.1 + 0.2 + gi * 0.08}
                />
              ))}
            </motion.div>
          );
        })}
      </div>

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
