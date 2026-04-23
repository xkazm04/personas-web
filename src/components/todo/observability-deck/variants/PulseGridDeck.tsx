"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  PlayCircle,
  MessageCircle,
  Radio,
  Brain,
  ShieldAlert,
  Activity,
} from "lucide-react";
import TerminalChrome from "@/components/TerminalChrome";
import { BRAND_VAR } from "@/lib/brand-theme";
import AnimatedMetric from "../components/AnimatedMetric";
import { agentPool, eventPool, colorPool } from "../data";

type EventType =
  | "execution.completed"
  | "execution.started"
  | "message.sent"
  | "event.emitted"
  | "memory.stored"
  | "review.requested"
  | "knowledge.indexed"
  | "health.checked";

const EVENT_META: Record<EventType, { icon: typeof CheckCircle2; short: string; color: string }> =
  {
    "execution.completed": {
      icon: CheckCircle2,
      short: "done",
      color: BRAND_VAR.emerald,
    },
    "execution.started": {
      icon: PlayCircle,
      short: "run",
      color: BRAND_VAR.cyan,
    },
    "message.sent": {
      icon: MessageCircle,
      short: "msg",
      color: BRAND_VAR.cyan,
    },
    "event.emitted": {
      icon: Radio,
      short: "evt",
      color: BRAND_VAR.purple,
    },
    "memory.stored": {
      icon: Brain,
      short: "mem",
      color: BRAND_VAR.amber,
    },
    "review.requested": {
      icon: ShieldAlert,
      short: "rev",
      color: BRAND_VAR.rose,
    },
    "knowledge.indexed": {
      icon: Brain,
      short: "kb",
      color: BRAND_VAR.amber,
    },
    "health.checked": {
      icon: Activity,
      short: "ok",
      color: BRAND_VAR.blue,
    },
  };

interface Pulse {
  id: string;
  eventType: EventType;
  duration: number;
  cost: number;
  ts: number;
}

type Stats = Record<
  string,
  { pulses: Pulse[]; durations: number[]; totalCost: number; pulseCount: number }
>;

const MAX_PULSES_PER_AGENT = 6;
const MAX_SPARKLINE = 12;

export default function PulseGridDeck({
  filterPrefix,
  onClearFilter,
}: {
  filterPrefix: string | null;
  onClearFilter: () => void;
}) {
  const reduced = useReducedMotion();
  const [stats, setStats] = useState<Stats>(() =>
    Object.fromEntries(
      agentPool.map((a) => [
        a,
        { pulses: [] as Pulse[], durations: [] as number[], totalCost: 0, pulseCount: 0 },
      ]),
    ),
  );

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(
      () => {
        const agent = agentPool[Math.floor(Math.random() * agentPool.length)];
        const eventType = eventPool[
          Math.floor(Math.random() * eventPool.length)
        ] as EventType;
        const duration =
          eventType === "execution.completed"
            ? Math.random() * 4 + 0.5
            : eventType === "execution.started"
              ? 0
              : Math.random() * 0.8 + 0.05;
        const cost = eventType.startsWith("execution")
          ? Math.random() * 0.3
          : 0;
        const pulse: Pulse = {
          id: `${Date.now()}-${Math.random()}`,
          eventType,
          duration,
          cost,
          ts: Date.now(),
        };
        setStats((prev) => {
          const cur = prev[agent] ?? {
            pulses: [],
            durations: [],
            totalCost: 0,
            pulseCount: 0,
          };
          return {
            ...prev,
            [agent]: {
              pulses: [pulse, ...cur.pulses].slice(0, MAX_PULSES_PER_AGENT),
              durations: [duration, ...cur.durations].slice(0, MAX_SPARKLINE),
              totalCost: cur.totalCost + cost,
              pulseCount: cur.pulseCount + 1,
            },
          };
        });
      },
      900 + Math.random() * 700,
    );
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/80 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_60px_rgba(0,0,0,0.3)]">
      <TerminalChrome
        title="observability-deck"
        status="streaming"
        info="pulse grid"
        className="px-5 py-3"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.04] border-b border-foreground/[0.04]">
        <AnimatedMetric target={96.2} suffix="%" color={BRAND_VAR.emerald} label="Success rate" trend="+2.1%" />
        <AnimatedMetric target={3.4} suffix="s" color={BRAND_VAR.cyan} label="Avg duration" trend="-0.8s" />
        <AnimatedMetric target={0.14} prefix="$" suffix="" color={BRAND_VAR.amber} label="Avg cost" trend="-12%" />
        <AnimatedMetric target={12} suffix="" color={BRAND_VAR.purple} label="Active agents" trend="+3" />
      </div>

      <div className="divide-y divide-foreground/[0.04]">
        {agentPool.map((agent, i) => (
          <AgentLane
            key={agent}
            agent={agent}
            color={colorPool[i % colorPool.length]}
            stats={stats[agent]}
            filterPrefix={filterPrefix}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-foreground/[0.04] px-5 py-2.5 text-base font-mono tracking-wider uppercase text-foreground/70">
        {filterPrefix ? (
          <button
            type="button"
            onClick={onClearFilter}
            className="text-brand-cyan hover:text-brand-cyan/80 transition-colors cursor-pointer"
          >
            ← Show all
          </button>
        ) : (
          <span>Per-agent activity pulse</span>
        )}
        <span className="text-brand-emerald">auto-refreshing</span>
      </div>
    </div>
  );
}

function AgentLane({
  agent,
  color,
  stats,
  filterPrefix,
}: {
  agent: string;
  color: string;
  stats: Stats[string] | undefined;
  filterPrefix: string | null;
}) {
  const pulses = useMemo(() => {
    const raw = stats?.pulses ?? [];
    return filterPrefix
      ? raw.filter((p) => p.eventType.startsWith(filterPrefix))
      : raw;
  }, [stats, filterPrefix]);

  const durations = stats?.durations ?? [];
  const spark = useMemo(() => buildSparkline(durations), [durations]);
  const totalCost = stats?.totalCost ?? 0;
  const pulseCount = stats?.pulseCount ?? 0;
  const latest = pulses[0];
  const LatestIcon = latest ? EVENT_META[latest.eventType].icon : Activity;
  const latestMeta = latest ? EVENT_META[latest.eventType] : null;

  return (
    <div className="grid grid-cols-[132px_auto_1fr_auto] items-center gap-3 px-5 py-3">
      {/* Agent name + status dot */}
      <div className="flex items-center gap-2 min-w-0">
        <motion.span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          animate={
            latest
              ? { opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }
              : { opacity: 0.35 }
          }
          transition={{ duration: 1.2, repeat: latest ? Infinity : 0 }}
        />
        <span className="truncate text-base font-mono font-semibold text-foreground">
          {agent}
        </span>
      </div>

      {/* Latest event icon badge */}
      <div
        className="flex h-7 min-w-[60px] items-center justify-center gap-1.5 rounded-full border px-2 text-base font-mono uppercase tracking-widest font-semibold"
        style={{
          borderColor: latestMeta ? latestMeta.color : "rgba(127,127,127,0.3)",
          backgroundColor: latestMeta ? `${latestMeta.color}28` : "transparent",
          color: latestMeta ? latestMeta.color : "var(--muted-foreground, #888)",
        }}
      >
        <LatestIcon className="h-3.5 w-3.5" />
        {latestMeta?.short ?? "idle"}
      </div>

      {/* Pulse stream — icons only, no text */}
      <div className="relative h-7 flex items-center gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {pulses.map((p, i) => {
            const meta = EVENT_META[p.eventType];
            const Icon = meta.icon;
            return (
              <motion.span
                key={p.id}
                initial={{ opacity: 0, scale: 0.4, x: 14 }}
                animate={{ opacity: 1 - i * 0.12, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.3 }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border"
                style={{
                  borderColor: meta.color,
                  backgroundColor: `${meta.color}25`,
                  color: meta.color,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Right side: sparkline + count + cost — fixed columns */}
      <div className="flex items-center gap-3">
        <Sparkline values={spark} color={color} />
        <div className="flex flex-col items-end text-base font-mono leading-tight">
          <span className="tabular-nums text-foreground/90">{pulseCount}</span>
          <span className="tabular-nums text-foreground/55">
            ${totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function buildSparkline(values: number[]): number[] {
  if (values.length === 0) return [];
  return [...values].reverse();
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 64;
  const height = 20;
  if (values.length < 2) {
    return (
      <svg width={width} height={height}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      </svg>
    );
  }
  const max = Math.max(...values, 0.5);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} role="img" aria-label="Duration trend">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        opacity={0.9}
      />
    </svg>
  );
}
