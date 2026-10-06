"use client";

import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Bot, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useSyncReachability } from "@/hooks/useSyncReachability";
import PhonePersonaRow from "./PhonePersonaRow";
import ReachabilityNotice from "./ReachabilityNotice";
import PersonaActionsSheet from "./PersonaActionsSheet";
import PersonaDetailSheet from "./PersonaDetailSheet";
import AthenaChatSheet, { AthenaRow } from "./chat/AthenaChatSheet";

/** One sheet at a time; `open` flips first so the sheet can slide out with its content. */
interface SheetState {
  kind: "detail" | "actions" | "athena";
  /** Unused for Athena, who is not a persona. */
  personaId: string;
  open: boolean;
}

/**
 * `/dashboard/personas` at phone width (PLAN M6 + M13, PHASE2-SPEC.md 6.2):
 * agent management, not the desktop stage. The reachability banner, then one
 * row per persona with its state (Running / Paused / Failed / Idle),
 * Pause/Resume and an overflow (Run..., Cancel run); a row opens its detail
 * sheet (Activity, Chat). Above the personas, a pinned **Athena** row opens
 * Athena's chat (PLAN M18). Reads `personaStore` and `executionStore` through the
 * `api` proxy, so demo (mockApi) and live (the sync mirror) share one path;
 * never `fleet.json`, which has no live counterpart.
 */
export default function PhonePersonas() {
  const { t } = useTranslation();
  const copy = t.mobile.personas;
  const demo = useAuthStore((s) => s.isDemo);
  const reach = useSyncReachability();
  const { ids, loading, error } = usePersonaStore(
    useShallow((s) => ({ ids: s.personaIds, loading: s.personasLoading, error: s.personasError })),
  );

  const [sheet, setSheet] = useState<SheetState | null>(null);
  const openDetail = useCallback((personaId: string) => setSheet({ kind: "detail", personaId, open: true }), []);
  const openActions = useCallback((personaId: string) => setSheet({ kind: "actions", personaId, open: true }), []);
  const openAthena = useCallback(() => setSheet({ kind: "athena", personaId: "", open: true }), []);
  const closeSheet = useCallback(() => setSheet((s) => (s ? { ...s, open: false } : s)), []);

  useEffect(() => {
    void usePersonaStore.getState().fetchPersonas();
    // Row states and Activity read the runs; live, Realtime keeps them current after this.
    void useExecutionStore.getState().fetchExecutions();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <Bot aria-hidden className="h-5 w-5 text-brand-cyan" />
        {copy.title}
      </h1>

      {reach.ready && <ReachabilityNotice reach={reach} />}

      <AthenaRow onOpen={openAthena} />

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
            <PhonePersonaRow key={id} id={id} reach={reach} onOpenDetail={openDetail} onOpenActions={openActions} />
          ))}
        </ul>
      )}

      {demo && <p className="text-sm text-muted-dark">{copy.demoNote}</p>}

      <PersonaDetailSheet
        open={sheet?.kind === "detail" && sheet.open}
        personaId={sheet?.kind === "detail" ? sheet.personaId : null}
        reach={reach}
        onClose={closeSheet}
      />
      <PersonaActionsSheet
        open={sheet?.kind === "actions" && sheet.open}
        personaId={sheet?.kind === "actions" ? sheet.personaId : null}
        reach={reach}
        onClose={closeSheet}
      />
      <AthenaChatSheet open={sheet?.kind === "athena" && sheet.open} reach={reach} onClose={closeSheet} />
    </div>
  );
}
