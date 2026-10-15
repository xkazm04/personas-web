/**
 * Tab badge counts for the Events page. A count is left undefined (the tab
 * hides it) when the number is unknown rather than zero. "Unknown" is judged on
 * the whole loaded log; the number shown is the scope bar's slice of it when
 * one is given (the list tab shows that slice).
 */
export function tabCounts(input: {
  events: readonly unknown[];
  scopedEvents?: readonly unknown[];
  listNotServed: boolean;
  subscriptions: readonly unknown[];
  subscriptionsRead: boolean;
}): { eventCount?: number; subscriptionCount?: number } {
  return {
    eventCount:
      input.listNotServed && input.events.length === 0 ? undefined : (input.scopedEvents ?? input.events).length,
    subscriptionCount: input.subscriptionsRead ? input.subscriptions.length : undefined,
  };
}
