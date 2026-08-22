"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import type {
  PlatformStats,
  PlatformStatsProvenance,
  PlatformStatsResponse,
  PlatformStatsSeries,
  StatProvenance,
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

const STAT_KEYS = Object.keys(FALLBACK_STATS) as (keyof PlatformStats)[];

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

/** Nothing here was measured — every fallback field is a typed constant. */
const FALLBACK_PROVENANCE: PlatformStatsProvenance = STAT_KEYS.reduce((acc, key) => {
  acc[key] = "seed";
  return acc;
}, {} as PlatformStatsProvenance);

const FALLBACK_RESPONSE: PlatformStatsResponse = {
  ...FALLBACK_STATS,
  trend7d: { ...FALLBACK_STATS },
  series: buildFlatSeries(FALLBACK_STATS),
  provenance: FALLBACK_PROVENANCE,
};

/**
 * Whether the numbers in hand came from the API or from the seed table.
 * - `pending`  — the first fetch is still in flight; you are looking at seeds.
 * - `live`     — the payload came from `/api/stats`.
 * - `fallback` — the fetch failed or came back malformed; you are looking at
 *   seeds and `fallbackReason` says why.
 */
export type LiveStatsStatus = "pending" | "live" | "fallback";

export type LiveStatsFallbackReason = "fetch-failed" | "malformed-shape";

export interface LiveStatsResult extends PlatformStatsResponse {
  /** Discriminant: never present a non-`live` result as a measurement. */
  status: LiveStatsStatus;
  /** Populated only when `status === "fallback"`. */
  fallbackReason: LiveStatsFallbackReason | null;
}

const PENDING_RESULT: LiveStatsResult = {
  ...FALLBACK_RESPONSE,
  status: "pending",
  fallbackReason: null,
};

function fallbackResult(reason: LiveStatsFallbackReason): LiveStatsResult {
  return { ...FALLBACK_RESPONSE, status: "fallback", fallbackReason: reason };
}

function liveResult(data: PlatformStatsResponse): LiveStatsResult {
  return {
    ...data,
    // A server that predates the `provenance` field would otherwise leave the
    // map undefined and every `isMeasuredStat` check would read as false —
    // which is the safe direction, but be explicit about it.
    provenance: data.provenance ?? FALLBACK_PROVENANCE,
    status: "live",
    fallbackReason: null,
  };
}

/**
 * The only sanctioned way to ask "may I show this number as a real one?".
 * Both halves must hold: the payload has to be live, AND the API has to have
 * tagged that particular metric as `measured` rather than `floored`/`seed`.
 */
export function isMeasuredStat(stats: LiveStatsResult, key: keyof PlatformStats): boolean {
  return stats.status === "live" && statProvenance(stats, key) === "measured";
}

/** Per-metric provenance, collapsed to `seed` whenever the result isn't live. */
export function statProvenance(
  stats: LiveStatsResult,
  key: keyof PlatformStats,
): StatProvenance {
  if (stats.status !== "live") return "seed";
  return stats.provenance?.[key] ?? "seed";
}

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
 * Failure Contract (why this hook returns more than the API does):
 * - The returned object is ALWAYS structurally complete, so a failed fetch used
 *   to be indistinguishable from a successful one — the caller got seed numbers
 *   with nothing marking them as seeds. `status` is the discriminant that closes
 *   that: `pending` before the first response, `live` once the API answers, and
 *   `fallback` (+ `fallbackReason`) when the fetch rejected or returned a
 *   malformed shape. In both non-`live` states every number is a typed constant
 *   from `FALLBACK_STATS`.
 * - Per-metric truth is a second axis: even a `live` payload mixes measurements
 *   with marketing floors, which the API discloses in `provenance`. Use
 *   {@link isMeasuredStat} (both axes at once) rather than reading a number and
 *   assuming it was counted.
 *
 * @returns {LiveStatsResult} Latest stats + trend metadata + provenance, or
 *   annotated fallback defaults.
 */
export function useLiveStats(): LiveStatsResult {
  const [stats, setStats] = useState<LiveStatsResult>(() =>
    cachedResult ? liveResult(cachedResult) : PENDING_RESULT,
  );

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
          // Keep the seeds, but stop pretending they are a result. The state
          // update is deliberately OUTSIDE the warn-once gate: warn-once is
          // about Sentry volume, and every consumer still needs the flag.
          setStats(fallbackResult("malformed-shape"));
          return;
        }
        cachedResult = data;
        setStats(liveResult(data));
      })
      .catch((err: unknown) => {
        if (!cancelled) setStats(fallbackResult("fetch-failed"));
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
