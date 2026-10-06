"use client";

import { Pause, Play } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { usePersona } from "@/stores/personaStore";
import { useCommandStore } from "@/stores/commandStore";
import { displayEnabled, isTerminal, latestForPersona } from "@/lib/commands/commandReducer";
import { actionsEnabled } from "@/lib/sync/reachability";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import CommandChip from "./CommandChip";

interface Props {
  id: string;
  reach: SyncReachability;
  demo: boolean;
}

/**
 * One persona on the phone: glyph, name, Active/Paused, a 44 px Pause/Resume
 * button gated by the reachability tier of the desktop that owns it, and the
 * chip of its latest command. The on/off state shown is the command's
 * reported result until the synced persona catches up (displayEnabled).
 */
export default function PhonePersonaRow({ id, reach, demo }: Props) {
  const { t } = useTranslation();
  const copy = t.mobile.personas;
  const persona = usePersona(id);
  const latest = useCommandStore((s) => latestForPersona(s.inflight, id));
  const send = useCommandStore((s) => s.send);
  if (!persona) return null;

  const { tier } = reach.tierFor(persona.deviceId);
  const enabled = displayEnabled(persona, latest);
  const busy = latest !== null && !isTerminal(latest.status);
  // never-synced / no-account: the desktop is not there to ask, so offer no action at all.
  const showAction = tier !== "never-synced" && tier !== "no-account";
  const canAct = actionsEnabled(tier) && !busy;
  const label = (enabled ? copy.pauseLabel : copy.resumeLabel).replace("{name}", persona.name);

  const onToggle = () => {
    void send(enabled ? "pause_persona" : "resume_persona", {
      personaId: persona.id,
      deviceId: persona.deviceId ?? reach.fallbackDeviceId,
      demo,
    });
  };

  return (
    <li data-persona-row={persona.id} className="rounded-2xl border border-glass bg-white/[0.02] p-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-glass-hover bg-white/[0.06] text-base font-bold text-foreground"
          // The persona's own color (data, not a theme token) tints its glyph when it has one.
          style={persona.color ? { backgroundColor: `${persona.color}33`, borderColor: `${persona.color}66` } : undefined}
        >
          {persona.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-foreground">{persona.name}</p>
          <p data-persona-state={enabled ? "active" : "paused"} className={`text-sm ${enabled ? "text-emerald-400" : "text-muted-dark"}`}>
            {enabled ? copy.active : copy.paused}
          </p>
        </div>
        {showAction && (
          <button
            type="button"
            onClick={onToggle}
            disabled={!canAct}
            aria-label={label}
            className="inline-flex min-h-[44px] min-w-[44px] flex-none items-center justify-center gap-1.5 rounded-xl border border-glass-hover px-3 text-base font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enabled ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
            {enabled ? copy.pause : copy.resume}
          </button>
        )}
      </div>
      {latest && (
        <div className="mt-2 pl-[3.25rem]">
          <CommandChip command={latest} />
        </div>
      )}
    </li>
  );
}
