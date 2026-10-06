import { create } from "zustand";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { usePersonaStore } from "@/stores/personaStore";
import {
  addCommand,
  applyRowUpdate,
  isTerminal,
  openIds,
  overdueIds,
  type CommandRowUpdate,
  type InflightCommand,
  type InflightMap,
} from "@/lib/commands/commandReducer";
import { COMMAND_TTL_MS, type CommandVerb } from "@/lib/commands/envelope";

/**
 * The web's command plane (PHASE2-SPEC.md 2.4): send a verb, then follow it
 * to its outcome.
 *
 * - **Live** (supabase plane): a signed `pending_commands` row; updates arrive
 *   as Realtime UPDATE payloads (`useSyncedRealtime` -> `applyRow`, no
 *   refetch), with a 5 s backstop poll while anything is open and the tab is
 *   visible, and the web marks a row still pending 15 s past `expires_at` as
 *   expired.
 * - **Demo**: the scripted desktop in `mockCommandPlane`.
 *
 * Both planes load lazily, so this store adds only the pure reducer to the
 * dashboard's first load.
 */

export interface CommandTarget {
  personaId: string;
  /** The desktop that owns the persona (`synced_personas.device_id`); unused in demo. */
  deviceId: string | null;
  /**
   * Demo session: run against the scripted desktop. Passed in (from
   * `authStore.isDemo`) rather than read here, so this store, which
   * `clearUserScopedCaches` resets, never imports authStore (that would cycle).
   */
  demo: boolean;
}

interface CommandState {
  inflight: InflightMap;
  /** Send a verb. Resolves with the command id once it is sent (or recorded as failed). */
  send: (verb: CommandVerb, target: CommandTarget, params?: Record<string, unknown>) => Promise<string>;
  /** A row change from Realtime, the poll, the expiry, or the demo desktop. */
  applyRow: (row: CommandRowUpdate) => void;
  reset: () => void;
}

const POLL_MS = 5_000;

let ticker: ReturnType<typeof setInterval> | null = null;
const mockCancels = new Map<string, () => void>();

function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

/** Backstop poll + web-side expiry, live plane only. Stops itself when nothing is open. */
async function tick() {
  const { inflight, applyRow } = useCommandStore.getState();
  const open = openIds(inflight);
  if (open.length === 0) {
    stopTicker();
    return;
  }
  if (typeof document !== "undefined" && document.hidden) return;
  try {
    const live = await import("@/lib/commands/liveCommandPlane");
    for (const row of await live.pollLiveCommands(open)) applyRow(row);
    const now = Date.now();
    for (const id of overdueIds(useCommandStore.getState().inflight, now)) {
      if (await live.expireLiveCommand(id, new Date(now).toISOString())) {
        applyRow({ id, status: "expired", error_message: live.EXPIRED_MESSAGE });
      }
    }
  } catch (err) {
    captureExceptionScrubbed(err, { tags: { scope: "commandPoll" } });
  }
}

function startTicker() {
  if (!ticker) ticker = setInterval(() => void tick(), POLL_MS);
}

/**
 * Re-read the executions list. Loaded lazily: executionStore follows commands
 * (`settleCommand`), so a static import here would make the two a cycle.
 */
function refetchExecutions() {
  void import("@/stores/executionStore").then((m) => m.useExecutionStore.getState().fetchExecutions());
}

/** The demo desktop wrote its fixtures: re-read what the rows show. */
function onDemoFixtureChange() {
  refetchExecutions();
}

export const useCommandStore = create<CommandState>((set, get) => ({
  inflight: {},
  send: async (verb, target, params = {}) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    set((s) => ({
      inflight: addCommand(s.inflight, {
        id,
        verb,
        personaId: target.personaId,
        status: "pending",
        result: null,
        error: null,
        requestedAt: now,
        expiresAt: now + COMMAND_TTL_MS,
      }),
    }));

    const fail = (err: unknown, reason: string) => {
      captureExceptionScrubbed(err, { tags: { scope: "commandSend" } });
      get().applyRow({ id, status: "failed", error_message: reason });
    };

    if (target.demo) {
      try {
        const mock = await import("@/lib/commands/mockCommandPlane");
        const cmd = { id, verb, personaId: target.personaId, params };
        mockCancels.set(id, mock.runMockCommand(cmd, (row) => get().applyRow(row), { onFixtureChange: onDemoFixtureChange }));
      } catch (err) {
        fail(err, err instanceof Error ? err.message : "not_sent");
      }
      return id;
    }

    if (!target.deviceId) {
      fail(new Error("no_device"), "no_device");
      return id;
    }
    try {
      const live = await import("@/lib/commands/liveCommandPlane");
      await live.sendLiveCommand({ id, verb, personaId: target.personaId, deviceId: target.deviceId, params, nowMs: now });
      startTicker();
    } catch (err) {
      fail(err, err instanceof Error ? err.message : "not_sent");
    }
    return id;
  },
  applyRow: (row) => {
    const before = get().inflight[row.id];
    const inflight = applyRowUpdate(get().inflight, row);
    if (inflight === get().inflight) return;
    set({ inflight });
    const after = inflight[row.id];
    if (after.status !== "completed" || before?.status === "completed") return;
    // A demo run keeps its timers past completion: they drive its execution's lifecycle.
    if (after.verb !== "run_persona") mockCancels.delete(row.id);
    // A pause/resume changed the persona: pull the synced truth now rather than
    // waiting out the persona cache (the row shows the reported value meanwhile).
    if (after.verb === "pause_persona" || after.verb === "resume_persona") {
      void usePersonaStore.getState().fetchPersonas({ force: true });
    }
    // A run or a cancel changed the executions: read them now (the live mirror
    // also pushes them over Realtime once the desktop's next sync pass lands).
    if (after.verb === "run_persona" || after.verb === "cancel_execution") refetchExecutions();
  },
  reset: () => {
    stopTicker();
    for (const cancel of mockCancels.values()) cancel();
    mockCancels.clear();
    set({ inflight: {} });
  },
}));

/**
 * Resolve when a command reaches a terminal state (its outcome), or with null
 * when it is unknown or the plane is reset (sign-out) before it settles.
 * For callers that act on the outcome rather than show it, e.g. the
 * executions table's Cancel on the command plane.
 */
export function settleCommand(id: string): Promise<InflightCommand | null> {
  return new Promise((resolve) => {
    const settled = (inflight: InflightMap): boolean => {
      const cmd = inflight[id];
      if (!cmd) {
        resolve(null);
        return true;
      }
      if (!isTerminal(cmd.status)) return false;
      resolve(cmd);
      return true;
    };
    if (settled(useCommandStore.getState().inflight)) return;
    const unsubscribe = useCommandStore.subscribe((s) => {
      if (settled(s.inflight)) unsubscribe();
    });
  });
}
