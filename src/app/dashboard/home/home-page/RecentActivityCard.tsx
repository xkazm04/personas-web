"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { relativeTime } from "@/lib/format";
import type { GlobalExecution } from "@/lib/types";

const REL_TIME_TICK_MS = 30_000;
const PULSE_DURATION_S = 1.4;

const MotionLink = motion.create(Link);

type RecentExecution = GlobalExecution & {
  personaIcon?: string | null;
  personaColor?: string | null;
  personaName?: string | null;
};

export function RecentActivityCard({
  executions,
  runningCount,
  labels,
}: {
  executions: RecentExecution[];
  runningCount: number;
  labels: {
    title: string;
    running: string;
    noExecutionsYet: string;
    executeToSee: string;
  };
}) {
  // Force re-render every 30s so relativeTime() doesn't stay frozen on
  // "just now" while the user watches the page. Suspended while the tab
  // is hidden; resumes with an immediate refresh so timestamps catch up
  // to any time that passed in the background.
  const [, setTick] = useState(0);
  const hidden = usePageVisibility();
  useEffect(() => {
    if (hidden) return;
    queueMicrotask(() => setTick((n) => n + 1));
    const interval = setInterval(() => setTick((n) => n + 1), REL_TIME_TICK_MS);
    return () => clearInterval(interval);
  }, [hidden]);

  // AnimatePresence with initial={false} suppresses the entrance animation
  // on first paint, so only NEW execution ids that arrive afterward get
  // the cyan-tinted pulse. Honors prefers-reduced-motion.
  const reducedMotion = useReducedMotion();
  const pulseInitial = reducedMotion ? false : { backgroundColor: "rgba(6,182,212,0.14)" };
  const pulseAnimate = reducedMotion ? undefined : { backgroundColor: "rgba(6,182,212,0)" };

  return (
    <GlowCard accent="cyan" className="p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">
          {labels.title}
        </h2>
        {runningCount > 0 && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-2 py-0.5 text-sm font-medium text-cyan-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            {runningCount} {labels.running}
          </span>
        )}
      </div>

      {executions.length === 0 ? (
        <p className="text-sm text-muted-dark py-8 text-center">
          {labels.noExecutionsYet} {labels.executeToSee}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {executions.map((execution) => (
              <MotionLink
                key={execution.id}
                href="/dashboard/executions"
                layout={reducedMotion ? false : "position"}
                initial={pulseInitial}
                animate={pulseAnimate}
                transition={{ duration: PULSE_DURATION_S, ease: "easeOut", layout: { duration: 0.3, ease: "easeOut" } }}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
              >
                <PersonaAvatar
                  icon={execution.personaIcon}
                  color={execution.personaColor}
                  name={execution.personaName}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {execution.personaName ?? execution.personaId.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-dark">
                    {relativeTime(execution.startedAt ?? execution.createdAt)}
                    {execution.durationMs && ` - ${(execution.durationMs / 1000).toFixed(1)}s`}
                    {execution.costUsd > 0 && ` - $${execution.costUsd.toFixed(4)}`}
                  </p>
                </div>
                <StatusBadge status={execution.status} />
              </MotionLink>
            ))}
          </AnimatePresence>
        </div>
      )}
    </GlowCard>
  );
}
