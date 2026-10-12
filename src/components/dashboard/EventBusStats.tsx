"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Radio, Wifi, Zap } from "lucide-react";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";
import { useTranslation } from "@/i18n/useTranslation";
import { useNow } from "@/hooks/useNow";
import { throughput } from "@/lib/busProjection";
import { useAuthStore } from "@/stores/authStore";
import { useEventStore } from "@/stores/eventStore";

// ── Measured counters ─────────────────────────────────────────────────

// Read from the same event log as the ring and the list, so a number on this
// strip is a count of events the page can show.
function useMeasuredMetrics() {
  const events = useEventStore((s) => s.events);
  const now = useNow(5_000);
  return useMemo(() => throughput(events, now), [events, now]);
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
  const { perMinute, total, sources } = useMeasuredMetrics();
  const isDemo = useAuthStore((s) => s.isDemo);
  // The connection dot reflects the REAL stream status so it can't show green
  // "Connected" while the header's ConnectionStatusIndicator says reconnecting/polling.
  const connectionStatus = useEventStore((s) => s.connectionStatus);
  const connected = connectionStatus === "connected";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-wrap items-center gap-1 rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm ${className}`}
    >
      {/* The counters are measured, but in demo mode the log itself is a fixture. */}
      {isDemo && (
        <span className="ml-2 rounded-full border border-glass px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-dark">
          {t.common.demo}
        </span>
      )}

      <StatItem
        icon={Zap}
        label={t.eventsPage.events}
        value={perMinute}
        suffix="/min"
        pulse={perMinute > 0}
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      <StatItem
        icon={Activity}
        label={t.dashboardUi.totalLabel}
        value={total}
      />

      <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

      <StatItem
        icon={Radio}
        label={t.dashboardUi.connections}
        value={sources}
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
