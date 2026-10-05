"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import { api } from "@/lib/api";
import type { DailyMetric } from "@/lib/types";

/**
 * Deferred observability fetch for the dashboard home's Instruments Bay.
 *
 * The daily-metrics request is held back until the bay nears the viewport
 * (IntersectionObserver on `instrumentsRef`), then issued via SWR. Exposes the
 * loading/error/retry state so the Traffic & Errors chart can show a spinner
 * while in flight and a recoverable error on failure — instead of flashing (or
 * sticking on) the "no traffic yet" empty state.
 */
export function useDeferredObservability(): {
  instrumentsRef: React.RefObject<HTMLDivElement | null>;
  loadObservability: boolean;
  dailyMetrics: DailyMetric[];
  observabilityLoading: boolean;
  observabilityError: string | null;
  retryObservability: () => void;
  fetchedAt: number | null;
} {
  const instrumentsRef = useRef<HTMLDivElement | null>(null);
  const [loadObservability, setLoadObservability] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  const { data, isLoading, error, mutate } = useSWR(
    loadObservability ? "observability:daily" : null,
    api.getObservabilityDaily,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
      focusThrottleInterval: 60_000,
      onSuccess: () => setFetchedAt(Date.now()),
    },
  );

  const dailyMetrics = useMemo(() => data ?? [], [data]);

  // The ref sits on the always-present LazyMount wrapper, so the observer fires
  // regardless of whether the bay's children have hydrated yet.
  useEffect(() => {
    const target = instrumentsRef.current;
    if (!target || loadObservability) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadObservability(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadObservability]);

  return {
    instrumentsRef,
    loadObservability,
    dailyMetrics,
    observabilityLoading: isLoading,
    observabilityError:
      error instanceof Error ? error.message : error ? String(error) : null,
    retryObservability: () => void mutate(),
    fetchedAt,
  };
}
