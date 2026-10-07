"use client";

import { useId, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { chatSendParams, isMessageTooLong } from "@/lib/chat/chatModel";
import { actionsEnabled, type ReachabilityTier } from "@/lib/sync/reachability";
import { desktopUnsupported } from "@/lib/sync/desktopUnsupported";
import { mobileCopy, type MobileCopy } from "@/i18n/pending/mobile";

interface Props {
  /** Who the message goes to, for the field's label. */
  name: string;
  /** Why sending is off in this tier (offline, unpaired...), or null when it is on. */
  disabledReason: string | null;
  onSend: (message: string) => void;
}

type ChatCopy = MobileCopy["chat"];

/**
 * Why the composer is off, or null when it is on: only the tier of the desktop
 * that holds the thread (null = not judged yet: off, no reason shown). A
 * paused persona still chats (PLAN M21): pause stops its triggers, schedules
 * and subscriptions, not an explicit ask.
 */
export function composerDisabledReason(
  copy: ChatCopy,
  tier: ReachabilityTier | null,
  desktopPlane = false,
): string | null {
  if (tier === null) return "";
  if (desktopUnsupported("chatSend", tier, desktopPlane)) return "";
  if (actionsEnabled(tier)) return null;
  if (tier === "offline") return copy.disabled.offline;
  return tier === "online-unpaired" ? copy.disabled.unpaired : copy.disabled.never;
}

/**
 * The message field and its Send button (44 px). Enabled only in the tiers
 * where actions are (online and paired, or the demo); otherwise disabled with
 * the tier's reason underneath. Text is 16 px so iOS does not zoom on focus;
 * the sheet around it is `keyboardSafe`, so the open keyboard never covers it.
 * Ctrl/Cmd+Enter sends; plain Enter is a new line, as in the desktop chat.
 */
export default function ChatComposer({ name, disabledReason, onSend }: Props) {
  const copy = mobileCopy.chat;
  const fieldId = useId();
  const hintId = useId();
  const [text, setText] = useState("");
  const tooLong = isMessageTooLong(text);
  const disabled = disabledReason !== null;
  const canSend = !disabled && chatSendParams(null, text) !== null;

  const submit = () => {
    if (!canSend) return;
    onSend(text);
    setText("");
  };

  const hint = disabledReason ?? (tooLong ? copy.tooLong : null);

  return (
    <form
      className="flex flex-none flex-col gap-1.5 border-t border-glass pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2">
        <label htmlFor={fieldId} className="sr-only">
          {copy.composerLabel.replace("{name}", name)}
        </label>
        <textarea
          id={fieldId}
          data-chat-composer
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          rows={2}
          placeholder={copy.composerLabel.replace("{name}", name)}
          aria-describedby={hint ? hintId : undefined}
          aria-invalid={tooLong}
          className="max-h-32 min-h-[44px] w-full flex-1 resize-none rounded-xl border border-glass-hover bg-white/[0.03] px-3 py-2.5 text-base text-foreground placeholder:text-muted-dark focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          data-chat-action="send"
          disabled={!canSend}
          aria-label={copy.send}
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-cyan/15 text-foreground transition-colors hover:bg-brand-cyan/25 focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendHorizontal aria-hidden className="h-5 w-5 text-brand-cyan" />
        </button>
      </div>
      {hint && (
        <p id={hintId} data-chat-composer-hint className={`text-sm ${tooLong && !disabled ? "text-rose-400" : "text-muted-dark"}`}>
          {hint}
        </p>
      )}
    </form>
  );
}
