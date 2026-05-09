import useSWR from "swr";
import { api } from "@/lib/api";
import type { PersonaExecution, PersonaEventSubscription, PersonaTrigger } from "@/lib/types";

export interface AgentDetailData {
  executions: PersonaExecution[];
  subscriptions: PersonaEventSubscription[];
  triggers: PersonaTrigger[];
}

export const dashboardKeys = {
  agentDetail: (personaId: string) => ["dashboard", "agent-detail", personaId] as const,
};

export async function loadAgentDetail(personaId: string): Promise<AgentDetailData> {
  const [executions, subscriptions, triggers] = await Promise.all([
    api.listExecutions({ personaId, limit: 5 }),
    api.listSubscriptions(personaId),
    api.listTriggers(personaId),
  ]);

  return { executions, subscriptions, triggers };
}

export function useAgentDetail(personaId: string) {
  return useSWR(
    dashboardKeys.agentDetail(personaId),
    ([, , id]) => loadAgentDetail(id),
    {
      dedupingInterval: 60_000,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );
}
