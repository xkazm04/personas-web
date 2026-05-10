import { mutate } from "swr";
import { usePersonaStore } from "@/stores/personaStore";
import { useEventStore } from "@/stores/eventStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";
import { useDashboardFilterStore } from "@/stores/dashboardFilterStore";

/**
 * Drop every in-memory cache that holds user-scoped data. Called on auth
 * transitions (logout, user switch) so a freshly signed-in account never sees
 * the previous account's personas, executions, subscriptions, triggers,
 * tool-usage, performance metrics, system health, or filter selections —
 * even before the first refetch completes.
 *
 * Lives in lib/ rather than authStore so each store stays free of an
 * authStore import (would cycle: authStore → store → authStore).
 *
 * The SWR predicate is `() => true` (wipe everything). The previous
 * `key[0] === "dashboard"` predicate matched only array-form keys and
 * silently missed the string-keyed `useSWR("observability", ...)` /
 * `useSWR("usage", ...)` caches that hold per-user tool-usage and
 * performance metrics. The safe default for "logout" is to drop all SWR
 * cache and let consumers refetch — there is no shared, non-user-scoped
 * data on the dashboard that would benefit from being preserved here.
 */
export function clearUserScopedCaches(): void {
  // Wipe every SWR cache entry. Includes both array-form dashboard keys
  // and the string-keyed observability/usage caches.
  void mutate(() => true, undefined, { revalidate: false });
  usePersonaStore.getState().reset();
  useEventStore.getState().reset();
  useExecutionStore.getState().reset();
  useReviewStore.getState().reset();
  useSystemStore.getState().reset();
  // Filter store persists `personaId` to localStorage; without this reset
  // the next user briefly sees results filtered by the previous user's
  // selected persona.
  useDashboardFilterStore.getState().reset();
}
