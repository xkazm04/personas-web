"use client";

import { useId, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { useCommandStore } from "@/stores/commandStore";
import { isTerminal } from "@/lib/commands/commandReducer";
import { SAY_MAX_CHARS, channelSayOutcome, sayLength } from "@/lib/commands/channelSay";
import { actionsEnabled, type ReachabilityTier } from "@/lib/sync/reachability";
import { desktopUnsupported } from "@/lib/sync/desktopUnsupported";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import CommandChip from "./CommandChip";
import { mobileCopy, type MobileCopy } from "@/i18n/pending/mobile";

type SayCopy = MobileCopy["say"];

interface Props {
  personaId: string;
  name: string;
  /** The persona's own device: where the direction goes. */
  deviceId: string | null;
  reach: SyncReachability;
}

/**
 * Why Send is off, or null when it is on: the same gate as the other signed
 * verbs (online and paired, or the demo; not the desktop's local API), plus a
 * persona with no device to send to. null tier = not judged yet: off, no reason.
 */
export function sayDisabledReason(copy: SayCopy, tier: ReachabilityTier | null, desktopPlane: boolean, deviceId: string | null): string | null {
  if (tier === null) return "";
  if (desktopUnsupported("channelSay", tier, desktopPlane)) return copy.disabled.desktop;
  if (!actionsEnabled(tier)) {
    return tier === "offline" ? copy.disabled.offline : tier === "online-unpaired" ? copy.disabled.unpaired : copy.disabled.never;
  }
  return tier !== "demo" && !deviceId ? copy.disabled.noDevice : null;
}

/** A refusal token (the text before the first ':') as plain words; an unknown one shows as sent. */
export function sayRefusalText(copy: SayCopy, error: string | null, expired: boolean): string {
  const token = expired ? "expired" : (error ?? "").split(":")[0].trim();
  if (!token) return copy.errors.unknown;
  const known = token === "other" || token === "unknown" ? undefined : copy.errors[token as keyof SayCopy["errors"]];
  if (known) return known.replace("{max}", String(SAY_MAX_CHARS));
  return copy.errors.other.replace("{reason}", token.replace(/_/g, " "));
}

/**
 * Direct an App Master: a `channel_say` (weekend item E). The desktop writes
 * the direction into the master's channel and starts no run; the headless
 * master reads it at its next wake, so this is not a chat and shows no reply.
 * The web has no App Master marker: it is offered on every persona and the
 * desktop decides (`not_app_master`). Progress is the command chip; a
 * completed command reads as delivered, a refusal as words.
 */
export default function DirectMasterPanel({ personaId, name, deviceId, reach }: Props) {
  const copy = mobileCopy.say;
  const fieldId = useId();
  const hintId = useId();
  const [text, setText] = useState("");
  const [commandId, setCommandId] = useState<string | null>(null);
  // A send that never reached the plane (a thrown error), as the text to show.
  const [unsent, setUnsent] = useState<string | null>(null);
  const command = useCommandStore((s) => (commandId ? (s.inflight[commandId] ?? null) : null));

  const count = sayLength(text);
  const tooLong = count > SAY_MAX_CHARS;
  const open = command !== null && !isTerminal(command.status);
  const disabledReason = sayDisabledReason(copy, reach.ready ? reach.tierFor(deviceId).tier : null, reach.desktopPlane, deviceId);
  const canSend = disabledReason === null && count > 0 && !tooLong && !open;

  const submit = () => {
    if (!canSend) return;
    setUnsent(null);
    api.sayToMaster({ personaId, message: text, deviceId }).then(
      (ack) => {
        setCommandId(ack.commandId);
        setText("");
      },
      (err: unknown) => {
        captureExceptionScrubbed(err, { tags: { scope: "phoneSayToMaster" } });
        setUnsent(sayRefusalText(copy, err instanceof Error ? err.message : null, false));
      },
    );
  };

  const outcome = command?.status === "completed" ? channelSayOutcome(command) : null;
  const refused = command !== null && (command.status === "failed" || command.status === "rejected" || command.status === "expired");
  const hint = disabledReason ?? (tooLong ? copy.tooLong.replace("{max}", String(SAY_MAX_CHARS)) : null);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h3 className="text-base font-semibold text-foreground">{copy.title}</h3>
      <p className="text-sm text-muted-dark">{copy.intro}</p>
      <label htmlFor={fieldId} className="sr-only">
        {copy.label.replace("{name}", name)}
      </label>
      <textarea
        id={fieldId}
        data-say-field
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={copy.label.replace("{name}", name)}
        aria-describedby={hint ? hintId : undefined}
        aria-invalid={tooLong}
        // 16 px text: iOS zooms into any smaller input on focus.
        className="w-full resize-none rounded-xl border border-glass-hover bg-white/[0.03] p-3 text-base text-foreground placeholder:text-muted-dark focus-visible:outline-2 focus-visible:outline-brand-cyan"
      />
      <div className="flex items-center justify-between gap-3">
        <span data-say-count className={`text-sm ${tooLong ? "text-rose-400" : "text-muted-dark"}`}>
          {copy.count.replace("{count}", String(count)).replace("{max}", String(SAY_MAX_CHARS))}
        </span>
        <button
          type="submit"
          data-say-action="send"
          disabled={!canSend}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-cyan/15 px-4 text-base font-medium text-foreground transition-colors hover:bg-brand-cyan/25 focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendHorizontal aria-hidden className="h-4 w-4 text-brand-cyan" />
          {copy.send}
        </button>
      </div>
      {hint && (
        <p id={hintId} data-say-hint className={`text-sm ${tooLong && !disabledReason ? "text-rose-400" : "text-muted-dark"}`}>
          {hint}
        </p>
      )}
      {command && !outcome && !refused && <CommandChip command={command} />}
      {outcome?.ok && (
        <p role="status" data-say-outcome="delivered" className="text-sm text-emerald-300">
          {(outcome.changed ? copy.delivered : copy.deliveredAgain).replace("{name}", name)}
        </p>
      )}
      {command && refused && (
        <p role="status" data-say-outcome="refused" className="text-sm text-rose-300">
          {sayRefusalText(copy, command.error, command.status === "expired")}
        </p>
      )}
      {unsent && (
        <p role="status" data-say-outcome="unsent" className="text-sm text-rose-300">
          {unsent}
        </p>
      )}
    </form>
  );
}
