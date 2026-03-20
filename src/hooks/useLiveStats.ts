"use client";

import { useEffect, useState } from "react";
import type { PlatformStats } from "@/app/api/stats/route";

const FALLBACK_STATS: PlatformStats = {
  totalUsers: 228,
  totalExecutions: 34_000,
  totalTemplates: 120,
  totalToolsConnected: 24,
  totalAgents: 42,
  totalCliCommands: 70,
  coldStartSeconds: 2,
  roadmapCompleted: 11,
  roadmapTotal: 15,
};

let cachedResult: PlatformStats | null = null;

/**
 * Fetches and manages platform-wide statistics for the marketing site.
 * 
 * Data Source Contract:
 * - Real Data: `totalUsers` reflects the live waitlist signup count (min 228).
 * - Mock/Aspirational: `totalExecutions`, `totalTemplates`, `totalAgents`, etc. are
 *   currently seeded with marketing defaults in the API route, though they can be
 *   overridden by a server-side `platform-counters.json` file.
 * - Cadence: Fetched once per session (client-side cache). API response is cached
 *   on the server for 1 hour (SWR-ish).
 * 
 * @returns {PlatformStats} The latest platform statistics or fallback defaults.
 */
export function useLiveStats(): PlatformStats {
  const [stats, setStats] = useState<PlatformStats>(cachedResult ?? FALLBACK_STATS);

  useEffect(() => {
    if (cachedResult) return;

    let cancelled = false;

    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("stats fetch failed");
        return res.json() as Promise<PlatformStats>;
      })
      .then((data) => {
        if (cancelled) return;
        cachedResult = data;
        setStats(data);
      })
      .catch(() => {
        // Silently fall back to hardcoded values
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
