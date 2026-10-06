"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { Bot, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useSyncReachability } from "@/hooks/useSyncReachability";
import PhonePersonaRow from "./PhonePersonaRow";
import ReachabilityNotice from "./ReachabilityNotice";

/**
 * `/dashboard/personas` at phone width (PLAN M6 + M13, PHASE2-SPEC.md 6.2):
 * agent management, not the desktop stage. The reachability banner, then one
 * row per persona with its state and Pause/Resume. Reads `personaStore`
 * through the `api` proxy, so demo (mockApi) and live (the sync mirror) share
 * one path; never `fleet.json`, which has no live counterpart.
 */
export default function PhonePersonas() {
  const { t } = useTranslation();
  const copy = t.mobile.personas;
  const demo = useAuthStore((s) => s.isDemo);
  const reach = useSyncReachability();
  const { ids, loading, error } = usePersonaStore(
    useShallow((s) => ({ ids: s.personaIds, loading: s.personasLoading, error: s.personasError })),
  );

  useEffect(() => {
    void usePersonaStore.getState().fetchPersonas();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <Bot aria-hidden className="h-5 w-5 text-brand-cyan" />
        {copy.title}
      </h1>

      {reach.ready && <ReachabilityNotice reach={reach} />}

      {error && ids.length === 0 ? (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <p>{copy.error}</p>
          <button
            type="button"
            onClick={() => void usePersonaStore.getState().fetchPersonas({ force: true })}
            className="mt-2 inline-flex min-h-[44px] items-center rounded-xl border border-glass-hover px-4 text-base font-medium text-foreground"
          >
            {copy.retry}
          </button>
        </div>
      ) : loading && ids.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-dark" aria-busy="true">
          <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
          {copy.loading}
        </p>
      ) : ids.length === 0 ? (
        <p className="text-sm text-muted-dark">{copy.empty}</p>
      ) : (
        <ul aria-label={copy.title} className="flex flex-col gap-2">
          {ids.map((id) => (
            <PhonePersonaRow key={id} id={id} reach={reach} demo={demo} />
          ))}
        </ul>
      )}

      {demo && <p className="text-sm text-muted-dark">{copy.demoNote}</p>}
    </div>
  );
}
