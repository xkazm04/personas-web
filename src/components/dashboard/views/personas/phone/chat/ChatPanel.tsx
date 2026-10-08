"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useChatStore, scopeKey, threadKey } from "@/stores/chatStore";
import { useCommandStore } from "@/stores/commandStore";
import { useExecutionStore } from "@/stores/executionStore";
import {
  deriveTranscript,
  draftSessionId,
  openTurns,
  sendsForThread,
  type ChatMessage,
  type ChatSession,
  type ChatThreadKind,
  type ChatThreadRef,
} from "@/lib/chat/chatModel";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import type { PersonaExecutionStatus } from "@/lib/types";
import ChatThreadList from "./ChatThreadList";
import ChatTranscript from "./ChatTranscript";
import ChatComposer, { composerDisabledReason } from "./ChatComposer";
import { mobileCopy } from "@/i18n/pending/mobile";

interface Props {
  threadKind: ChatThreadKind;
  /** The persona; `'athena'` for Athena. */
  personaId: string;
  /** Who answers: "Athena" or the persona's name. */
  name: string;
  /** The desktop that holds this chat (the persona's owner); null = the newest device. */
  ownerDeviceId: string | null;
  reach: SyncReachability;
  /** The sheet's own height around the panel (handle, title, tabs, padding), for the keyboard-open height. */
  chromePx: number;
}

/** list -> thread (an existing one) or draft (a new one, until its command names the thread). */
type View = { kind: "list" } | { kind: "thread"; sessionId: string; deviceId: string | null } | { kind: "draft"; draftKey: string };

const EMPTY_SESSIONS: ChatSession[] = [];
const EMPTY_MESSAGES: ChatMessage[] = [];
const IDLE = { loading: false, loaded: false, error: null };

/**
 * Chat with Athena or one persona from the phone (PHASE2-SPEC.md 5.2, 5.3,
 * 6.2; PLAN M18): thread list -> transcript -> composer, one component for
 * both kinds. Reading is open to every tier; sending is a `chat_send` command,
 * so the composer follows the online gate of the desktop that holds the
 * thread (enabled online + paired, and in the demo). The message shows at
 * once; the reply arrives as synced data (Realtime refetches the open thread;
 * the demo's simulated desktop writes its fixtures).
 */
export default function ChatPanel({ threadKind, personaId, name, ownerDeviceId, reach, chromePx }: Props) {
  const copy = mobileCopy.chat;
  const keyboard = useKeyboardInset();

  const [view, setView] = useState<View>({ kind: "list" });
  // Another persona's chat starts at its thread list (prev-state reset, React 19 rule).
  const scope = scopeKey(threadKind, personaId);
  const [prevScope, setPrevScope] = useState(scope);
  if (scope !== prevScope) {
    setPrevScope(scope);
    setView({ kind: "list" });
  }

  const sessions = useChatStore((s) => s.sessions[scope] ?? EMPTY_SESSIONS);
  const sessionsStatus = useChatStore((s) => s.sessionsStatus[scope] ?? IDLE);
  const sends = useChatStore((s) => s.sends);
  const inflight = useCommandStore((s) => s.inflight);
  const executions = useExecutionStore((s) => s.rawExecutions);

  // A draft becomes its thread once the command reports it.
  const draftKey = view.kind === "draft" ? view.draftKey : null;
  const draftThread = draftKey ? draftSessionId(sends, inflight, draftKey) : null;
  const draftDevice = draftKey ? (sends.find((s) => s.draftKey === draftKey)?.deviceId ?? null) : null;
  const threadSession = view.kind === "thread" ? view.sessionId : draftThread;
  const threadDevice = view.kind === "thread" ? view.deviceId : draftDevice;
  const thread: ChatThreadRef | null = threadSession ? { threadKind, deviceId: threadDevice, sessionId: threadSession } : null;
  const tKey = thread ? threadKey(thread) : null;

  const messages = useChatStore((s) => (tKey ? s.messages[tKey] : undefined) ?? EMPTY_MESSAGES);
  const messagesStatus = useChatStore((s) => (tKey ? s.messagesStatus[tKey] : undefined) ?? IDLE);

  useEffect(() => {
    void useChatStore.getState().fetchSessions(threadKind, personaId);
  }, [threadKind, personaId]);

  useEffect(() => {
    const store = useChatStore.getState();
    const ref = threadSession ? { threadKind, deviceId: threadDevice, sessionId: threadSession } : null;
    store.setOpen({ threadKind, personaId, thread: ref });
    if (ref) void store.fetchMessages(ref);
  }, [threadKind, personaId, threadSession, threadDevice]);

  useEffect(() => () => useChatStore.getState().setOpen(null), []);

  const runStatus = useMemo(() => {
    const byId = new Map<string, PersonaExecutionStatus>(executions.map((e) => [e.id, e.status]));
    return (id: string) => byId.get(id);
  }, [executions]);

  const { turns, bubbleKeys } = useMemo(() => {
    const mine = sendsForThread(sends, inflight, { threadKind, personaId, sessionId: threadSession, draftKey });
    const view = deriveTranscript({ messages, sends: mine, inflight, runStatus, now: reach.now });
    const keys = new Map<string, string>();
    for (const turn of view.turns) if (turn.userMessageId) keys.set(turn.userMessageId, turn.send.localId);
    return { turns: openTurns(view), bubbleKeys: keys };
  }, [sends, inflight, threadKind, personaId, threadSession, draftKey, messages, runStatus, reach.now]);

  // The gate is the tier of the desktop that holds the thread.
  const gateDevice = threadDevice ?? ownerDeviceId;
  const disabledReason = composerDisabledReason(copy, reach.ready ? reach.tierFor(gateDevice).tier : null, reach.desktopPlane);

  const onSend = (message: string) => {
    void useChatStore.getState().send({
      threadKind,
      personaId,
      deviceId: gateDevice ?? reach.fallbackDeviceId,
      sessionId: threadSession,
      message,
      draftKey,
    });
  };

  const title =
    view.kind === "list"
      ? null
      : (sessions.find((s) => s.sessionId === threadSession && (threadDevice === null || s.deviceId === threadDevice))?.title?.trim() ||
        (view.kind === "draft" ? copy.newChat : copy.untitled));

  const emptyText =
    view.kind === "draft" && !threadSession
      ? threadKind === "athena"
        ? copy.draftAthena
        : copy.draftPersona.replace("{name}", name)
      : copy.threadEmpty;

  return (
    <div
      data-chat-panel={threadKind}
      className="flex h-[62svh] flex-col"
      // With the keyboard open the sheet sits on it: the panel takes what is left.
      style={keyboard > 0 ? { height: `calc(min(62svh, 100svh - ${keyboard + chromePx}px))` } : undefined}
    >
      {view.kind === "list" ? (
        <ChatThreadList
          sessions={sessions}
          status={sessionsStatus}
          now={reach.now}
          // A fresh key per draft, minted on the tap (never in render).
          onNew={() => setView({ kind: "draft", draftKey: crypto.randomUUID() })}
          onOpen={(s) => setView({ kind: "thread", sessionId: s.sessionId, deviceId: s.deviceId })}
          onReload={() => void useChatStore.getState().fetchSessions(threadKind, personaId)}
        />
      ) : (
        <>
          <div className="flex flex-none items-center gap-2 border-b border-glass pb-2">
            <button
              type="button"
              data-chat-action="back"
              onClick={() => setView({ kind: "list" })}
              className="inline-flex min-h-[44px] flex-none items-center gap-1 rounded-xl px-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand-cyan"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
              {copy.back}
            </button>
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">{title}</h3>
          </div>
          <ChatTranscript
            name={name}
            messages={messages}
            turns={turns}
            bubbleKeys={bubbleKeys}
            emptyText={emptyText}
            loading={messagesStatus.loading || (thread !== null && !messagesStatus.loaded)}
            error={messagesStatus.error !== null}
            onReload={() => thread && void useChatStore.getState().fetchMessages(thread)}
            onRetry={(id) => void useChatStore.getState().retry(id)}
            onDismiss={(id) => useChatStore.getState().dismiss(id)}
          />
          <ChatComposer name={name} disabledReason={disabledReason} onSend={onSend} />
        </>
      )}
    </div>
  );
}
