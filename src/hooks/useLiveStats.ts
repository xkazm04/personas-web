"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import type {
  PlatformStats,
  PlatformStatsResponse,
  PlatformStatsSeries,
} from "@/app/api/stats/route";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

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

function buildFlatSeries(stats: PlatformStats): PlatformStatsSeries {
  const length = 7;
  return {
    totalUsers: Array(length).fill(stats.totalUsers),
    totalExecutions: Array(length).fill(stats.totalExecutions),
    totalTemplates: Array(length).fill(stats.totalTemplates),
    totalToolsConnected: Array(length).fill(stats.totalToolsConnected),
    totalAgents: Array(length).fill(stats.totalAgents),
    totalCliCommands: Array(length).fill(stats.totalCliCommands),
    coldStartSeconds: Array(length).fill(stats.coldStartSeconds),
    roadmapCompleted: Array(length).fill(stats.roadmapCompleted),
    roadmapTotal: Array(length).fill(stats.roadmapTotal),
  };
}

const FALLBACK_RESPONSE: PlatformStatsResponse = {
  ...FALLBACK_STATS,
  trend7d: { ...FALLBACK_STATS },
  series: buildFlatSeries(FALLBACK_STATS),
};

let cachedResult: PlatformStatsResponse | null = null;
// Warn-once gate: prevents Sentry flooding under React 19 strict-mode double
// effects and across remounts that share the same module-level cache miss.
let warnedOnce = false;

/**
 * Fetches and manages platform-wide statistics for the marketing site.
 *
 * Data Source Contract:
 * - Real Data: `totalUsers` reflects the live waitlist signup count (min 228).
 * - Mock/Aspirational: `totalExecutions`, `totalTemplates`, `totalAgents`, etc. are
 *   currently seeded with marketing defaults in the API route, though they can be
 *   overridden by a server-side `platform-counters.json` file.
 * - Trend Data: `trend7d` (value 7 days ago) and `series` (last 7 daily snapshots)
 *   are computed from raw values stored in `platform-counters-history.json`.
 *   Floors are NOT applied to trend math, so deltas show real growth only.
 * - Cadence: Fetched once per session (client-side cache). API response is cached
 *   on the server for 1 hour (SWR-ish).
 *
 * @returns {PlatformStatsResponse} Latest stats + trend metadata, or fallback defaults.
 */
export function useLiveStats(): PlatformStatsResponse {
  const [stats, setStats] = useState<PlatformStatsResponse>(cachedResult ?? FALLBACK_RESPONSE);

  useEffect(() => {
    if (cachedResult) return;

    let cancelled = false;
    let responseStatus: number | null = null;

    fetch("/api/stats")
      .then((res) => {
        responseStatus = res.status;
        if (!res.ok) throw new Error(`stats fetch failed: ${res.status}`);
        return res.json() as Promise<PlatformStatsResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        // Defensive: older cached server responses may lack trend fields.
        if (!data.series || !data.trend7d) {
          if (!warnedOnce) {
            warnedOnce = true;
            const shapeKeys = Object.keys(data);
            Sentry.captureMessage(
              "useLiveStats: /api/stats response missing series/trend7d",
              {
                level: "warning",
                tags: { scope: "useLiveStats", reason: "malformed-shape" },
                extra: { status: responseStatus, shapeKeys },
              },
            );
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                `[useLiveStats] /api/stats returned ${responseStatus} but missing series/trend7d. keys=${shapeKeys.join(",")}`,
              );
            }
          }
          return;
        }
        cachedResult = data;
        setStats(data);
      })
      .catch((err: unknown) => {
        if (warnedOnce) return;
        warnedOnce = true;
        captureExceptionScrubbed(err, {
          tags: { scope: "useLiveStats", reason: "fetch-failed" },
          extra: { status: responseStatus },
        });
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[useLiveStats] /api/stats fetch failed; using fallback",
            err,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
