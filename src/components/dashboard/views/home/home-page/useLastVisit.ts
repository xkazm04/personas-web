"use client";

import { useEffect, useState } from "react";

import { DASHBOARD_LAST_VISIT_KEY } from "@/lib/constants";

const MIN_GAP_MS = 60_000;

// Reads the prior visit timestamp from localStorage on mount, then writes
// Date.now() back for the next return. Returns null when there is no prior
// visit, the storage value is malformed, the prior visit is <60s old
// (reload noise), or localStorage is unavailable (Safari private mode,
// embedded webviews with storage disabled, tracking-protection partitions).
export function useLastVisit(): number | null {
  const [lastVisitedAt, setLastVisitedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DASHBOARD_LAST_VISIT_KEY);
      const ts = stored !== null ? Number(stored) : NaN;
      if (Number.isFinite(ts) && Date.now() - ts > MIN_GAP_MS) {
        queueMicrotask(() => setLastVisitedAt(ts));
      }
      localStorage.setItem(DASHBOARD_LAST_VISIT_KEY, String(Date.now()));
    } catch {
      // Storage unavailable — degrade silently.
    }
  }, []);

  return lastVisitedAt;
}
