"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Radio, Wifi, Zap } from "lucide-react";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";

// ── Simulated live counters ───────────────────────────────────────────

function useSimulatedMetrics() {
  const [eventsPerSec, setEventsPerSec] = useState(24);
  const [totalEvents, setTotalEvents] = useState(148_302);
  const [activeConnections, setActiveConnections] = useState(11);

  useEffect(() => {
    const interval = setInterval(() => {
      setEventsPerSec((v) => Math.max(5, v + Math.floor(Math.random() * 7 - 3)));
      setTotalEvents((v) => v + Math.floor(Math.random() * 12 + 1));
      setActiveConnections((v) =>
        Math.max(6, Math.min(18, v + (Math.random() > 0.5 ? 1 : -1))),
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { eventsPerSec, totalEvents, activeConnections };
}

// ── Stat item ─────────────────────────────────────────────────────────

function StatItem({
  icon: Icon,
  label,
  value,
  suffix,
  pulse,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  pulse?: boolean;
}) {
  const animated = useAnimatedNumber(value, 400);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-dark" />
      <span className="text-sm text-muted-dark whitespace-nowrap">{label}</span>
      <span
        className={`text-base font-semibold tabular-nums text-foreground ${
          pulse ? "animate-pulse" : ""
        }`}
      >
        {suffix
          ? `${Math.round(animated).toLocaleString()}${suffix}`
          : Math.round(animated).toLocaleString()}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────

export default function EventBusStats({ className = "" }: { className?: string }) {
  const { eventsPerSec, totalEvents, activeConnections } = useSimulatedMetrics();
  const [connected] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-wrap items-center gap-1 rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm ${className}`}
    >
      <StatItem
        icon={Zap}
        label="Events/sec"
        value={eventsPerSec}
        pulse
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      <StatItem
        icon={Activity}
        label="Total"
        value={totalEvents}
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      <StatItem
        icon={Radio}
        label="Connections"
        value={activeConnections}
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Wifi className="h-3.5 w-3.5 text-muted-dark" />
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                connected
                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                  : "bg-red-400"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-emerald-400">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </span>
      </div>
    </motion.div>
  );
}
