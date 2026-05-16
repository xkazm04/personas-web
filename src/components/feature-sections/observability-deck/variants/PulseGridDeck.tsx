"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import TerminalChrome from "@/components/TerminalChrome";
import { BRAND_VAR } from "@/lib/brand-theme";

import AnimatedMetric from "../components/AnimatedMetric";
import { agentPool, colorPool, eventPool } from "../data";
import { AgentLane } from "./pulse-grid-deck/AgentLane";
import {
  MAX_PULSES_PER_AGENT,
  MAX_SPARKLINE,
  type EventType,
  type Pulse,
  type Stats,
} from "./pulse-grid-deck/pulseGridTypes";

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
      agentPool.map((agent) => [
        agent,
        { pulses: [] as Pulse[], durations: [] as number[], totalCost: 0, pulseCount: 0 },
      ]),
    ),
  );

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
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
      const cost = eventType.startsWith("execution") ? Math.random() * 0.3 : 0;
      const pulse: Pulse = {
        id: `${Date.now()}-${Math.random()}`,
        eventType,
        duration,
        cost,
        ts: Date.now(),
      };

      setStats((prev) => {
        const current = prev[agent] ?? {
          pulses: [],
          durations: [],
          totalCost: 0,
          pulseCount: 0,
        };
        return {
          ...prev,
          [agent]: {
            pulses: [pulse, ...current.pulses].slice(0, MAX_PULSES_PER_AGENT),
            durations: [duration, ...current.durations].slice(0, MAX_SPARKLINE),
            totalCost: current.totalCost + cost,
            pulseCount: current.pulseCount + 1,
          },
        };
      });
    }, 900 + Math.random() * 700);
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
        {agentPool.map((agent, index) => (
          <AgentLane
            key={agent}
            agent={agent}
            color={colorPool[index % colorPool.length]}
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
            Show all
          </button>
        ) : (
          <span>Per-agent activity pulse</span>
        )}
        <span className="text-brand-emerald">auto-refreshing</span>
      </div>
    </div>
  );
}
