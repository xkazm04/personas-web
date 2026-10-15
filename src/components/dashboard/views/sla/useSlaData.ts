"use client";

import { useEffect, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { useDemoThreads } from "@/hooks/useDemoThreads";
import { useAuthStore } from "@/stores/authStore";
import { getSyncedSla } from "@/lib/supabaseApi";
import type { SLABreach, SLATarget } from "@/lib/mock-dashboard-data";

export interface SlaData {
  targets: SLATarget[];
  breaches: SLABreach[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * SLA data source. Dev/demo → the mock fixtures as this session sees them
 * (`useDemoThreads`: a fixed incident cause closes its breach and takes its
 * target out of active breach, keeping the budget it consumed). Real/supabase
 * mode → app-defined default objectives computed against synced executions by
 * getSyncedSla (no desktop-side SLA config exists).
 */
export function useSlaData(): SlaData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;
  const demo = useDemoThreads();

  const [targets, setTargets] = useState<SLATarget[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Mock/demo mode is decided once per session and reads the projection
    // synchronously, so the effect only drives the async real-data fetch.
    if (useMock) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getSyncedSla();
        if (cancelled) return;
        setTargets(data.targets);
        setBreaches(data.breaches);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        captureExceptionScrubbed(err, { tags: { scope: "useSlaData" } });
        setError(err instanceof Error ? err.message : "Failed to load SLA data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  const retry = () => setReloadKey((k) => k + 1);
  if (useMock) {
    return { targets: demo.slaTargets, breaches: demo.slaBreaches, loading: false, error: null, retry };
  }
  return { targets, breaches, loading, error, retry };
}
