"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { DEVELOPMENT } from "@/lib/dev";
import { useAuthStore } from "@/stores/authStore";
import { getSyncedSla } from "@/lib/supabaseApi";
import {
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
  type SLABreach,
  type SLATarget,
} from "@/lib/mock-dashboard-data";

export interface SlaData {
  targets: SLATarget[];
  breaches: SLABreach[];
  loading: boolean;
  error: string | null;
}

/**
 * SLA data source. Dev/demo → the static mock (unchanged). Real/supabase mode →
 * app-defined default objectives computed against synced executions by
 * getSyncedSla (no desktop-side SLA config exists).
 */
export function useSlaData(): SlaData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = DEVELOPMENT || isDemo;

  const [targets, setTargets] = useState<SLATarget[]>(
    useMock ? MOCK_SLA_TARGETS : [],
  );
  const [breaches, setBreaches] = useState<SLABreach[]>(
    useMock ? MOCK_SLA_BREACHES : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock/demo mode is decided once per session; the useState initializers
    // above already seed the mock fixtures, so the effect only drives the
    // async real-data fetch.
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
        Sentry.captureException(err, { tags: { scope: "useSlaData" } });
        setError(err instanceof Error ? err.message : "Failed to load SLA data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { targets, breaches, loading, error };
}
