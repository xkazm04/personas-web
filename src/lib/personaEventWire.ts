import { fromWireEventStatus } from "./eventWireStatus";
import type { PersonaEvent } from "./types";

/**
 * The web's pinned reading of one orchestrator SSE `event` message.
 *
 * `/api/events/stream` relays the orchestrator's stream byte for byte, so the
 * shape here is a contract with a repo this one cannot test against. The
 * orchestrator owns the schema; this module is the consumer's half of it, and
 * `personaEventWire.test.ts` pins it. A message that breaks the contract is
 * dropped rather than cast, so an upstream rename shows up as a quiet feed
 * (polling still runs) instead of rows with `undefined` ids in the store.
 * See "Schema mismatch" in `docs/degraded-dependencies.md`.
 *
 * Required: the identity and ordering fields every view keys on. Nullable
 * fields may be absent (read as null: unknown is not empty). `status` is read
 * through `fromWireEventStatus`, so the desktop's `delivered` / `completed`
 * arrive as `processed` here exactly as they do on the Supabase plane.
 */
const REQUIRED_STRINGS = ["id", "projectId", "eventType", "sourceType", "createdAt"] as const;
const NULLABLE_STRINGS = [
  "sourceId",
  "targetPersonaId",
  "payload",
  "errorMessage",
  "processedAt",
  "useCaseId",
] as const;

function nullableString(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  return typeof value === "string" ? value : undefined;
}

/** A decoded wire object as a PersonaEvent, or null when it breaks the contract. */
export function toPersonaEvent(raw: unknown): PersonaEvent | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;

  for (const key of REQUIRED_STRINGS) {
    if (typeof row[key] !== "string" || row[key] === "") return null;
  }
  const status = typeof row.status === "string" ? fromWireEventStatus(row.status) : null;
  if (status === null) return null;

  const nullable: Partial<Record<(typeof NULLABLE_STRINGS)[number], string | null>> = {};
  for (const key of NULLABLE_STRINGS) {
    const value = nullableString(row[key]);
    if (value === undefined) return null;
    nullable[key] = value;
  }

  const retry = row.retryCount;
  if (retry !== undefined && retry !== null && (typeof retry !== "number" || !Number.isInteger(retry) || retry < 0)) {
    return null;
  }

  return {
    id: row.id as string,
    projectId: row.projectId as string,
    eventType: row.eventType as string,
    sourceType: row.sourceType as string,
    sourceId: nullable.sourceId ?? null,
    targetPersonaId: nullable.targetPersonaId ?? null,
    payload: nullable.payload ?? null,
    status,
    errorMessage: nullable.errorMessage ?? null,
    processedAt: nullable.processedAt ?? null,
    useCaseId: nullable.useCaseId ?? null,
    createdAt: row.createdAt as string,
    retryCount: typeof retry === "number" ? retry : null,
  };
}

/** One SSE `event` message's `data` as a PersonaEvent, or null when it is not JSON or breaks the contract. */
export function parseStreamEvent(data: string): PersonaEvent | null {
  let raw: unknown;
  try {
    raw = JSON.parse(data);
  } catch {
    return null;
  }
  return toPersonaEvent(raw);
}
