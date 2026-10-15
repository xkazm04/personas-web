"use client";

import { useEffect, useMemo, useState } from "react";

import { resolveScopeFilter, type Scope } from "@/lib/dashboardScope";
import { DEMO_SEED_NOW } from "@/lib/demoClock";
import { MOCK_PERSONAS } from "@/lib/mockData";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardFilterStore } from "@/stores/dashboardFilterStore";
import { usePersonaStore } from "@/stores/personaStore";

/**
 * The scope bar's choice, ready for `inScope`: the persona (with its name, for
 * rows keyed by name), the window and the instant it is measured back from.
 *
 * `now` is the demo's seed clock in the demo (its fixtures are anchored there,
 * so a window cuts them in the same place on every load) and, in real mode,
 * the time this view mounted: read once in a lazy initializer, never in render.
 * The persona resolves against the roster (`resolveScopeFilter`).
 */
export function useDashboardScope(): Scope {
  const personaId = useDashboardFilterStore((s) => s.personaId);
  const dateRange = useDashboardFilterStore((s) => s.dateRange);
  const customStart = useDashboardFilterStore((s) => s.customStart);
  const customEnd = useDashboardFilterStore((s) => s.customEnd);
  const isDemo = useAuthStore((s) => s.isDemo);
  const personas = usePersonaStore((s) => s.personas);
  const fetchPersonas = usePersonaStore((s) => s.fetchPersonas);
  const [mountedAt] = useState(() => Date.now());

  // Name-keyed rows need the roster; the fetch is cached, so this is free when
  // the scope bar has already loaded it.
  useEffect(() => {
    if (personaId !== null) void fetchPersonas();
  }, [personaId, fetchPersonas]);

  const now = isDemo ? DEMO_SEED_NOW : mountedAt;
  // The demo's roster is static: read it directly so a name-keyed row never
  // waits on the list fetch.
  const roster = personas.length > 0 || !isDemo ? personas : MOCK_PERSONAS;

  return useMemo(
    () => ({ filter: resolveScopeFilter({ personaId, dateRange, customStart, customEnd }, roster), now }),
    [personaId, roster, dateRange, customStart, customEnd, now],
  );
}
