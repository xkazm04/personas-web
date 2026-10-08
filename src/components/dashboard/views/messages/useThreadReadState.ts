import { useCallback, useMemo, useState } from "react";

import type { MessageStatus, MessageThread } from "@/lib/mock-dashboard-data";

/**
 * Layers per-message read overrides over the base threads: flips each
 * message's status, recomputes `unreadCount`, and sorts newest thread first.
 * Pure, so the fixture and the synced rows are never mutated.
 */
export function applyReadOverrides(
  threads: readonly MessageThread[],
  overrides: ReadonlyMap<string, MessageStatus>,
): MessageThread[] {
  return threads
    .map((thread) => {
      const parent = {
        ...thread.parent,
        status: overrides.get(thread.parent.id) ?? thread.parent.status,
      };
      const replies = thread.replies.map((r) => ({
        ...r,
        status: overrides.get(r.id) ?? r.status,
      }));
      const unreadCount = [parent, ...replies].filter((m) => m.status === "unread").length;
      return { ...thread, parent, replies, unreadCount };
    })
    .sort(
      (a, b) =>
        new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
    );
}

/** Returns a copy of `overrides` with every message of `threads` marked read. */
export function withThreadsRead(
  overrides: ReadonlyMap<string, MessageStatus>,
  threads: readonly MessageThread[],
): Map<string, MessageStatus> {
  const next = new Map(overrides);
  for (const thread of threads) {
    next.set(thread.parent.id, "read");
    for (const r of thread.replies) next.set(r.id, "read");
  }
  return next;
}

/** Read state shared by the desk and phone layouts of the Messages view. */
export function useThreadReadState(baseThreads: readonly MessageThread[]) {
  const [overrides, setOverrides] = useState<Map<string, MessageStatus>>(() => new Map());

  const threads = useMemo(
    () => applyReadOverrides(baseThreads, overrides),
    [baseThreads, overrides],
  );
  const unreadCount = useMemo(
    () => threads.reduce((sum, th) => sum + th.unreadCount, 0),
    [threads],
  );

  const markThreadRead = useCallback((thread: MessageThread) => {
    setOverrides((prev) => withThreadsRead(prev, [thread]));
  }, []);
  const markAllRead = useCallback(() => {
    setOverrides((prev) => withThreadsRead(prev, threads));
  }, [threads]);

  return { threads, unreadCount, markThreadRead, markAllRead };
}
