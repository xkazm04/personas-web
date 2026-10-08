"use client";

import { useEffect, useState } from "react";

import { usePageVisibility } from "@/hooks/usePageVisibility";

/** Default cadence for relative-time labels (matches the activity stream). */
export const REL_TIME_TICK_MS = 30_000;

/**
 * A coarse shared clock for relative-time labels.
 *
 * Returns epoch-milliseconds held in state, advanced on a fixed interval. Two
 * properties matter:
 *
 * - **Purity** — components read the current time from state instead of calling
 *   `Date.now()` during render or inside a `useMemo` factory, which React 19's
 *   compiler rules forbid. The only impure reads happen in the lazy initializer
 *   and inside the interval callback.
 * - **Tab-visibility** — the interval is suspended while the tab is hidden and,
 *   on resume, catches up immediately via `queueMicrotask` so labels never show
 *   a stale value for up to a full tick. Same shape as `RecentActivityCard`.
 */
export function useLiveClock(tickMs: number = REL_TIME_TICK_MS): number {
  const [now, setNow] = useState(() => Date.now());
  const hidden = usePageVisibility();

  useEffect(() => {
    if (hidden) return;
    queueMicrotask(() => setNow(Date.now()));
    const interval = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(interval);
  }, [hidden, tickMs]);

  return now;
}
