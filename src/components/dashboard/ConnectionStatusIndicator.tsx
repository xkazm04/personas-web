"use client";

import { useEventStore } from "@/stores/eventStore";
import { useTranslation } from "@/i18n/useTranslation";

const config = {
  connected: {
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    ping: true,
    pingColor: "bg-emerald-400/60",
    // Healthy: stay clean, reveal the label only on hover/focus.
    persistent: false,
    pill: "",
    text: "text-muted-dark",
  },
  reconnecting: {
    dot: "bg-amber-400",
    glow: "shadow-[0_0_6px_rgba(251,191,36,0.6)]",
    ping: true,
    pingColor: "bg-amber-400/60",
    // Degraded: always show a labelled pill so the state is unmissable.
    persistent: true,
    pill: "bg-amber-400/12 border border-amber-400/30",
    text: "text-amber-300",
  },
  polling: {
    dot: "bg-white/40",
    glow: "",
    ping: false,
    pingColor: "",
    // Degraded (delayed): always show a labelled pill.
    persistent: true,
    pill: "bg-surface border border-glass",
    text: "text-muted-dark",
  },
} as const;

export default function ConnectionStatusIndicator() {
  const status = useEventStore((s) => s.connectionStatus);
  const { t } = useTranslation();
  const c = config[status];
  const label = t.eventsPage.connectionStatus[status];

  return (
    <span
      className={`group relative inline-flex cursor-default items-center gap-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        c.persistent ? `px-2 py-0.5 ${c.pill}` : ""
      }`}
      role="status"
      tabIndex={0}
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
      <span
        className={`whitespace-nowrap text-xs transition-opacity ${c.text} ${
          c.persistent
            ? ""
            : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
