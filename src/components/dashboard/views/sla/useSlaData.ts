"use client";

import { useEffect, useMemo, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { scopeSla } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { useDemoThreads } from "@/hooks/useDemoThreads";
import { useFocusParam } from "@/hooks/useFocusParam";
import { scopeHidAll } from "@/lib/dashboardScope";
import { useAuthStore } from "@/stores/authStore";
import { getSyncedSla } from "@/lib/supabaseApi";
import type { SLABreach, SLATarget } from "@/lib/mock-dashboard-data";

export interface SlaData {
  /** Objectives in the scope bar's persona (standing state: the window does not apply). */
  targets: SLATarget[];
  /** Breaches in the scope bar's persona that overlap its window; a `?focus=` breach always stays. */
  breaches: SLABreach[];
  /** The scope emptied a list that has rows (each list judged on its own). */
  scopeEmpty: { targets: boolean; breaches: boolean };
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * SLA data source. Dev/demo → the mock fixtures as this session sees them
 * (`useDemoThreads`: a fixed incident cause closes its breach and takes its
 * target out of active breach, keeping the budget it consumed). Real/supabase
 * mode → app-defined default objectives computed against synced executions by
 * getSyncedSla (no desktop-side SLA config exists). Either way the rows are
 * then cut to the scope bar's persona + window (`scopeSla`).
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
  const scope = useDashboardScope();
  const focusId = useFocusParam();
  const allTargets = useMock ? demo.slaTargets : targets;
  const allBreaches = useMock ? demo.slaBreaches : breaches;
  const scoped = useMemo(
    () => scopeSla({ targets: allTargets, breaches: allBreaches }, scope, focusId),
    [allTargets, allBreaches, scope, focusId],
  );
  const scopeEmpty = {
    targets: scopeHidAll(allTargets, scoped.targets),
    breaches: scopeHidAll(allBreaches, scoped.breaches),
  };
  if (useMock) {
    return { ...scoped, scopeEmpty, loading: false, error: null, retry };
  }
  return { ...scoped, scopeEmpty, loading, error, retry };
}
