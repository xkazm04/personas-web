"use client";

import { NO_RESOLVED_CAUSES, projectDemoThreads, type ThreadFixtures } from "@/lib/settleThread";
import { useAuthStore } from "@/stores/authStore";
import { useResolvedCausesStore } from "@/stores/resolvedCausesStore";

/**
 * The demo incident fixtures as this session sees them (lib/settleThread.ts),
 * for readers that take fixtures synchronously: the nav badges, SLA, the home
 * triage and alert count. Re-renders when a cause is fixed or reopened. A real
 * session never reads the fixed-cause slice; callers already gate their use of
 * the result on `isDemo`.
 */
export function useDemoThreads(): ThreadFixtures {
  const isDemo = useAuthStore((s) => s.isDemo);
  const resolved = useResolvedCausesStore((s) => (isDemo ? s.resolved : NO_RESOLVED_CAUSES));
  return projectDemoThreads(resolved);
}
