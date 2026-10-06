"use client";

import { useEffect, useRef } from "react";
import { Loader2, RotateCcw, TriangleAlert, X } from "lucide-react";
import { MarkdownReport } from "@/components/dashboard/MarkdownReport";
import { useTranslation } from "@/i18n/useTranslation";
import { chatErrorKind, type ChatMessage, type TurnView } from "@/lib/chat/chatModel";

interface Props {
  /** Who answers: "Athena" or the persona's name. */
  name: string;
  messages: readonly ChatMessage[];
  /** Turns still drawn (not `done`), oldest first. */
  turns: readonly TurnView[];
  /** Synced user message id -> the local id of the send it came from, so its bubble keeps one identity. */
  bubbleKeys: ReadonlyMap<string, string>;
  /** Shown when there is nothing to draw yet. */
  emptyText: string;
  loading: boolean;
  error: boolean;
  onReload: () => void;
  onRetry: (localId: string) => void;
  onDismiss: (localId: string) => void;
}

const BUBBLE = "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-base [overflow-wrap:anywhere]";
const USER_BUBBLE = `${BUBBLE} self-end whitespace-pre-wrap rounded-br-md bg-brand-cyan/15 text-foreground`;
const SMALL_BUTTON =
  "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-glass-hover px-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand-cyan";

/** Within this many px of the bottom the reader is "at the latest", and the transcript follows growth. */
const PINNED_PX = 48;

/**
 * One thread's messages, oldest first, then this tab's open turns (PHASE2-SPEC
 * 5.3, phone UX). A message not yet synced is the user's bubble at once (same
 * element, keyed by the send, when the synced message replaces it); under it
 * the turn reads Sending..., "{name} is thinking...", the failure with Retry,
 * or "No reply. The run failed." with Retry. Assistant turns are markdown
 * (`MarkdownReport`). Growth is followed only while the reader is at the
 * bottom, or when they just sent; the log is announced politely.
 */
export default function ChatTranscript(props: Props) {
  const { name, messages, turns, bubbleKeys, emptyText, loading, error, onReload, onRetry, onDismiss } = props;
  const { t } = useTranslation();
  const copy = t.mobile.chat;
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const turnCount = useRef(turns.length);
  const size = messages.length + turns.length;
  const tail = turns.map((x) => x.phase).join(",");

  useEffect(() => {
    const el = scroller.current;
    const sent = turns.length > turnCount.current;
    turnCount.current = turns.length;
    // Instant, never smooth: the jump is the user's own message or the reply they asked for.
    if (el && (pinned.current || sent)) el.scrollTop = el.scrollHeight;
  }, [size, tail, turns.length]);

  const nothing = messages.length === 0 && turns.length === 0;

  return (
    <div
      ref={scroller}
      onScroll={(e) => {
        const el = e.currentTarget;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < PINNED_PX;
      }}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
    >
      {error && messages.length === 0 ? (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <p>{copy.messagesError}</p>
          <button type="button" onClick={onReload} className={`${SMALL_BUTTON} mt-2`}>
            {copy.retry}
          </button>
        </div>
      ) : loading && nothing ? (
        <p className="flex items-center gap-2 text-sm text-muted-dark" aria-busy="true">
          <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
          {copy.messagesLoading}
        </p>
      ) : nothing ? (
        <p className="text-sm text-muted-dark">{emptyText}</p>
      ) : null}

      <ol aria-label={copy.transcriptLabel.replace("{name}", name)} aria-live="polite" className="flex flex-col gap-2">
        {messages.map((m) =>
          m.role === "user" ? (
            <li key={bubbleKeys.get(m.id) ?? m.id} data-chat-message="user" className={USER_BUBBLE}>
              <span className="sr-only">{copy.you}: </span>
              {m.content}
            </li>
          ) : (
            <li
              key={m.id}
              data-chat-message="assistant"
              className={`${BUBBLE} self-start rounded-bl-md border border-glass bg-white/[0.03] text-foreground`}
            >
              <span className="sr-only">{name}: </span>
              <MarkdownReport content={m.content} className="text-base [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
            </li>
          ),
        )}
        {turns
          .filter((turn) => turn.userMessageId === null)
          .map((turn) => (
            <li
              key={turn.send.localId}
              data-chat-message="user"
              data-chat-optimistic="true"
              className={`${USER_BUBBLE} border border-dashed border-brand-cyan/40`}
            >
              <span className="sr-only">{copy.you}: </span>
              {turn.send.message}
            </li>
          ))}
        {turns.map((turn) => (
          <li key={`${turn.send.localId}:turn`} data-chat-turn={turn.phase} className="self-stretch px-1">
            <TurnStatus turn={turn} name={name} onRetry={onRetry} onDismiss={onDismiss} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function TurnStatus({ turn, name, onRetry, onDismiss }: { turn: TurnView; name: string; onRetry: (id: string) => void; onDismiss: (id: string) => void }) {
  const { t } = useTranslation();
  const copy = t.mobile.chat;
  const { send, phase } = turn;

  if (phase === "sending" || phase === "thinking") {
    return (
      <span className="flex items-center gap-2 text-sm text-muted">
        <Loader2 aria-hidden className="h-4 w-4 flex-none text-brand-cyan motion-safe:animate-spin" />
        {phase === "sending" ? copy.sending : copy.thinking.replace("{name}", name)}
      </span>
    );
  }
  if (phase === "waiting") return <span className="text-sm text-muted-dark">{copy.waiting}</span>;

  const text =
    phase === "noReply"
      ? copy.noReply.replace("{status}", turn.runStatus === "cancelled" ? copy.runEnded.cancelled : copy.runEnded.failed)
      : errorText(copy, turn, name);
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-start gap-2 text-sm text-rose-300">
        <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 flex-none" />
        {text}
      </span>
      <span className="flex gap-2">
        <button type="button" data-chat-action="retry" onClick={() => onRetry(send.localId)} className={SMALL_BUTTON}>
          <RotateCcw aria-hidden className="h-4 w-4" />
          {copy.retrySend}
        </button>
        <button type="button" data-chat-action="dismiss" onClick={() => onDismiss(send.localId)} className={SMALL_BUTTON}>
          <X aria-hidden className="h-4 w-4" />
          {copy.dismiss}
        </button>
      </span>
    </div>
  );
}

type ChatCopy = ReturnType<typeof useTranslation>["t"]["mobile"]["chat"];

function errorText(copy: ChatCopy, turn: TurnView, name: string): string {
  const kind = chatErrorKind(turn.commandStatus, turn.error);
  if (kind === "other") {
    // An unknown token still says what the desktop said, as words ("bad signature").
    const reason = (turn.error ?? "").split(":")[0].replace(/_/g, " ").trim();
    return reason ? copy.errors.other.replace("{reason}", reason) : copy.errors.unknown;
  }
  return copy.errors[kind].replace("{name}", name);
}
