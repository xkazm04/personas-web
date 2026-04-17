"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Play,
  CheckCircle2,
  Loader2,
  XCircle,
  Wrench,
  Terminal,
  Zap,
} from "lucide-react";

/* ── Variant A: Task Runner Console — mirrors sub_runner ── */
/* Three columns: queue · live output stream · self-healing actions */

interface QueueTask {
  id: string;
  label: string;
  project: string;
  status: "queued" | "running" | "done" | "failed";
  durationMs?: number;
}

const INITIAL_QUEUE: QueueTask[] = [
  { id: "1", label: "pnpm typecheck", project: "personas-web", status: "done", durationMs: 4218 },
  { id: "2", label: "pnpm test --changed", project: "personas-web", status: "done", durationMs: 11300 },
  { id: "3", label: "cargo build --release", project: "personas", status: "running" },
  { id: "4", label: "pnpm lint --fix", project: "personas-web", status: "queued" },
  { id: "5", label: "docker build agents-worker", project: "personas-cloud", status: "queued" },
];

const OUTPUT_LINES = [
  { text: "  Compiling tauri v2.0.0", color: "#a8ccd8" },
  { text: "  Compiling personas v0.3.1", color: "#a8ccd8" },
  { text: "warning: unused import `std::sync::Mutex`", color: "#fbbf24" },
  { text: "  --> src/agents/scheduler.rs:7:5", color: "#a8ccd8" },
  { text: "   | pub use std::sync::Mutex;", color: "#a8ccd8" },
  { text: "  Finished `release` profile in 19.6s", color: "#34d399" },
];

const HEALING_ACTIONS = [
  {
    icon: "🔍",
    label: "Detected: 1 warning (unused import)",
    action: "Auto-remove on next build",
    color: "#fbbf24",
  },
  {
    icon: "⚡",
    label: "Detected: type error in agents/auth.ts",
    action: "Quick fix applied — missing `async`",
    color: "#06b6d4",
  },
  {
    icon: "🛡️",
    label: "Detected: flaky test `user-auth.spec`",
    action: "Retry queued (1/3)",
    color: "#a855f7",
  },
];

export default function DevToolsRunner() {
  const reduced = useReducedMotion() ?? false;
  const [visibleOutputCount, setVisibleOutputCount] = useState(() =>
    reduced ? OUTPUT_LINES.length : 0,
  );
  const [tick, setTick] = useState(0);
  const [prevReduced, setPrevReduced] = useState(reduced);

  if (reduced !== prevReduced) {
    setPrevReduced(reduced);
    if (reduced) setVisibleOutputCount(OUTPUT_LINES.length);
  }

  /* Stream output lines line-by-line */
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setVisibleOutputCount((c) => {
        if (c >= OUTPUT_LINES.length) return 0; // loop
        return c + 1;
      });
      setTick((t) => t + 1);
    }, 900);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="p-5">
      <div className="grid md:grid-cols-[220px_1fr_240px] gap-3">
        {/* ── Column 1: Queue ──────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
            <Play className="h-4 w-4" />
            Queue · 5
          </div>
          <div className="space-y-1.5">
            {INITIAL_QUEUE.map((task, i) => {
              const statusColor =
                task.status === "done"
                  ? "#34d399"
                  : task.status === "running"
                    ? "#06b6d4"
                    : task.status === "failed"
                      ? "#f43f5e"
                      : "#64748b";
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-md border border-foreground/[0.08] bg-foreground/[0.02] px-2.5 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    {task.status === "done" && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: statusColor }} />
                    )}
                    {task.status === "running" && (
                      <Loader2
                        className="h-4 w-4 shrink-0 animate-spin"
                        style={{ color: statusColor }}
                      />
                    )}
                    {task.status === "failed" && (
                      <XCircle className="h-4 w-4 shrink-0" style={{ color: statusColor }} />
                    )}
                    {task.status === "queued" && (
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                    )}
                    <span className="text-base font-mono text-foreground/90 truncate">
                      {task.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-base font-mono text-foreground/55">
                    <span className="truncate">{task.project}</span>
                    {task.durationMs && (
                      <span className="tabular-nums">
                        {(task.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Column 2: Live output ────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
            <Terminal className="h-4 w-4" />
            Live output · cargo build --release
          </div>
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/[0.04] overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-foreground/[0.08] px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-400/60" />
              <div className="h-2 w-2 rounded-full bg-amber-400/60" />
              <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
              <span className="ml-2 text-base font-mono text-foreground/55">
                output.stream
              </span>
              <span className="ml-auto flex items-center gap-1 text-base font-mono text-cyan-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                streaming
              </span>
            </div>
            <div className="p-3 h-[220px] overflow-y-auto scrollbar-hide font-mono text-base space-y-0.5">
              {OUTPUT_LINES.slice(0, visibleOutputCount).map((line, i) => (
                <motion.div
                  key={`${tick}-${i}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ color: line.color }}
                >
                  {line.text}
                </motion.div>
              ))}
              {visibleOutputCount > 0 && visibleOutputCount < OUTPUT_LINES.length && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block text-cyan-300"
                >
                  ▌
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* ── Column 3: Self-healing ────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
            <Zap className="h-4 w-4" />
            Self-healing
          </div>
          <div className="space-y-2">
            {HEALING_ACTIONS.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-lg border px-3 py-2.5"
                style={{
                  borderColor: `${a.color}30`,
                  backgroundColor: `${a.color}08`,
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-lg leading-none">{a.icon}</span>
                  <div className="text-base text-foreground/90 leading-snug font-medium">
                    {a.label}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-foreground/[0.06]">
                  <Wrench
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: a.color }}
                  />
                  <span
                    className="text-base font-mono"
                    style={{ color: a.color }}
                  >
                    {a.action}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex items-center justify-between text-base font-mono uppercase tracking-widest text-foreground/60">
        <span>
          Active project:{" "}
          <span className="text-cyan-300 font-semibold">personas-web</span>
        </span>
        <span>
          Pass rate{" "}
          <span className="text-brand-emerald font-semibold tabular-nums">
            94%
          </span>
          {" · "}Avg{" "}
          <span className="text-cyan-300 font-semibold tabular-nums">7.6s</span>
        </span>
      </div>
    </div>
  );
}
