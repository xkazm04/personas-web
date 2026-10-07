"use client";

import { useMemo } from "react";
import { MoreHorizontal, Pause, Play } from "lucide-react";
import { usePersona } from "@/stores/personaStore";
import { useCommandStore } from "@/stores/commandStore";
import { useExecutionStore } from "@/stores/executionStore";
import { displayEnabled, isTerminal, latestForPersona } from "@/lib/commands/commandReducer";
import { derivePersonaRow, personaRuns, reportedCancelledId, type PersonaRowState } from "@/lib/commands/personaRow";
import { actionsEnabled } from "@/lib/sync/reachability";
import { desktopUnsupported } from "@/lib/sync/desktopUnsupported";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import CommandChip from "./CommandChip";
import { sendPersonaAction } from "./personaActions";
import { mobileCopy } from "@/i18n/pending/mobile";

interface Props {
  id: string;
  reach: SyncReachability;
  onOpenDetail: (id: string) => void;
  onOpenActions: (id: string) => void;
}

const STATE_TONE: Record<PersonaRowState, string> = {
  running: "text-brand-cyan",
  paused: "text-muted-dark",
  failed: "text-rose-400",
  idle: "text-emerald-400",
};

/**
 * One persona on the phone: glyph, name and state (Running / Paused / Failed /
 * Idle), a 44 px Pause/Resume button, a 44 px overflow button (Run..., Cancel
 * run), and the chip of its latest command. Actions are gated by the
 * reachability tier of the desktop that owns the persona and by no open
 * command; tapping the name opens the detail sheet, which is read-only and
 * stays available offline. The on/off state shown is the command's reported
 * result until the synced persona catches up (displayEnabled).
 */
export default function PhonePersonaRow({ id, reach, onOpenDetail, onOpenActions }: Props) {
  const copy = mobileCopy.personas;
  const persona = usePersona(id);
  const latest = useCommandStore((s) => latestForPersona(s.inflight, id));
  const executions = useExecutionStore((s) => s.rawExecutions);
  const runsKnown = useExecutionStore((s) => s.executionsFetchedAt !== null);
  const runs = useMemo(() => personaRuns(executions, id), [executions, id]);
  if (!persona) return null;

  const { tier } = reach.tierFor(persona.deviceId);
  const enabled = displayEnabled(persona, latest);
  const row = derivePersonaRow({ enabled, runs, cancelledId: reportedCancelledId(latest) });
  const busy = latest !== null && !isTerminal(latest.status);
  // never-synced / no-account: the desktop is not there to ask, so offer no action at all.
  const showAction = tier !== "never-synced" && tier !== "no-account";
  const canAct = actionsEnabled(tier) && !busy;
  const toggleUnsupported = desktopUnsupported(enabled ? "pause" : "resume", tier, reach.desktopPlane);
  const label = (enabled ? copy.pauseLabel : copy.resumeLabel).replace("{name}", persona.name);
  // Before the runs first load, only Paused is known: claim no Idle / Running yet.
  const stateKnown = runsKnown || row.state === "paused";
  const stateText = !stateKnown
    ? "\u00a0"
    : row.state === "paused" && row.liveExecutionId
      ? copy.pausedRunning
      : copy.state[row.state];

  const onToggle = () => sendPersonaAction(enabled ? "pause" : "resume", persona.id);

  const action =
    "inline-flex min-h-[44px] min-w-[44px] flex-none items-center justify-center gap-1.5 rounded-xl border border-glass-hover text-base font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <li data-persona-row={persona.id} className="rounded-2xl border border-glass bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenDetail(persona.id)}
          aria-label={copy.openLabel.replace("{name}", persona.name)}
          className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-brand-cyan"
        >
          <span
            aria-hidden
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-glass-hover bg-white/[0.06] text-base font-bold text-foreground"
            // The persona's own color (data, not a theme token) tints its glyph when it has one.
            style={persona.color ? { backgroundColor: `${persona.color}33`, borderColor: `${persona.color}66` } : undefined}
          >
            {persona.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-medium text-foreground">{persona.name}</span>
            <span
              data-persona-state={stateKnown ? row.state : "loading"}
              className={`block truncate text-sm ${STATE_TONE[row.state]}`}
            >
              {stateText}
            </span>
          </span>
        </button>
        {showAction && (
          <>
            <button
              type="button"
              data-persona-action="toggle"
              onClick={onToggle}
              disabled={!canAct || toggleUnsupported}
              aria-label={label}
              className={`${action} px-3`}
            >
              {enabled ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
              {enabled ? copy.pause : copy.resume}
            </button>
            <button
              type="button"
              data-persona-action="more"
              onClick={() => onOpenActions(persona.id)}
              disabled={!canAct}
              aria-label={copy.moreLabel.replace("{name}", persona.name)}
              aria-haspopup="dialog"
              className={action}
            >
              <MoreHorizontal aria-hidden className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {showAction && toggleUnsupported && (
        <p data-persona-unsupported className="mt-2 pl-[3.25rem] text-sm text-muted-dark">
          {mobileCopy.reach.desktopUnsupported}
        </p>
      )}
      {latest && (
        <div className="mt-2 pl-[3.25rem]">
          <CommandChip command={latest} />
        </div>
      )}
    </li>
  );
}
