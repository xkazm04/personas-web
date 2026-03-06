import type { PersonaExecution, PersonaEventSubscription, PersonaTrigger } from "@/lib/types";

export interface AgentDetailData {
  executions: PersonaExecution[];
  subscriptions: PersonaEventSubscription[];
  triggers: PersonaTrigger[];
}

const DETAIL_CACHE_TTL_MS = 300_000;
const detailCache = new Map<
  string,
  { data: AgentDetailData; expiresAt: number }
>();

export function getCachedAgentDetail(personaId: string): AgentDetailData | null {
  const cached = detailCache.get(personaId);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    detailCache.delete(personaId);
    return null;
  }
  return cached.data;
}

export function setCachedAgentDetail(personaId: string, data: AgentDetailData): void {
  detailCache.set(personaId, {
    data,
    expiresAt: Date.now() + DETAIL_CACHE_TTL_MS,
  });
}

export function invalidateAgentDetailCache(personaId: string): void {
  detailCache.delete(personaId);
}
