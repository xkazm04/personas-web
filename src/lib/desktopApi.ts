/**
 * The desktop plane: the desktop's management API (:9420, reached through the
 * `/api/orchestrator` proxy with `ORCHESTRATOR_TARGET=desktop`) mapped into the
 * web's own types. Every `/api/*` answer is an envelope `{ success, data?,
 * error?, code? }`; rows are snake_case (the sync mirror's shape, so the mappers
 * are shared with `supabaseApi` via `desktopRows`). Methods not overridden here
 * go to `base`, whose unserved shapes get the proxy's typed 501.
 *
 * A field the desktop does not send gets its type's empty value (null where
 * nullable, '' for strings, 0 for numbers), never an invented one.
 */
import { ApiError } from "./api-error";
import type { ApiClient, ExecutionAck } from "./api";
import { executionDetailFromRow, mapExecution, type ExecutionRow } from "./desktopRows";
import type { ExecFilterOpts, HealthResponse, Persona, StatusResponse } from "./types";

/** `orchestratorFetch`'s signature. */
export type DesktopFetcher = <T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | undefined>;
    timeoutMs?: number;
  },
) => Promise<T>;

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/** `GET /health` is the one answer that is not wrapped. */
interface HealthBody {
  status: string;
  timestamp: number;
}

interface DesktopPersonaRow {
  id: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  icon?: string | null;
  color?: string | null;
  /** Detail only, capped at 500 chars by the desktop. */
  system_prompt?: string;
}

/** The desktop's GlobalExecutionRow: a PersonaExecution plus persona_* columns the web does not read. */
type DesktopExecutionRow = ExecutionRow;

function unwrap<T>(env: Envelope<T>): T {
  if (env?.success === true && env.data !== undefined && env.data !== null) return env.data;
  const reason = env?.error ?? "desktop answered without data";
  throw new ApiError(502, env?.code ? `${reason} (${env.code})` : reason);
}

function mapDesktopPersona(r: DesktopPersonaRow): Persona {
  return {
    id: r.id,
    projectId: "",
    name: r.name,
    description: r.description ?? null,
    systemPrompt: r.system_prompt ?? "",
    structuredPrompt: null,
    icon: r.icon ?? null,
    color: r.color ?? null,
    enabled: r.enabled,
    maxConcurrent: 0,
    timeoutMs: 0,
    modelProfile: null,
    maxBudgetUsd: null,
    maxTurns: null,
    designContext: null,
    groupId: null,
    createdAt: "",
    updatedAt: "",
  };
}

const DEFAULT_PAGE = 50;

export function createDesktopApi(fetcher: DesktopFetcher, base: ApiClient): ApiClient {
  const call = async <T>(path: string, options?: Parameters<DesktopFetcher>[1]): Promise<T> =>
    unwrap(await fetcher<Envelope<T>>(path, options));

  return {
    ...base,

    listPersonas: async () => (await call<DesktopPersonaRow[]>("/api/personas")).map(mapDesktopPersona),

    getPersona: async (id: string) => mapDesktopPersona(await call<DesktopPersonaRow>(`/api/personas/${id}`)),

    // The desktop has no offset: ask for limit+offset rows and drop the first offset here.
    listExecutions: async (opts?: ExecFilterOpts) => {
      const offset = Math.max(0, Math.floor(opts?.offset ?? 0));
      const limit = offset > 0 ? (opts?.limit ?? DEFAULT_PAGE) + offset : opts?.limit;
      const rows = await call<DesktopExecutionRow[]>("/api/executions", {
        params: {
          persona_id: opts?.personaId,
          status: opts?.status,
          limit: limit?.toString(),
        },
      });
      return rows.slice(offset).map(mapExecution);
    },

    // Not forwarded: the row carries the whole buffer, the cursor is applied here.
    getExecution: async (id: string, offset?: number) =>
      executionDetailFromRow(await call<DesktopExecutionRow>(`/api/executions/${id}`), offset),

    cancelExecution: (id: string) => call<ExecutionAck>(`/api/executions/${id}/cancel`, { method: "POST" }),

    executePersona: (personaId: string, prompt: string) =>
      call<ExecutionAck>("/api/execute", { method: "POST", body: { personaId, prompt } }),

    getStatus: () => call<StatusResponse>("/api/status"),

    getHealth: async (): Promise<HealthResponse> => {
      const [health, status] = await Promise.all([
        fetcher<HealthBody>("/health"),
        call<StatusResponse>("/api/status"),
      ]);
      return {
        status: health.status,
        timestamp: health.timestamp,
        workers: status.workerCounts,
        hasSubscription: status.hasClaudeToken,
      };
    },
  };
}
