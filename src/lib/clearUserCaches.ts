import { clearAgentDetailCache } from "@/lib/agentDetailCache";
import { usePersonaStore } from "@/stores/personaStore";
import { useEventStore } from "@/stores/eventStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useReviewStore } from "@/stores/reviewStore";

/**
 * Drop every in-memory cache that holds user-scoped data. Called on auth
 * transitions (logout, user switch) so a freshly signed-in account never sees
 * the previous account's personas, executions, subscriptions, triggers, or
 * pending reviews — even before the first refetch completes.
 *
 * Lives in lib/ rather than authStore so each store stays free of an
 * authStore import (would cycle: authStore → store → authStore).
 */
export function clearUserScopedCaches(): void {
  clearAgentDetailCache();
  usePersonaStore.getState().reset();
  useEventStore.getState().reset();
  useExecutionStore.getState().reset();
  useReviewStore.getState().reset();
}
