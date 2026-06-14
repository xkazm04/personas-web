"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  Server,
} from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import {
  MOCK_MODEL_PROVIDERS,
  MOCK_UPCOMING_ROUTINES,
} from "@/lib/mock-dashboard-data";
import { useOpenAlertCount } from "./useOpenAlertCount";

const ROTATE_MS = 3600;

type Tone = "emerald" | "cyan" | "purple" | "rose";

const TONE_CLASS: Record<Tone, string> = {
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  rose: "text-rose-400",
};

interface TickerItem {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  tone: Tone;
}

/**
 * Status Ticker — the slim live-status strip under the cockpit. Rotates through
 * fleet vitals (success, agents online, providers, next routine, open alerts).
 * Auto-advances only when motion is allowed and the tab is visible; otherwise
 * it lays every item out statically. The web counterpart to the desktop
 * overview's Status Ticker.
 */
export function StatusTicker({
  successRate,
  agents,
}: {
  successRate: number;
  agents: number;
}) {
  const { t } = useTranslation();
  const labels = t.dashboard.home.cockpit;
  const reduced = useReducedMotion() ?? false;
  const hidden = usePageVisibility();
  const openAlerts = useOpenAlertCount();

  const providers = MOCK_MODEL_PROVIDERS.filter((p) => p.allowed).length;
  const next = MOCK_UPCOMING_ROUTINES[0];

  const items: TickerItem[] = [
    { id: "success", icon: Activity, label: labels.tickerSuccess, value: `${successRate}%`, tone: "emerald" },
    { id: "agents", icon: Bot, label: labels.tickerAgents, value: `${agents}`, tone: "cyan" },
    { id: "providers", icon: Server, label: labels.tickerProviders, value: `${providers}`, tone: "purple" },
    ...(next ? [{ id: "routine", icon: CalendarClock, label: labels.tickerNextRoutine, value: `${next.persona} · ${next.eta}`, tone: "cyan" as Tone }] : []),
    openAlerts > 0
      ? { id: "alerts", icon: AlertTriangle, label: labels.tickerAlerts, value: `${openAlerts}`, tone: "rose" }
      : { id: "alerts", icon: CheckCircle2, label: labels.tickerAlerts, value: labels.tickerAllClear, tone: "emerald" },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (reduced || hidden || paused || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reduced, hidden, paused, count]);

  // Keep the index in range if the item count shrinks (e.g. alerts clear).
  const safeIndex = index % count;
  const active = items[safeIndex];
  const ActiveIcon = active.icon;

  return (
    <div
      data-tour-diagram="dashboard-ticker"
      className="flex items-center gap-3 overflow-hidden rounded-xl border border-glass bg-white/[0.02] px-4 py-2.5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="flex flex-shrink-0 items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          {!reduced && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-dark">
          {labels.tickerLabel}
        </span>
      </span>

      <span aria-hidden className="h-4 w-px flex-shrink-0 bg-glass" />

      {reduced ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.id} className="flex items-center gap-1.5 text-sm">
                <Icon className={`h-3.5 w-3.5 ${TONE_CLASS[item.tone]}`} />
                <span className="text-muted-dark">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </span>
            );
          })}
        </div>
      ) : (
        <>
          <div className="relative min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center gap-1.5 text-sm"
              >
                <ActiveIcon className={`h-3.5 w-3.5 flex-shrink-0 ${TONE_CLASS[active.tone]}`} />
                <span className="text-muted-dark">{active.label}</span>
                <span className="truncate font-semibold text-foreground">{active.value}</span>
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            {items.map((item, i) => (
              <span
                key={item.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeIndex ? "w-4 bg-emerald-400/80" : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
