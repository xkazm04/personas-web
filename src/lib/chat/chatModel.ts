/**
 * Chat on the phone, as pure functions (PHASE2-SPEC.md 5.2, 5.3; PLAN M18).
 *
 * The data is the desktop's sync mirror: `synced_chat_sessions` and
 * `synced_chat_messages` (scripts/setup-sync-db.sql), one pair of tables for
 * both kinds of thread. Athena's rows carry `thread_kind = 'athena'` and the
 * persona id sentinel `'athena'`; every key is composite
 * (user, device, kind, id), so a thread is addressed by its device too.
 *
 * Sending is a `chat_send` command; the desktop completes it when the turn
 * STARTS, and the reply arrives later as a synced message. Until then the
 * phone shows the user's message optimistically and the turn's state
 * (`deriveTranscript`). No React, no stores, no clock: `now` is passed in.
 */
import type { CommandStatus, InflightCommand } from "@/lib/commands/commandReducer";
import type { PersonaExecutionStatus } from "@/lib/types";

export type ChatThreadKind = "persona" | "athena";

/** The persona id every Athena row and every chat_send to Athena carries. */
export const ATHENA_PERSONA_ID = "athena";

export type ChatRole = "user" | "assistant";

/** One row of `synced_chat_sessions`, camelCased. */
export interface ChatSession {
  sessionId: string;
  deviceId: string;
  threadKind: ChatThreadKind;
  /** The persona; `'athena'` for Athena threads. */
  personaId: string;
  title: string | null;
  /** Persona chat mode; null for Athena. */
  chatMode: string | null;
  /** Athena: 'user' | 'forwarded' | 'proactive'; null for persona chat. */
  origin: string | null;
  pinned: boolean;
  createdAt: string;
  /** Last activity in the thread. */
  updatedAt: string;
}

/** One row of `synced_chat_messages`, camelCased. Only user and assistant turns are synced. */
export interface ChatMessage {
  id: string;
  deviceId: string;
  threadKind: ChatThreadKind;
  personaId: string;
  sessionId: string;
  role: ChatRole;
  /** Secret-masked and size-capped by the desktop. Markdown for assistant turns. */
  content: string;
  /** The run that produced an assistant turn (persona chat only). */
  executionId: string | null;
  createdAt: string;
}

/** Which thread a view shows: the composite key minus the user. */
export interface ChatThreadRef {
  threadKind: ChatThreadKind;
  deviceId: string | null;
  sessionId: string;
}

/** `ApiClient.listChatSessions`: one kind's threads; persona threads of one persona when `personaId` is set. */
export interface ListChatSessionsInput {
  threadKind: ChatThreadKind;
  personaId?: string;
}

/** `ApiClient.sendChatMessage`: a `chat_send` command to the desktop that holds the thread. */
export interface ChatSendInput {
  threadKind: ChatThreadKind;
  /** The persona; `'athena'` for Athena. */
  personaId: string;
  /** The thread's desktop; null = resolve it (the persona's owner, else the newest device). */
  deviceId: string | null;
  /** null = a new thread. */
  sessionId: string | null;
  message: string;
}

export const CHAT_SESSION_COLUMNS =
  "device_id,thread_kind,session_id,persona_id,title,chat_mode,origin,pinned,created_at,updated_at";
export const CHAT_MESSAGE_COLUMNS = "device_id,thread_kind,id,persona_id,session_id,role,content,execution_id,created_at";

export interface ChatSessionRow {
  device_id: string;
  thread_kind: string;
  session_id: string;
  persona_id: string;
  title: string | null;
  chat_mode: string | null;
  origin: string | null;
  pinned: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  device_id: string;
  thread_kind: string;
  id: string;
  persona_id: string;
  session_id: string;
  role: string;
  content: string | null;
  execution_id: string | null;
  created_at: string;
}

export function isThreadKind(value: unknown): value is ChatThreadKind {
  return value === "persona" || value === "athena";
}

/** A row the schema's CHECKs would refuse (unknown kind) is dropped, never drawn with an invented one. */
export function mapChatSessionRow(row: ChatSessionRow): ChatSession | null {
  if (!isThreadKind(row.thread_kind)) return null;
  return {
    sessionId: row.session_id,
    deviceId: row.device_id,
    threadKind: row.thread_kind,
    personaId: row.persona_id,
    title: row.title,
    chatMode: row.chat_mode,
    origin: row.origin,
    pinned: row.pinned === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChatMessageRow(row: ChatMessageRow): ChatMessage | null {
  if (!isThreadKind(row.thread_kind)) return null;
  if (row.role !== "user" && row.role !== "assistant") return null;
  return {
    id: row.id,
    deviceId: row.device_id,
    threadKind: row.thread_kind,
    personaId: row.persona_id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content ?? "",
    executionId: row.execution_id,
    createdAt: row.created_at,
  };
}

function ms(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/** Thread list order: pinned first, then the latest activity, then the id so equal rows never swap. */
export function sortSessions(sessions: readonly ChatSession[]): ChatSession[] {
  return [...sessions].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      ms(b.updatedAt) - ms(a.updatedAt) ||
      a.sessionId.localeCompare(b.sessionId),
  );
}

/**
 * Transcript order: oldest first by the desktop's `created_at`; on a tie the
 * user's turn before the reply it prompted, then the id.
 */
export function sortMessages(messages: readonly ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) =>
      ms(a.createdAt) - ms(b.createdAt) ||
      (a.role === b.role ? 0 : a.role === "user" ? -1 : 1) ||
      a.id.localeCompare(b.id),
  );
}

/** Merge a fresh page into what is held: the fresh row wins per id (a re-masked or capped edit). */
export function mergeMessages(held: readonly ChatMessage[], fresh: readonly ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const m of held) byId.set(m.id, m);
  for (const m of fresh) byId.set(m.id, m);
  return sortMessages([...byId.values()]);
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

/** The desktop refuses a message over this many UTF-8 bytes (`message_too_long`). */
export const CHAT_MESSAGE_MAX_BYTES = 8192;

export function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * The `chat_send` params, in the contract's key order (`sessionId`, then
 * `message`), or null when the message is empty or too long to send. The
 * message is trimmed; null `sessionId` asks the desktop for a new thread.
 */
export function chatSendParams(sessionId: string | null, message: string): { sessionId: string | null; message: string } | null {
  const text = message.trim();
  if (text.length === 0 || utf8Bytes(text) > CHAT_MESSAGE_MAX_BYTES) return null;
  return { sessionId, message: text };
}

export function isMessageTooLong(message: string): boolean {
  return utf8Bytes(message.trim()) > CHAT_MESSAGE_MAX_BYTES;
}

/** One message sent from this tab, held until the synced transcript has it. */
export interface ChatSend {
  /** Minted here at once, so the bubble shows before the command exists. */
  localId: string;
  /** The `chat_send` command, once the plane accepted it. */
  commandId: string | null;
  /** The send never reached the plane (thrown before a command existed). */
  localError: string | null;
  threadKind: ChatThreadKind;
  personaId: string;
  deviceId: string | null;
  /** The thread it was sent into; null = a new thread (the result names it). */
  sessionId: string | null;
  /** Sends from one "new chat" view share this, so the view can follow the thread it created. */
  draftKey: string | null;
  message: string;
  sentAt: number;
}

/** The command's result fields the phone reads (contract: `{sessionId, userMessageId, executionId?}`). */
function resultString(cmd: InflightCommand | undefined, key: string): string | null {
  const v = cmd?.result?.[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

/** The thread a send landed in: the one it named, else the one its completed command reported. */
export function resolvedSessionId(send: ChatSend, cmd: InflightCommand | undefined): string | null {
  return send.sessionId ?? resultString(cmd, "sessionId");
}

/** The sends that belong to a thread view: the thread itself, or (before it exists) the view's draft. */
export function sendsForThread(
  sends: readonly ChatSend[],
  inflight: Readonly<Record<string, InflightCommand>>,
  scope: { threadKind: ChatThreadKind; personaId: string; sessionId: string | null; draftKey: string | null },
): ChatSend[] {
  return sends
    .filter((s) => {
      if (s.threadKind !== scope.threadKind || s.personaId !== scope.personaId) return false;
      if (scope.draftKey !== null && s.draftKey === scope.draftKey) return true;
      if (scope.sessionId === null) return false;
      const cmd = s.commandId ? inflight[s.commandId] : undefined;
      return resolvedSessionId(s, cmd) === scope.sessionId;
    })
    .sort((a, b) => a.sentAt - b.sentAt);
}

/** The newest thread a view's draft created, once a command reported it. */
export function draftSessionId(
  sends: readonly ChatSend[],
  inflight: Readonly<Record<string, InflightCommand>>,
  draftKey: string,
): string | null {
  let best: { at: number; id: string } | null = null;
  for (const s of sends) {
    if (s.draftKey !== draftKey) continue;
    const id = resolvedSessionId(s, s.commandId ? inflight[s.commandId] : undefined);
    if (id && (best === null || s.sentAt > best.at)) best = { at: s.sentAt, id };
  }
  return best?.id ?? null;
}

/**
 * - `sending`: the command is pending or being claimed.
 * - `thinking`: the turn started; no reply yet (persona: the run is queued,
 *   running, or done with its reply still syncing).
 * - `waiting`: thinking for longer than `REPLY_WAIT_MS` with nothing to show
 *   for it: the reply may still sync later.
 * - `failed`: the command failed, was refused or expired, or never reached the plane.
 * - `noReply`: persona chat only, the run ended otherwise than `completed`.
 * - `done`: the reply is in the transcript.
 */
export type TurnPhase = "sending" | "thinking" | "waiting" | "failed" | "noReply" | "done";

export interface TurnView {
  send: ChatSend;
  phase: TurnPhase;
  /** The synced user message this send became, if it has synced. */
  userMessageId: string | null;
  /** `failed`: the command's terminal status and the desktop's reason. */
  commandStatus: CommandStatus | null;
  error: string | null;
  /** `noReply`: how the run ended. */
  runStatus: PersonaExecutionStatus | null;
}

export interface TranscriptView {
  /** The synced transcript, oldest first. */
  messages: ChatMessage[];
  /** Sends whose user message has not synced yet: drawn after the transcript as optimistic bubbles. */
  turns: TurnView[];
}

/** How long a started turn may go without a reply before the phone stops saying "thinking". */
export const REPLY_WAIT_MS = 5 * 60_000;

/** A synced user message is matched to a send by content only if it is no older than the send minus this skew. */
const CLOCK_SKEW_MS = 5 * 60_000;

const FAILED: ReadonlySet<CommandStatus> = new Set(["failed", "rejected", "expired"]);
const LIVE_RUN: ReadonlySet<PersonaExecutionStatus> = new Set(["queued", "running"]);

/**
 * Merge the synced transcript with this tab's sends (spec 5.3, phone UX).
 *
 * A send's bubble is replaced by the synced user message it became: the one
 * the command's `userMessageId` names, else (Athena may report null, and the
 * message can sync before the command's result arrives) the oldest unclaimed
 * user message with the same text written no earlier than the send. Its turn
 * is over when a reply is in the transcript: the assistant message of the
 * command's `executionId`, or any assistant message after the user message.
 */
export function deriveTranscript(input: {
  messages: readonly ChatMessage[];
  sends: readonly ChatSend[];
  inflight: Readonly<Record<string, InflightCommand>>;
  /** Status of known runs by id (persona chat's "thinking" follows its run). */
  runStatus: (executionId: string) => PersonaExecutionStatus | undefined;
  now: number;
}): TranscriptView {
  const messages = sortMessages(input.messages);
  const claimed = new Set<string>();
  const turns: TurnView[] = [];

  for (const send of [...input.sends].sort((a, b) => a.sentAt - b.sentAt)) {
    const cmd = send.commandId ? input.inflight[send.commandId] : undefined;
    const failed = send.localError !== null || (cmd !== undefined && FAILED.has(cmd.status));

    let user: ChatMessage | undefined;
    if (!failed) {
      const named = resultString(cmd, "userMessageId");
      user = named ? messages.find((m) => m.id === named && m.role === "user") : undefined;
      user ??= messages.find(
        (m) =>
          m.role === "user" &&
          !claimed.has(m.id) &&
          m.content.trim() === send.message.trim() &&
          ms(m.createdAt) >= send.sentAt - CLOCK_SKEW_MS,
      );
      if (user) claimed.add(user.id);
    }

    const base = { send, userMessageId: user?.id ?? null, commandStatus: cmd?.status ?? null, error: null, runStatus: null };
    if (failed) {
      turns.push({ ...base, phase: "failed", error: send.localError ?? cmd?.error ?? null });
      continue;
    }
    if (!cmd || cmd.status !== "completed") {
      turns.push({ ...base, phase: "sending" });
      continue;
    }

    const executionId = resultString(cmd, "executionId");
    const userAt = user ? ms(user.createdAt) : null;
    const reply = messages.find(
      (m) =>
        m.role === "assistant" &&
        ((executionId !== null && m.executionId === executionId) || (userAt !== null && ms(m.createdAt) > userAt)),
    );
    if (reply) {
      turns.push({ ...base, phase: "done" });
      continue;
    }

    const run = executionId ? input.runStatus(executionId) : undefined;
    if (run && run !== "completed" && !LIVE_RUN.has(run)) {
      turns.push({ ...base, phase: "noReply", runStatus: run });
      continue;
    }
    const overdue = input.now - send.sentAt > REPLY_WAIT_MS && !(run && LIVE_RUN.has(run));
    turns.push({ ...base, phase: overdue ? "waiting" : "thinking" });
  }

  return { messages, turns };
}

/** The sends a view still draws: everything not `done` (a done turn's bubble is its synced message). */
export function openTurns(view: TranscriptView): TurnView[] {
  return view.turns.filter((t) => t.phase !== "done");
}

// ---------------------------------------------------------------------------
// Errors: the desktop's tokens, read as words
// ---------------------------------------------------------------------------

export type ChatErrorKind =
  | "chat_sync_off"
  | "athena_off"
  | "empty_message"
  | "message_too_long"
  | "bad_params"
  | "not_found"
  | "not_paired"
  | "unsupported"
  | "expired"
  | "replayed"
  | "no_device"
  | "other";

const TOKEN_KIND: Readonly<Record<string, ChatErrorKind>> = {
  chat_sync_off: "chat_sync_off",
  athena_off: "athena_off",
  empty_message: "empty_message",
  message_too_long: "message_too_long",
  bad_params: "bad_params",
  not_found: "not_found",
  controller_not_paired: "not_paired",
  controller_revoked: "not_paired",
  // A desktop without this verb (persona chat before its update) refuses the type.
  unsupported_command_type: "unsupported",
  expired: "expired",
  // The desktop refuses a second claim of a command it already ran.
  replayed: "replayed",
  no_device: "no_device",
};

/**
 * Which message a failed send shows. The desktop's reason is a token,
 * optionally followed by `: detail` (`unsupported_command_type: ...`); an
 * expired command reads as expired whatever its text says.
 */
export function chatErrorKind(status: CommandStatus | null, error: string | null): ChatErrorKind {
  if (status === "expired") return "expired";
  const token = (error ?? "").split(":")[0].trim();
  return TOKEN_KIND[token] ?? "other";
}
