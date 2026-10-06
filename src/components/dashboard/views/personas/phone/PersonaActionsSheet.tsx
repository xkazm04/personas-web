"use client";

import { useId, useMemo, useState } from "react";
import { Play, Square } from "lucide-react";
import BottomSheet from "@/components/primitives/BottomSheet";
import { useTranslation } from "@/i18n/useTranslation";
import { usePersona } from "@/stores/personaStore";
import { useCommandStore } from "@/stores/commandStore";
import { useExecutionStore } from "@/stores/executionStore";
import { displayEnabled, isTerminal, latestForPersona } from "@/lib/commands/commandReducer";
import {
  RUN_PROMPT_MAX,
  derivePersonaRow,
  isBeyondSyncWindow,
  personaRuns,
  reportedCancelledId,
  runParams,
} from "@/lib/commands/personaRow";
import { actionsEnabled } from "@/lib/sync/reachability";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import { sendCancel, sendRun } from "./personaActions";

interface Props {
  open: boolean;
  personaId: string | null;
  reach: SyncReachability;
  onClose: () => void;
}

const ITEM =
  "flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-glass-hover px-4 text-left text-base font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The row's overflow (PHASE2-SPEC.md 6.2): **Run...** opens a prompt in the
 * same sheet and sends `run_persona` with `{ prompt }`; **Cancel run** (only
 * while a run is queued or running) sends `cancel_execution` with
 * `{ executionId }` for the newest live run. Both go through the command
 * plane like Pause, so the row's chip follows them; the sheet closes on send.
 */
export default function PersonaActionsSheet({ open, personaId, reach, onClose }: Props) {
  const { t } = useTranslation();
  const copy = t.mobile.personas;
  const promptId = useId();
  const hintId = useId();
  const persona = usePersona(personaId) ?? null;
  const latest = useCommandStore((s) => (personaId ? latestForPersona(s.inflight, personaId) : null));
  const executions = useExecutionStore((s) => s.rawExecutions);
  const runs = useMemo(() => (personaId ? personaRuns(executions, personaId) : []), [executions, personaId]);

  const [mode, setMode] = useState<"menu" | "run">("menu");
  const [prompt, setPrompt] = useState("");
  // Each opening starts at the menu with an empty prompt (prev-state reset, React 19 rule).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMode("menu");
      setPrompt("");
    }
  }

  const name = persona?.name ?? "";
  const row = persona
    ? derivePersonaRow({ enabled: displayEnabled(persona, latest), runs, cancelledId: reportedCancelledId(latest) })
    : null;
  const live = row?.liveExecutionId ? runs.find((r) => r.id === row.liveExecutionId) ?? null : null;
  const busy = latest !== null && !isTerminal(latest.status);
  const canAct = persona !== null && actionsEnabled(reach.tierFor(persona.deviceId).tier) && !busy;
  const params = runParams(prompt);
  const tooLong = prompt.trim().length > RUN_PROMPT_MAX;

  const onRun = () => {
    if (!persona || !params) return;
    sendRun(persona.id, params.prompt);
    onClose();
  };
  const onCancelRun = () => {
    if (!persona || !live) return;
    sendCancel(persona.id, live.id);
    onClose();
  };

  return (
    <BottomSheet
      open={open && persona !== null}
      onClose={onClose}
      title={mode === "run" ? copy.runTitle.replace("{name}", name) : name}
    >
      {mode === "menu" ? (
        <div className="flex flex-col gap-2 pb-2">
          <button type="button" data-persona-action="run" onClick={() => setMode("run")} disabled={!canAct} className={ITEM}>
            <Play aria-hidden className="h-4 w-4 text-brand-cyan" />
            {copy.run}
          </button>
          {live && (
            <>
              <button type="button" data-persona-action="cancel" onClick={onCancelRun} disabled={!canAct} className={ITEM}>
                <Square aria-hidden className="h-4 w-4 text-rose-400" />
                {copy.cancelRun}
              </button>
              {isBeyondSyncWindow(live, reach.now) && <p className="text-sm text-muted-dark">{copy.cancelOldRun}</p>}
            </>
          )}
        </div>
      ) : (
        <form
          className="flex flex-col gap-3 pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            onRun();
          }}
        >
          <label htmlFor={promptId} className="text-sm font-medium text-foreground">
            {copy.runPromptLabel}
          </label>
          <textarea
            id={promptId}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            aria-describedby={hintId}
            aria-invalid={tooLong}
            // 16 px text: iOS zooms into any smaller input on focus.
            className="w-full resize-none rounded-xl border border-glass-hover bg-white/[0.03] p-3 text-base text-foreground placeholder:text-muted-dark focus-visible:outline-2 focus-visible:outline-brand-cyan"
          />
          <p id={hintId} className={`text-sm ${tooLong ? "text-rose-400" : "text-muted-dark"}`}>
            {tooLong ? copy.runTooLong.replace("{max}", String(RUN_PROMPT_MAX)) : copy.runPromptHint}
          </p>
          <button
            type="submit"
            disabled={!canAct || params === null}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-cyan/15 px-4 text-base font-medium text-foreground transition-colors hover:bg-brand-cyan/25 focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play aria-hidden className="h-4 w-4 text-brand-cyan" />
            {copy.runSend}
          </button>
        </form>
      )}
    </BottomSheet>
  );
}
