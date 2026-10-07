/**
 * Tab badge counts for the Events page. A count is left undefined (the tab
 * hides it) when the number is unknown rather than zero.
 */
export function tabCounts(input: {
  events: readonly unknown[];
  listNotServed: boolean;
  subscriptions: readonly unknown[];
  subscriptionsRead: boolean;
}): { eventCount?: number; subscriptionCount?: number } {
  return {
    eventCount: input.listNotServed && input.events.length === 0 ? undefined : input.events.length,
    subscriptionCount: input.subscriptionsRead ? input.subscriptions.length : undefined,
  };
}
