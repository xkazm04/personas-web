"use client";

import { ServerCog, Sparkles } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import { MOCK_FLEET_SESSIONS, type FleetSessionState } from "@/lib/mock-dashboard-data";

/**
 * Fleet sessions strip — Mission Control's session ledger with parked-state
 * classification: working / needs-you / finished / frozen. Needs-you sessions
 * sort first (they're the ones blocking on the operator), then working,
 * frozen, finished. Demo-only fixture data; the web counterpart to the
 * desktop's fleet footer cluster + attention lanes.
 */

const STATE_ORDER: FleetSessionState[] = ["needsYou", "working", "frozen", "finished"];

const STATE_TONE: Record<FleetSessionState, { dot: string; chip: string }> = {
  needsYou: { dot: "bg-violet-400", chip: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
  working: { dot: "bg-blue-400", chip: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
  frozen: { dot: "bg-orange-400", chip: "border-orange-500/30 bg-orange-500/10 text-orange-300" },
  finished: { dot: "bg-teal-400", chip: "border-teal-500/30 bg-teal-500/10 text-teal-300" },
};

export function FleetSessionsStrip() {
  const { t } = useTranslation();
  const labels = t.dashboard.home.fleetSessions;

  const sessions = [...MOCK_FLEET_SESSIONS].sort(
    (a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state),
  );
  const counts = sessions.reduce(
    (acc, s) => {
      acc[s.state] += 1;
      return acc;
    },
    { needsYou: 0, working: 0, frozen: 0, finished: 0 } as Record<FleetSessionState, number>,
  );

  return (
    <GlowCard accent="cyan" className="flex h-full flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ServerCog className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        {counts.needsYou > 0 && (
          <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-sm font-medium tabular-nums text-violet-300">
            {labels.needsYou.replace("{count}", String(counts.needsYou))}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-dark">
          {STATE_ORDER.map((state) =>
            counts[state] > 0 ? (
              <span key={state} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATE_TONE[state].dot}`} />
                {labels.states[state]}
                <span className="font-semibold tabular-nums text-foreground">{counts[state]}</span>
              </span>
            ) : null,
          )}
        </div>
      </div>

      <div className="-mx-1 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
          >
            <span className={`h-7 w-1 flex-shrink-0 rounded-full ${STATE_TONE[session.state].dot}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-foreground">{session.title}</span>
                {session.athenaActive && (
                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                    <Sparkles className="h-3 w-3" />
                    {labels.athenaOnIt}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-dark">{session.project}</p>
            </div>
            <span
              className={`inline-flex flex-shrink-0 items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${STATE_TONE[session.state].chip}`}
            >
              {labels.states[session.state]}
            </span>
            <span className="w-14 flex-shrink-0 text-right text-xs tabular-nums text-muted-dark">
              {relativeTime(session.lastActivityAt)}
            </span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}
