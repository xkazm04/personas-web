"use client";

import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  Server,
} from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import {
  MOCK_MODEL_PROVIDERS,
  MOCK_UPCOMING_ROUTINES,
} from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { effectiveNextRunMs, untilLabel } from "./relativeLabels";
import { useLiveClock } from "./useLiveClock";
import { useOpenAlertCount } from "./useOpenAlertCount";

export type Tone = "emerald" | "cyan" | "purple" | "rose";

export const TONE_CLASS: Record<Tone, string> = {
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  rose: "text-rose-400",
};

export interface TickerItem {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  tone: Tone;
}

/**
 * The frames the Status Ticker rotates through, in order.
 *
 * Provider allow-list and the routine schedule are demo fixtures with no synced
 * source, so they are gated on `isDemo` — the same gate `VaultChangesCard` and
 * `InstrumentsBay` use. Without it the strip asserted demo numbers as fact in
 * supabase/orchestrator mode. Success rate, agent count and open alerts come
 * from live stores and are shown in both modes.
 *
 * The next-routine ETA is formatted against `useLiveClock` — the same countdown
 * `UpcomingRoutinesCard` renders, so the two can't disagree once the page has
 * been open a while.
 */
export function useTickerItems({
  successRate,
  agents,
}: {
  successRate: number;
  agents: number;
}): TickerItem[] {
  const { t } = useTranslation();
  const labels = t.dashboard.home.cockpit;
  const openAlerts = useOpenAlertCount();
  const isDemo = useAuthStore((s) => s.isDemo);
  const now = useLiveClock();

  const providers = isDemo ? MOCK_MODEL_PROVIDERS.filter((p) => p.allowed).length : null;
  const next = isDemo ? MOCK_UPCOMING_ROUTINES[0] : undefined;

  return [
    { id: "success", icon: Activity, label: labels.tickerSuccess, value: `${successRate}%`, tone: "emerald" },
    { id: "agents", icon: Bot, label: labels.tickerAgents, value: `${agents}`, tone: "cyan" },
    ...(providers != null
      ? [{ id: "providers", icon: Server, label: labels.tickerProviders, value: `${providers}`, tone: "purple" as Tone }]
      : []),
    ...(next
      ? [{
          id: "routine",
          icon: CalendarClock,
          label: labels.tickerNextRoutine,
          value: `${next.persona} · ${untilLabel(effectiveNextRunMs(next.nextRunAt, next.everyMinutes, now), now)}`,
          tone: "cyan" as Tone,
        }]
      : []),
    openAlerts > 0
      ? { id: "alerts", icon: AlertTriangle, label: labels.tickerAlerts, value: `${openAlerts}`, tone: "rose" }
      : { id: "alerts", icon: CheckCircle2, label: labels.tickerAlerts, value: labels.tickerAllClear, tone: "emerald" },
  ];
}
