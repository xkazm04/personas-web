/**
 * The demo's desktop: a scripted stand-in for the real command round trip
 * (PHASE2-SPEC.md 6.3), so a visitor on mocks sees management work instead of
 * a 501. It answers like the desktop handler would - `executing` when it
 * claims the row, then `completed` with the verb's result - on realistic
 * timings, and writes the effect through to the in-session fixtures (the
 * `mockApi.updateEvent` precedent), so the next `listPersonas` /
 * `listExecutions` agrees.
 *
 * Timers start only on a user action, and the plane refuses to start in a
 * hidden tab (the use-playground-simulation precedent, CLAUDE.md rule 3).
 */
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import { MOCK_CHAT_DEVICE_ID, MOCK_CHAT_MESSAGES, MOCK_CHAT_SESSIONS, mockChatReply } from "@/lib/mock-dashboard-data";
import { ATHENA_PERSONA_ID, CHAT_MESSAGE_MAX_BYTES, utf8Bytes, type ChatThreadKind } from "@/lib/chat/chatModel";
import type { EventStatus, GlobalExecution, Persona, PersonaEvent } from "@/lib/types";
import { SAY_MAX_CHARS } from "./channelSay";
import type { CommandRowUpdate } from "./commandReducer";
import type { CommandVerb } from "./envelope";

/** pending at 0 -> executing (the desktop's claim) -> completed. */
export const MOCK_TIMINGS = { executingMs: 1200, completedMs: 2000 } as const;

/**
 * A run's execution, from the moment the run command completes (it is written
 * `queued` then): running 1 s later, completed 8 s after it was queued.
 */
export const MOCK_RUN_TIMINGS = { runningMs: 1000, completedMs: 8000 } as const;

/**
 * A chat turn, from the moment its command completes (the desktop completes
 * `chat_send` when the turn STARTS): a persona's run goes running 0.5 s later
 * and completed at 1.8 s, and the reply lands at 2 s, so it shows about 4 s
 * after the send (spec 6.3). Athena answers at the same 2 s, with no run.
 */
export const MOCK_CHAT_TIMINGS = { runningMs: 500, runCompletedMs: 1800, replyMs: 2000 } as const;

/** What the scripted run costs and returns (demo data, like the fixtures). */
const MOCK_RUN_COST_USD = 0.0124;

export interface MockCommand {
  id: string;
  verb: CommandVerb;
  personaId: string;
  params: Record<string, unknown>;
}

/**
 * How the scripted desktop reads and decides reviews. A review's verdict goes
 * through the `api` (in demo, mockApi's write-through), never through the
 * fixtures directly, so the demo's review queue reads back what a real desktop
 * would have synced.
 */
export interface MockReviewPort {
  list: () => Promise<PersonaEvent[]>;
  update: (id: string, body: { status: EventStatus; metadata?: string }) => Promise<PersonaEvent>;
}

export interface MockPlaneDeps {
  /** Defaults to `document.hidden`. */
  isHidden?: () => boolean;
  /** Called after every write to the fixtures, so the stores can re-read them. */
  onFixtureChange?: () => void;
  /** Defaults to the `api` proxy (mockApi in demo). */
  reviews?: MockReviewPort;
}

/** The `api` proxy, loaded when a review is first decided (it imports the planes that load this module). */
const apiReviews: MockReviewPort = {
  list: async () => (await import("@/lib/api")).api.listEvents({ eventType: "manual_review", limit: 500 }),
  update: async (id, body) => (await import("@/lib/api")).api.updateEvent(id, body),
};

/** A review event's status as the desktop's `manual_reviews.status`. */
function reviewStatus(status: EventStatus): "pending" | "approved" | "rejected" {
  return status === "processed" ? "approved" : status === "failed" ? "rejected" : "pending";
}

/**
 * `review_decide` (contract: params `{ reviewId, decision, notes }`; result
 * `{ reviewId, status, changed }`). Refuses like the desktop: a review that
 * is not this persona's reads as `not_found` (never a hint that it exists),
 * a decision other than approved / rejected is `invalid_decision`; an already
 * decided review completes unchanged with its current status. The verdict is
 * the event's status plus the reviewer notes; like the desktop's synced row,
 * it records no resolver.
 */
async function executeReviewDecide(cmd: MockCommand, reviews: MockReviewPort): Promise<CommandRowUpdate> {
  const reviewId = typeof cmd.params.reviewId === "string" ? cmd.params.reviewId : "";
  const decision = cmd.params.decision;
  const notes = typeof cmd.params.notes === "string" && cmd.params.notes ? cmd.params.notes : null;
  const review = (await reviews.list()).find((e) => e.id === reviewId);
  if (!review || review.targetPersonaId !== cmd.personaId) return { id: cmd.id, status: "failed", error_message: "not_found" };
  if (decision !== "approved" && decision !== "rejected") return { id: cmd.id, status: "failed", error_message: "invalid_decision" };
  const current = reviewStatus(review.status);
  if (current !== "pending") return { id: cmd.id, status: "completed", result: { reviewId, status: current, changed: false } };
  const status: EventStatus = decision === "approved" ? "processed" : "failed";
  await reviews.update(reviewId, notes ? { status, metadata: JSON.stringify({ reviewerNotes: notes }) } : { status });
  return { id: cmd.id, status: "completed", result: { reviewId, status: decision, changed: true } };
}

/** The id of the execution a mock run creates: derived from the command, so a resend cannot run twice. */
export function mockRunExecutionId(commandId: string): string {
  return `exec-${commandId}`;
}

type Schedule = (fn: () => void, ms: number) => void;

/** Move a fixture execution on, only from the status it is expected to be in (a cancel may have landed first). */
function advance(executionId: string, from: GlobalExecution["status"], patch: (e: GlobalExecution) => Partial<GlobalExecution>): boolean {
  const i = MOCK_EXECUTIONS.findIndex((e) => e.id === executionId);
  if (i === -1 || MOCK_EXECUTIONS[i].status !== from) return false;
  MOCK_EXECUTIONS[i] = { ...MOCK_EXECUTIONS[i], ...patch(MOCK_EXECUTIONS[i]) };
  return true;
}

/** A queued execution of `persona`, as the desktop writes it when a run starts. */
function queuedExecution(id: string, persona: Persona, inputData: string | null): GlobalExecution {
  return {
    id,
    personaId: persona.id,
    triggerId: null,
    useCaseId: null,
    status: "queued",
    inputData,
    outputData: null,
    claudeSessionId: null,
    modelUsed: "claude-sonnet-4-5-20250929",
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    errorMessage: null,
    durationMs: null,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    personaName: persona.name,
    personaIcon: persona.icon ?? undefined,
    personaColor: persona.color ?? undefined,
  };
}

/** Schedule an execution's queued -> running -> completed, each step only from the expected status. */
function scheduleRunLifecycle(
  executionId: string,
  schedule: Schedule,
  changed: () => void,
  at: { runningMs: number; completedMs: number },
  outputData: string,
) {
  schedule(() => {
    if (advance(executionId, "queued", () => ({ status: "running", startedAt: new Date().toISOString() }))) changed();
  }, at.runningMs);
  schedule(() => {
    const done = advance(executionId, "running", (e) => {
      const end = new Date();
      const started = e.startedAt ? Date.parse(e.startedAt) : NaN;
      return {
        status: "completed",
        completedAt: end.toISOString(),
        durationMs: Number.isFinite(started) ? Math.max(0, end.getTime() - started) : null,
        costUsd: MOCK_RUN_COST_USD,
        inputTokens: 2100,
        outputTokens: 640,
        outputData,
      };
    });
    if (done) changed();
  }, at.completedMs);
}

/** The ids a chat command writes: derived from the command, so a resend cannot post twice. */
export function mockChatIds(commandId: string) {
  return {
    sessionId: `chat-${commandId}`,
    userMessageId: `msg-${commandId}-u`,
    replyId: `msg-${commandId}-a`,
    executionId: `exec-${commandId}`,
  };
}

/** A new thread's title: the first message, cut to 48 characters. */
function threadTitle(message: string): string {
  return message.length > 48 ? `${message.slice(0, 45)}...` : message;
}

/**
 * `chat_send` (contract: params `{ sessionId | null, message }`; result
 * `{ sessionId, userMessageId, executionId? }`): the user's message is written
 * at once, the turn starts, and a canned reply follows. Refuses like the
 * desktop: an empty or over-8 KB message, an unknown persona or thread. A
 * paused persona still chats (PLAN M21): pause stops its own role, not an
 * explicit ask.
 */
function executeChat(cmd: MockCommand, schedule: Schedule, changed: () => void): CommandRowUpdate {
  const message = typeof cmd.params.message === "string" ? cmd.params.message.trim() : "";
  if (message.length === 0) return { id: cmd.id, status: "failed", error_message: "empty_message" };
  if (utf8Bytes(message) > CHAT_MESSAGE_MAX_BYTES) return { id: cmd.id, status: "failed", error_message: "message_too_long" };

  const athena = cmd.personaId === ATHENA_PERSONA_ID;
  const kind: ChatThreadKind = athena ? "athena" : "persona";
  const persona = athena ? null : MOCK_PERSONAS.find((p) => p.id === cmd.personaId);
  if (!athena && !persona) return { id: cmd.id, status: "failed", error_message: "not_found: persona" };

  const ids = mockChatIds(cmd.id);
  const nowIso = new Date().toISOString();
  const requested = typeof cmd.params.sessionId === "string" ? cmd.params.sessionId : null;
  const wanted = requested ?? ids.sessionId;
  let si = MOCK_CHAT_SESSIONS.findIndex((s) => s.threadKind === kind && s.personaId === cmd.personaId && s.sessionId === wanted);
  if (requested && si === -1) return { id: cmd.id, status: "failed", error_message: "not_found: session" };
  if (si === -1) {
    MOCK_CHAT_SESSIONS.push({
      sessionId: ids.sessionId,
      deviceId: MOCK_CHAT_DEVICE_ID,
      threadKind: kind,
      personaId: cmd.personaId,
      title: threadTitle(message),
      chatMode: athena ? null : "ops",
      origin: athena ? "user" : null,
      pinned: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    si = MOCK_CHAT_SESSIONS.length - 1;
  }
  const session = MOCK_CHAT_SESSIONS[si];
  const executionId = persona ? ids.executionId : null;

  if (!MOCK_CHAT_MESSAGES.some((m) => m.id === ids.userMessageId)) {
    MOCK_CHAT_MESSAGES.push({
      id: ids.userMessageId,
      deviceId: session.deviceId,
      threadKind: kind,
      personaId: cmd.personaId,
      sessionId: session.sessionId,
      role: "user",
      content: message,
      executionId: null,
      createdAt: nowIso,
    });
    MOCK_CHAT_SESSIONS[si] = { ...session, updatedAt: nowIso };
    if (persona && executionId) {
      MOCK_EXECUTIONS.unshift(queuedExecution(executionId, persona, message));
      scheduleRunLifecycle(
        executionId,
        schedule,
        changed,
        { runningMs: MOCK_CHAT_TIMINGS.runningMs, completedMs: MOCK_CHAT_TIMINGS.runCompletedMs },
        "Chat turn answered on the demo computer.",
      );
    }
    changed();
    schedule(() => {
      if (MOCK_CHAT_MESSAGES.some((m) => m.id === ids.replyId)) return;
      const at = new Date().toISOString();
      MOCK_CHAT_MESSAGES.push({
        id: ids.replyId,
        deviceId: session.deviceId,
        threadKind: kind,
        personaId: cmd.personaId,
        sessionId: session.sessionId,
        role: "assistant",
        content: mockChatReply(persona?.name ?? null, message),
        executionId,
        createdAt: at,
      });
      const i = MOCK_CHAT_SESSIONS.findIndex((s) => s.threadKind === kind && s.sessionId === session.sessionId);
      if (i !== -1) MOCK_CHAT_SESSIONS[i] = { ...MOCK_CHAT_SESSIONS[i], updatedAt: at };
      changed();
    }, MOCK_CHAT_TIMINGS.replyMs);
  }

  const result: Record<string, unknown> = { sessionId: session.sessionId, userMessageId: ids.userMessageId };
  if (executionId) result.executionId = executionId;
  return { id: cmd.id, status: "completed", result };
}

/** Command ids a mock `channel_say` has delivered: the same id again writes nothing. */
const saidCommandIds = new Set<string>();

/**
 * `channel_say` (contract: params `{ message }`; result `{ messageId, changed }`).
 * The message id is the command id; the same id again completes with
 * `changed: false`. Refuses like the desktop: a bad / empty / over-2000-code-
 * point message, an unknown persona. It starts no run and gets no reply. The
 * demo has no App Master marker, so every known persona takes a direction.
 */
function executeSay(cmd: MockCommand): CommandRowUpdate {
  const raw = cmd.params.message;
  if (typeof raw !== "string") return { id: cmd.id, status: "failed", error_message: "bad_params" };
  const message = raw.trim();
  if (message.length === 0) return { id: cmd.id, status: "failed", error_message: "empty_message" };
  if (Array.from(message).length > SAY_MAX_CHARS) return { id: cmd.id, status: "failed", error_message: "message_too_long" };
  if (!MOCK_PERSONAS.some((p) => p.id === cmd.personaId)) return { id: cmd.id, status: "failed", error_message: "not_found" };
  const changed = !saidCommandIds.has(cmd.id);
  saidCommandIds.add(cmd.id);
  return { id: cmd.id, status: "completed", result: { messageId: cmd.id, changed } };
}

/** Run the verb against the fixtures; returns the row the desktop would write. */
function execute(cmd: MockCommand, schedule: Schedule, changed: () => void): CommandRowUpdate {
  // Athena is not a persona: a chat is answered before the persona lookup.
  if (cmd.verb === "chat_send") return executeChat(cmd, schedule, changed);
  if (cmd.verb === "channel_say") return executeSay(cmd);

  const idx = MOCK_PERSONAS.findIndex((p) => p.id === cmd.personaId);
  if (idx === -1) return { id: cmd.id, status: "failed", error_message: "not_found" };
  const persona = MOCK_PERSONAS[idx];

  if (cmd.verb === "pause_persona" || cmd.verb === "resume_persona") {
    const enabled = cmd.verb === "resume_persona";
    const flipped = persona.enabled !== enabled;
    if (flipped) {
      MOCK_PERSONAS[idx] = { ...persona, enabled, updatedAt: new Date().toISOString() };
      changed();
    }
    return { id: cmd.id, status: "completed", result: { enabled, changed: flipped } };
  }

  if (cmd.verb === "cancel_execution") {
    const executionId = typeof cmd.params.executionId === "string" ? cmd.params.executionId : "";
    const ei = MOCK_EXECUTIONS.findIndex((e) => e.id === executionId);
    if (ei === -1) return { id: cmd.id, status: "failed", error_message: "not_found: execution" };
    const exec = MOCK_EXECUTIONS[ei];
    // The desktop's owner check (verify_execution_owner): the execution must be this persona's.
    if (exec.personaId !== cmd.personaId) {
      return { id: cmd.id, status: "failed", error_message: "forbidden: execution belongs to another persona" };
    }
    const live = exec.status === "running" || exec.status === "queued";
    if (live) {
      const now = new Date();
      const started = exec.startedAt ? Date.parse(exec.startedAt) : NaN;
      MOCK_EXECUTIONS[ei] = {
        ...exec,
        status: "cancelled",
        completedAt: now.toISOString(),
        durationMs: Number.isFinite(started) ? Math.max(0, now.getTime() - started) : exec.durationMs,
      };
      changed();
    }
    return { id: cmd.id, status: "completed", result: { executionId, changed: live, wasQueued: exec.status === "queued" } };
  }

  if (cmd.verb === "run_persona") {
    const executionId = mockRunExecutionId(cmd.id);
    if (!MOCK_EXECUTIONS.some((e) => e.id === executionId)) {
      const prompt = typeof cmd.params.prompt === "string" ? cmd.params.prompt : null;
      MOCK_EXECUTIONS.unshift(queuedExecution(executionId, persona, prompt));
      changed();
      scheduleRunLifecycle(executionId, schedule, changed, MOCK_RUN_TIMINGS, "Run finished on the demo computer.");
    }
    return { id: cmd.id, status: "completed", result: { executionId } };
  }

  // Any other verb has no scripted outcome: refuse honestly, as an older desktop would.
  return { id: cmd.id, status: "rejected", error_message: `unsupported_command_type: the demo desktop does not run ${cmd.verb}` };
}

/**
 * Start the simulated round trip. `onUpdate` receives each row change, the
 * same shape a Realtime UPDATE carries. Returns a cancel function that stops
 * every timer the command started, including a run's execution lifecycle.
 * Throws when the tab is hidden, so nothing is started that nobody can watch.
 */
export function runMockCommand(cmd: MockCommand, onUpdate: (row: CommandRowUpdate) => void, deps: MockPlaneDeps = {}): () => void {
  const hidden = deps.isHidden ?? (() => typeof document !== "undefined" && document.hidden);
  if (hidden()) throw new Error("hidden: the demo desktop does not start in a background tab");
  const changed = deps.onFixtureChange ?? (() => {});
  const timers: ReturnType<typeof setTimeout>[] = [];
  let stopped = false;
  const schedule: Schedule = (fn, ms) => {
    timers.push(setTimeout(fn, ms));
  };
  schedule(() => onUpdate({ id: cmd.id, status: "executing" }), MOCK_TIMINGS.executingMs);
  schedule(() => {
    if (cmd.verb !== "review_decide") {
      onUpdate(execute(cmd, schedule, changed));
      return;
    }
    // The verdict goes through the api, which answers asynchronously.
    executeReviewDecide(cmd, deps.reviews ?? apiReviews)
      .catch((err: unknown): CommandRowUpdate => ({ id: cmd.id, status: "failed", error_message: err instanceof Error ? err.message : "failed" }))
      .then((row) => {
        if (!stopped) onUpdate(row);
      });
  }, MOCK_TIMINGS.completedMs);
  return () => {
    stopped = true;
    for (const t of timers) clearTimeout(t);
  };
}
