"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { MOCK_UPCOMING_ROUTINES, type RoutineTrigger } from "@/lib/mock-dashboard-data";

const TRIGGER_TINT: Record<RoutineTrigger, string> = {
  schedule: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
  polling: "border-purple-500/20 bg-purple-500/8 text-purple-400",
  webhook: "border-amber-500/20 bg-amber-500/8 text-amber-400",
  event: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
};

/**
 * Upcoming routines: the next scheduled runs across the fleet, each with its
 * persona, trigger type, and ETA. The web counterpart to the desktop
 * overview's UpcomingRoutinesCard.
 */
export function UpcomingRoutinesCard() {
  const { t } = useTranslation();
  const labels = t.dashboard.home.upcomingRoutines;

  return (
    <GlowCard accent="cyan" className="h-full p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        <span className="ml-auto text-sm text-muted-dark">{labels.subtitle}</span>
      </div>

      {MOCK_UPCOMING_ROUTINES.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-dark">{labels.empty}</p>
      ) : (
        <div className="space-y-1.5">
          {MOCK_UPCOMING_ROUTINES.map((routine) => (
            <Link
              key={routine.id}
              href="/dashboard/events"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: routine.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {routine.persona}
              </span>
              <span
                className={`flex-shrink-0 rounded-md border px-1.5 py-0.5 text-sm font-medium ${TRIGGER_TINT[routine.trigger]}`}
              >
                {labels.triggers[routine.trigger]}
              </span>
              <span className="w-8 flex-shrink-0 text-right text-sm tabular-nums text-muted-dark">
                {routine.eta}
              </span>
            </Link>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
