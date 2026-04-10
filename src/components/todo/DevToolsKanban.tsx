"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lightbulb, ListChecks, Shield, Play, CheckCircle,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ── Types ─────────────────────────────────────────────────── */

type Priority = "CRITICAL" | "MEDIUM" | "LOW";
type ColumnId = "discovered" | "triaged" | "review" | "executing" | "complete";

interface WorkItem {
  id: number;
  title: string;
  priority: Priority;
  agent: string;
  column: ColumnId;
  progress: number; // 0-100, used when executing
  flashGreen: boolean;
}

interface Column {
  id: ColumnId;
  label: string;
  icon: typeof Lightbulb;
  color: string;
}

/* ── Static data ───────────────────────────────────────────── */

const COLUMNS: Column[] = [
  { id: "discovered", label: "Discovered", icon: Lightbulb, color: "#fbbf24" },
  { id: "triaged", label: "Triaged", icon: ListChecks, color: "#06b6d4" },
  { id: "review", label: "Review", icon: Shield, color: "#a855f7" },
  { id: "executing", label: "Executing", icon: Play, color: "#f43f5e" },
  { id: "complete", label: "Complete", icon: CheckCircle, color: "#34d399" },
];

const COLUMN_ORDER: ColumnId[] = COLUMNS.map((c) => c.id);

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string }> = {
  CRITICAL: { bg: "bg-red-500/20", text: "text-red-400" },
  MEDIUM: { bg: "bg-amber-500/20", text: "text-amber-400" },
  LOW: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
};

const INITIAL_ITEMS: Omit<WorkItem, "progress" | "flashGreen">[] = [
  { id: 1, title: "SQL injection in /api/search", priority: "CRITICAL", agent: "security-auditor", column: "review" },
  { id: 2, title: "Bundle size regression +40KB", priority: "MEDIUM", agent: "code-optimizer", column: "triaged" },
  { id: 3, title: "Missing ARIA labels on forms", priority: "MEDIUM", agent: "accessibility-checker", column: "discovered" },
  { id: 4, title: "Unused exports in src/utils", priority: "LOW", agent: "architecture-analyst", column: "discovered" },
  { id: 5, title: "Rate limiter missing on auth", priority: "CRITICAL", agent: "security-auditor", column: "executing" },
  { id: 6, title: "Lighthouse perf score -8pts", priority: "MEDIUM", agent: "ux-reviewer", column: "triaged" },
];

/* ── Helpers ────────────────────────────────────────────────── */

function nextColumn(col: ColumnId): ColumnId | null {
  const idx = COLUMN_ORDER.indexOf(col);
  return idx < COLUMN_ORDER.length - 1 ? COLUMN_ORDER[idx + 1] : null;
}

/* ── Sub-components ─────────────────────────────────────────── */

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-sm font-semibold leading-tight ${s.bg} ${s.text}`}>
      {priority}
    </span>
  );
}

function Card({ item }: { item: WorkItem }) {
  return (
    <motion.div
      layout
      layoutId={`card-${item.id}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: item.flashGreen
          ? "0 0 18px 4px rgba(52,211,153,0.45)"
          : "0 0 0px 0px rgba(0,0,0,0)",
      }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className="rounded-lg border border-white/10 bg-white/[0.04] p-3 space-y-2"
    >
      <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={item.priority} />
        <span className="text-sm text-muted-dark truncate">{item.agent}</span>
      </div>

      {/* Progress bar while executing */}
      {item.column === "executing" && (
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-rose-500"
            initial={{ width: "0%" }}
            animate={{ width: `${item.progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Completion indicator */}
      {item.column === "complete" && (
        <div className="h-1 w-full rounded-full bg-emerald-500/60" />
      )}
    </motion.div>
  );
}

function ColumnHeader({ column, count }: { column: Column; count: number }) {
  const Icon = column.icon;
  const isReview = column.id === "review";

  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} style={{ color: column.color }} />
      <span className="text-sm font-semibold text-foreground">{column.label}</span>
      <span
        className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-sm font-medium leading-none"
        style={{ backgroundColor: `${column.color}22`, color: column.color }}
      >
        {count}
      </span>
      {isReview && (
        <span className="text-sm text-purple-400 font-medium">Gate</span>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function DevToolsKanban() {
  const reducedMotion = useReducedMotion();
  const [items, setItems] = useState<WorkItem[]>(() =>
    INITIAL_ITEMS.map((it) => ({ ...it, progress: it.column === "executing" ? 42 : 0, flashGreen: false })),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Advance a random movable card to the next column every ~4s */
  const tick = useCallback(() => {
    setItems((prev) => {
      const movable = prev.filter((it) => it.column !== "complete");
      if (movable.length === 0) return prev;
      const pick = movable[Math.floor(Math.random() * movable.length)];
      const next = nextColumn(pick.column);
      if (!next) return prev;

      return prev.map((it) => {
        if (it.id !== pick.id) return it;
        const entering = next === "executing";
        const completing = next === "complete";
        return {
          ...it,
          column: next,
          progress: entering ? 0 : it.progress,
          flashGreen: completing,
        };
      });
    });
  }, []);

  /* Progress bar animation for executing items */
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.column === "executing" && it.progress < 100
            ? { ...it, progress: Math.min(it.progress + 18, 100) }
            : it,
        ),
      );
    }, 800);
    return () => clearInterval(progressTimer);
  }, []);

  /* Clear green flash after 1.2s */
  useEffect(() => {
    const flashTimer = setTimeout(() => {
      setItems((prev) => prev.map((it) => (it.flashGreen ? { ...it, flashGreen: false } : it)));
    }, 1200);
    return () => clearTimeout(flashTimer);
  }, [items]);

  /* Main cycle timer */
  useEffect(() => {
    if (reducedMotion) return;
    intervalRef.current = setInterval(tick, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick, reducedMotion]);

  const itemsInColumn = (colId: ColumnId) => items.filter((it) => it.column === colId);

  return (
    <SectionWrapper id="dev-tools-kanban" aria-label="Developer tools kanban board">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <SectionHeading>
          Built-in <GradientText>developer tools</GradientText>
        </SectionHeading>
        <p className="mt-4 text-lg text-muted-dark max-w-2xl mx-auto">
          Six integrated tools form an autonomous development lifecycle — scan, analyze,
          triage, execute, and learn without leaving the app.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        {/* Board container */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-4 sm:p-6 overflow-hidden">
          {/* Cycle badge */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-medium text-muted">
            Cycle #12
          </div>

          {/* Columns grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {COLUMNS.map((col) => {
              const colItems = itemsInColumn(col.id);
              const isReview = col.id === "review";
              return (
                <div
                  key={col.id}
                  className={`rounded-xl p-3 min-h-[220px] ${
                    isReview
                      ? "border-2 border-dashed border-purple-500/40 bg-purple-500/[0.04]"
                      : "border border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <ColumnHeader column={col} count={colItems.length} />
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {colItems.map((item) => (
                        <Card key={item.id} item={item} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flow arrows — desktop only, decorative */}
          <div className="hidden lg:flex items-center justify-around mt-4 px-8" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="flex items-center gap-1"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              >
                <div className="h-px w-10 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <svg width="8" height="10" viewBox="0 0 8 10" className="text-muted-dark">
                  <path d="M0 0 L8 5 L0 10Z" fill="currentColor" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Aggregate stats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-dark">
          <span>
            <span className="font-semibold text-foreground">12</span> completed today
          </span>
          <span className="hidden sm:inline text-muted-dark">·</span>
          <span>
            <span className="font-semibold text-foreground">96%</span> success
          </span>
          <span className="hidden sm:inline text-muted-dark">·</span>
          <span>
            <span className="font-semibold text-foreground">$1.24</span> total cost
          </span>
          <span className="hidden sm:inline text-muted-dark">·</span>
          <span>
            <span className="font-semibold text-foreground">47</span> memories
          </span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
