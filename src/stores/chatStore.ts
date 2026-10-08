import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import {
  mergeMessages,
  resolvedSessionId,
  sortSessions,
  type ChatMessage,
  type ChatSend,
  type ChatSendInput,
  type ChatSession,
  type ChatThreadKind,
  type ChatThreadRef,
} from "@/lib/chat/chatModel";
import { useCommandStore } from "@/stores/commandStore";

export interface ListStatus {
  loading: boolean;
  /** At least one fetch settled: an empty list may be shown as empty. */
  loaded: boolean;
  error: string | null;
}

/** What the open chat shows: the thread list's scope and, inside it, one thread. */
export interface OpenChat {
  threadKind: ChatThreadKind;
  personaId: string;
  thread: ChatThreadRef | null;
}

interface ChatState {
  /** Thread lists by `scopeKey`. */
  sessions: Record<string, ChatSession[]>;
  sessionsStatus: Record<string, ListStatus>;
  /** Transcripts by `threadKey`, oldest first. */
  messages: Record<string, ChatMessage[]>;
  messagesStatus: Record<string, ListStatus>;
  /** Messages sent from this tab, until the session is reset. */
  sends: ChatSend[];
  open: OpenChat | null;
  setOpen: (open: OpenChat | null) => void;
  fetchSessions: (threadKind: ChatThreadKind, personaId: string) => Promise<void>;
  fetchMessages: (thread: ChatThreadRef) => Promise<void>;
  /** Re-read what the open chat shows (Realtime, and the demo desktop's writes). */
  refreshOpen: () => void;
  /** Show the message at once, then send it as a `chat_send` command. Resolves with the local id. */
  send: (input: ChatSendInput & { draftKey: string | null }) => Promise<string>;
  /** Send a failed or unanswered message again, as a new command; the old bubble goes. */
  retry: (localId: string) => Promise<void>;
  dismiss: (localId: string) => void;
  reset: () => void;
}

export function scopeKey(threadKind: ChatThreadKind, personaId: string): string {
  return `${threadKind}:${personaId}`;
}

export function threadKey(ref: ChatThreadRef): string {
  return `${ref.threadKind}|${ref.deviceId ?? ""}|${ref.sessionId}`;
}

const IDLE: ListStatus = { loading: false, loaded: false, error: null };

/** A later fetch of the same list supersedes an earlier one still in flight (a Realtime burst). */
const latest = new Map<string, number>();
let seq = 0;

function reason(err: unknown): string {
  if (err instanceof ApiError) return err.body;
  return err instanceof Error ? err.message : "not_sent";
}

/**
 * Chat on the phone (PHASE2-SPEC.md 5.2, 5.3): the synced threads and
 * transcripts, read through the `api` proxy (demo: `mockApi`'s fixtures; live:
 * `synced_chat_sessions` / `synced_chat_messages`; orchestrator: nothing), and
 * the messages this tab sent, held until the transcript has them. A send's
 * state is its `chat_send` command in `commandStore`; `deriveTranscript`
 * joins the two.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  sessions: {},
  sessionsStatus: {},
  messages: {},
  messagesStatus: {},
  sends: [],
  open: null,

  setOpen: (open) => set({ open }),

  fetchSessions: async (threadKind, personaId) => {
    const key = scopeKey(threadKind, personaId);
    const request = ++seq;
    latest.set(`s:${key}`, request);
    set((s) => ({ sessionsStatus: { ...s.sessionsStatus, [key]: { ...(s.sessionsStatus[key] ?? IDLE), loading: true } } }));
    try {
      const list = await api.listChatSessions({ threadKind, personaId: threadKind === "persona" ? personaId : undefined });
      if (latest.get(`s:${key}`) !== request) return;
      set((s) => ({
        sessions: { ...s.sessions, [key]: sortSessions(list) },
        sessionsStatus: { ...s.sessionsStatus, [key]: { loading: false, loaded: true, error: null } },
      }));
    } catch (err) {
      if (latest.get(`s:${key}`) !== request) return;
      captureExceptionScrubbed(err, { tags: { scope: "chatStore.fetchSessions" } });
      set((s) => ({ sessionsStatus: { ...s.sessionsStatus, [key]: { loading: false, loaded: true, error: reason(err) } } }));
    }
  },

  fetchMessages: async (thread) => {
    const key = threadKey(thread);
    const request = ++seq;
    latest.set(`m:${key}`, request);
    set((s) => ({ messagesStatus: { ...s.messagesStatus, [key]: { ...(s.messagesStatus[key] ?? IDLE), loading: true } } }));
    try {
      const list = await api.listChatMessages(thread);
      if (latest.get(`m:${key}`) !== request) return;
      set((s) => ({
        // Merged, not replaced: a page capped at the newest rows keeps older ones already shown.
        messages: { ...s.messages, [key]: mergeMessages(s.messages[key] ?? [], list) },
        messagesStatus: { ...s.messagesStatus, [key]: { loading: false, loaded: true, error: null } },
      }));
    } catch (err) {
      if (latest.get(`m:${key}`) !== request) return;
      captureExceptionScrubbed(err, { tags: { scope: "chatStore.fetchMessages" } });
      set((s) => ({ messagesStatus: { ...s.messagesStatus, [key]: { loading: false, loaded: true, error: reason(err) } } }));
    }
  },

  refreshOpen: () => {
    const open = get().open;
    if (!open) return;
    void get().fetchSessions(open.threadKind, open.personaId);
    if (open.thread) void get().fetchMessages(open.thread);
  },

  send: async ({ draftKey, ...input }) => {
    const localId = crypto.randomUUID();
    const entry: ChatSend = {
      localId,
      commandId: null,
      localError: null,
      threadKind: input.threadKind,
      personaId: input.personaId,
      deviceId: input.deviceId,
      sessionId: input.sessionId,
      draftKey,
      message: input.message.trim(),
      sentAt: Date.now(),
    };
    set((s) => ({ sends: [...s.sends, entry] }));
    const patch = (p: Partial<ChatSend>) =>
      set((s) => ({ sends: s.sends.map((x) => (x.localId === localId ? { ...x, ...p } : x)) }));
    try {
      const ack = await api.sendChatMessage({ ...input, message: entry.message });
      patch({ commandId: ack.commandId });
    } catch (err) {
      captureExceptionScrubbed(err, { tags: { scope: "chatStore.send", threadKind: input.threadKind } });
      patch({ localError: reason(err) });
    }
    return localId;
  },

  retry: async (localId) => {
    const old = get().sends.find((s) => s.localId === localId);
    if (!old) return;
    const cmd = old.commandId ? useCommandStore.getState().inflight[old.commandId] : undefined;
    get().dismiss(localId);
    await get().send({
      threadKind: old.threadKind,
      personaId: old.personaId,
      deviceId: old.deviceId,
      sessionId: resolvedSessionId(old, cmd),
      message: old.message,
      draftKey: old.draftKey,
    });
  },

  dismiss: (localId) => set((s) => ({ sends: s.sends.filter((x) => x.localId !== localId) })),

  reset: () => {
    latest.clear();
    set({ sessions: {}, sessionsStatus: {}, messages: {}, messagesStatus: {}, sends: [], open: null });
  },
}));
