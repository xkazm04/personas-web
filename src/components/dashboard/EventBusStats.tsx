"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Radio, Wifi, Zap } from "lucide-react";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";
import { useTranslation } from "@/i18n/useTranslation";
import { useEventStore } from "@/stores/eventStore";

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
  const { t } = useTranslation();
  const { eventsPerSec, totalEvents, activeConnections } = useSimulatedMetrics();
  // The counters are simulated fixtures, but the connection dot must reflect the
  // REAL stream status so it can't show green "Connected" while the header's
  // ConnectionStatusIndicator says reconnecting/polling.
  const connectionStatus = useEventStore((s) => s.connectionStatus);
  const connected = connectionStatus === "connected";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-wrap items-center gap-1 rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm ${className}`}
    >
      {/* The throughput counters are illustrative, not synced telemetry. */}
      <span className="ml-2 rounded-full border border-glass px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-dark">
        {t.common.demo}
      </span>

      <StatItem
        icon={Zap}
        label={t.eventsPage.events}
        value={eventsPerSec}
        pulse
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      <StatItem
        icon={Activity}
        label={t.dashboardUi.totalLabel}
        value={totalEvents}
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      <StatItem
        icon={Radio}
        label={t.dashboardUi.connections}
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
                  : "bg-amber-400"
              }`}
            />
          </span>
          <span className={`text-sm font-medium ${connected ? "text-emerald-400" : "text-amber-400"}`}>
            {t.eventsPage.connectionStatus[connectionStatus]}
          </span>
        </span>
      </div>
    </motion.div>
  );
}
