"use client";

import { useEventStore } from "@/stores/eventStore";
import { useTranslation } from "@/i18n/useTranslation";

const config = {
  connected: {
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    ping: true,
    pingColor: "bg-emerald-400/60",
  },
  reconnecting: {
    dot: "bg-amber-400",
    glow: "shadow-[0_0_6px_rgba(251,191,36,0.6)]",
    ping: true,
    pingColor: "bg-amber-400/60",
  },
  polling: {
    dot: "bg-white/30",
    glow: "",
    ping: false,
    pingColor: "",
  },
} as const;

export default function ConnectionStatusIndicator() {
  const status = useEventStore((s) => s.connectionStatus);
  const { t } = useTranslation();
  const c = config[status];
  const label = t.eventsPage.connectionStatus[status];

  return (
    <span
      className="relative inline-flex items-center gap-1.5 cursor-default group"
      title={label}
      aria-label={label}
    >
      <span className="relative flex h-2 w-2">
        {c.ping && (
          <span
            className={`absolute inset-0 animate-ping rounded-full ${c.pingColor}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-500 ${c.dot} ${c.glow}`}
        />
      </span>
      <span className="text-xs text-muted-dark opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
        {label}
      </span>
    </span>
  );
}
