/**
 * The web's view of its in-flight commands (PHASE2-SPEC.md 2.3, 2.4), as pure
 * functions over a record keyed by command id. Updates arrive from three
 * places that can race: the Realtime UPDATE stream, the 5 s backstop poll,
 * and the web-side expiry. The rule that makes them commute: a status only
 * moves forward (pending -> executing -> a terminal state), and a terminal
 * state is final, so a late "executing" can never undo a "completed".
 */
import type { CommandVerb } from "./envelope";
import { EXPIRY_GRACE_MS } from "./envelope";

/** The `pending_commands.status` values a v1 command can take (`approved` is unused). */
export type CommandStatus = "pending" | "executing" | "completed" | "failed" | "rejected" | "expired";

export interface InflightCommand {
  id: string;
  verb: CommandVerb;
  personaId: string;
  status: CommandStatus;
  /** Verb-specific outcome on `completed`, e.g. `{ enabled: false, changed: true }`. */
  result: Record<string, unknown> | null;
  /** The desktop's reason on failed / rejected / expired. */
  error: string | null;
  requestedAt: number;
  expiresAt: number;
}

export type InflightMap = Readonly<Record<string, InflightCommand>>;

/** The subset of a `pending_commands` row the web reads back. */
export interface CommandRowUpdate {
  id: string;
  status: string;
  result?: unknown;
  error_message?: string | null;
}

const RANK: Record<CommandStatus, number> = {
  pending: 0,
  executing: 1,
  completed: 2,
  failed: 2,
  rejected: 2,
  expired: 2,
};

const STATUSES = new Set<string>(Object.keys(RANK));

export function isTerminal(status: CommandStatus): boolean {
  return RANK[status] === 2;
}

export function isCommandStatus(value: string): value is CommandStatus {
  return STATUSES.has(value);
}

export function addCommand(map: InflightMap, cmd: InflightCommand): InflightMap {
  return { ...map, [cmd.id]: cmd };
}

/**
 * Apply a row from Realtime or the poll. Unknown ids (another tab's command,
 * an old row) and unknown statuses are ignored; a step backwards, or any step
 * out of a terminal state, is ignored. Returns the same map when nothing changed.
 */
export function applyRowUpdate(map: InflightMap, row: CommandRowUpdate): InflightMap {
  const cur = map[row.id];
  if (!cur || !isCommandStatus(row.status)) return map;
  const next = row.status;
  if (isTerminal(cur.status) || RANK[next] < RANK[cur.status]) return map;
  const result =
    row.result && typeof row.result === "object" && !Array.isArray(row.result)
      ? (row.result as Record<string, unknown>)
      : cur.result;
  const error = row.error_message ?? cur.error;
  if (next === cur.status && result === cur.result && error === cur.error) return map;
  return { ...map, [row.id]: { ...cur, status: next, result, error } };
}

/** Ids of commands still `pending` past `expiresAt + 15 s`: the web marks these expired. */
export function overdueIds(map: InflightMap, now: number): string[] {
  return Object.values(map)
    .filter((c) => c.status === "pending" && now >= c.expiresAt + EXPIRY_GRACE_MS)
    .map((c) => c.id);
}

/** Ids the backstop poll should ask about: everything not yet terminal. */
export function openIds(map: InflightMap): string[] {
  return Object.values(map)
    .filter((c) => !isTerminal(c.status))
    .map((c) => c.id);
}

/** The newest command for a persona (what its row's chip shows), or null. */
export function latestForPersona(map: InflightMap, personaId: string): InflightCommand | null {
  let best: InflightCommand | null = null;
  for (const c of Object.values(map)) {
    if (c.personaId === personaId && (best === null || c.requestedAt > best.requestedAt)) best = c;
  }
  return best;
}

/**
 * The `enabled` value a completed pause/resume reported, if that command is the
 * persona's latest. The row shows it at once; the synced persona becomes the
 * truth when its refetch lands (spec 2.4, effect reconciliation).
 */
export function reportedEnabled(cmd: InflightCommand | null): boolean | null {
  if (!cmd || cmd.status !== "completed") return null;
  if (cmd.verb !== "pause_persona" && cmd.verb !== "resume_persona") return null;
  const enabled = cmd.result?.enabled;
  return typeof enabled === "boolean" ? enabled : cmd.verb === "resume_persona";
}

/**
 * What a persona row shows as its on/off state. A completed pause/resume is
 * shown at once (spec 2.4); once the synced persona has been written after the
 * command was sent (`updatedAt` moved past `requestedAt`), the mirror is the
 * truth again, whatever it says.
 */
export function displayEnabled(persona: { enabled: boolean; updatedAt: string }, latest: InflightCommand | null): boolean {
  const reported = reportedEnabled(latest);
  if (reported === null || !latest) return persona.enabled;
  const updated = Date.parse(persona.updatedAt);
  return Number.isFinite(updated) && updated > latest.requestedAt ? persona.enabled : reported;
}
