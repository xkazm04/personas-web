"use client";

import { useId, useMemo, useState } from "react";
import BottomSheet from "@/components/primitives/BottomSheet";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useI18nStore } from "@/stores/i18nStore";
import { usePersona } from "@/stores/personaStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useCommandStore } from "@/stores/commandStore";
import { displayEnabled, latestForPersona } from "@/lib/commands/commandReducer";
import { personaRuns } from "@/lib/commands/personaRow";
import { formatCost, formatDuration } from "@/lib/format";
import { formatDue } from "@/lib/review-sla";
import type { PersonaExecution } from "@/lib/types";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import ChatPanel from "./chat/ChatPanel";
import { mobileCopy } from "@/i18n/pending/mobile";

/** The detail sheet's tabs: Activity (runs) and Chat (PHASE2-SPEC.md 5.2, 5.3). */
type DetailTab = "activity" | "chat";
const TABS: readonly DetailTab[] = ["activity", "chat"];

/** The sheet around the chat panel: handle, title row, tab strip, bottom padding. */
const SHEET_CHROME_PX = 175;

interface Props {
  open: boolean;
  personaId: string | null;
  /** The online gate (Chat's composer) and its clock: "started 3 minutes ago" is judged against `now`, never `Date.now()` in render. */
  reach: SyncReachability;
  onClose: () => void;
}

/** How many of the persona's runs the Activity tab lists. */
const ACTIVITY_LIMIT = 10;

/**
 * Tapping a persona row opens this (PHASE2-SPEC.md 6.2): **Activity** lists
 * the persona's last runs (status, started, duration, cost when there is one)
 * from `executionStore`, so a run started from the phone appears and moves
 * here live. **Chat** is the persona's chat (`ChatPanel`: threads ->
 * transcript -> composer). Both read in every tier, offline included; only
 * Chat's composer follows the online gate.
 */
export default function PersonaDetailSheet({ open, personaId, reach, onClose }: Props) {
  const copy = mobileCopy.personas;
  const baseId = useId();
  const persona = usePersona(personaId);
  const latest = useCommandStore((s) => (personaId ? latestForPersona(s.inflight, personaId) : null));
  const [tab, setTab] = useState<DetailTab>("activity");
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setTab("activity");
  }

  return (
    <BottomSheet open={open && persona !== undefined} onClose={onClose} title={persona?.name} keyboardSafe>
      <div role="tablist" aria-label={copy.detailTabsLabel} className="mb-3 flex gap-1 rounded-xl border border-glass p-1">
        {TABS.map((id) => (
          <button
            key={id}
            id={`${baseId}-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`${baseId}-panel`}
            onClick={() => setTab(id)}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
              tab === id ? "bg-brand-cyan/15 text-foreground" : "text-muted-dark hover:text-foreground"
            }`}
          >
            {copy.tabs[id]}
          </button>
        ))}
      </div>
      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`} className="pb-2">
        {tab === "activity" && personaId && <ActivityPanel personaId={personaId} now={reach.now} />}
        {tab === "chat" && persona && (
          <ChatPanel
            threadKind="persona"
            personaId={persona.id}
            name={persona.name}
            ownerDeviceId={persona.deviceId ?? null}
            reach={reach}
            paused={!displayEnabled(persona, latest)}
            chromePx={SHEET_CHROME_PX}
          />
        )}
      </div>
    </BottomSheet>
  );
}

function ActivityPanel({ personaId, now }: { personaId: string; now: number }) {
  const copy = mobileCopy.personas;
  const executions = useExecutionStore((s) => s.rawExecutions);
  const loading = useExecutionStore((s) => s.executionsLoading);
  const error = useExecutionStore((s) => s.executionsError);
  const runs = useMemo(() => personaRuns(executions, personaId, ACTIVITY_LIMIT), [executions, personaId]);

  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-dark" aria-busy={loading}>
        {error ? copy.activityError : loading ? copy.activityLoading : copy.activityEmpty}
      </p>
    );
  }
  return (
    <ol aria-label={copy.tabs.activity} className="flex flex-col gap-2">
      {runs.map((run) => (
        <ActivityItem key={run.id} run={run} now={now} />
      ))}
    </ol>
  );
}

function ActivityItem({ run, now }: { run: PersonaExecution; now: number }) {
  const copy = mobileCopy.personas;
  const language = useI18nStore((s) => s.language);
  const startedMs = Date.parse(run.startedAt ?? run.createdAt);
  // Clamped into the past: a run that began after the clock's last 10 s tick still reads "ago".
  const started = Number.isFinite(startedMs) ? formatDue(Math.min(-1, startedMs - now), language) : null;

  return (
    <li data-activity-run={run.id} data-run-status={run.status} className="rounded-xl border border-glass bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={run.status} />
        {started && <span className="truncate text-sm text-muted-dark">{copy.runStarted.replace("{ago}", started)}</span>}
      </div>
      {(run.durationMs !== null || run.costUsd > 0) && (
        <p className="mt-1.5 flex flex-wrap gap-x-4 text-sm text-muted">
          {run.durationMs !== null && <span>{copy.runDuration.replace("{duration}", formatDuration(run.durationMs))}</span>}
          {run.costUsd > 0 && <span>{copy.runCost.replace("{cost}", formatCost(run.costUsd))}</span>}
        </p>
      )}
    </li>
  );
}
