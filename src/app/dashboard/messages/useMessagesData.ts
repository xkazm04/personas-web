"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { getSyncedMessageThreads } from "@/lib/supabaseApi";
import { MOCK_MESSAGE_THREADS, type MessageThread } from "@/lib/mock-dashboard-data";

export interface MessagesData {
  threads: MessageThread[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Messages module data source. Dev/demo → the static mock threads (unchanged
 * behavior). Real/supabase mode → synced_messages grouped into threads. The
 * page layers per-message read-state overrides on top of whatever base list
 * this returns.
 */
export function useMessagesData(): MessagesData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  // isDemo can flip mid-session, and a real→demo switch must replace the
  // previous tenant's threads instead of leaving them on screen. That's done by
  // DERIVING the demo values during render — only the fetched half is state.
  // Re-seeding from the effect instead cost an extra render pass before paint
  // and still showed one frame of the previous tenant's threads.
  const [fetchedThreads, setFetchedThreads] = useState<MessageThread[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Demo mode has nothing to fetch; the mock threads are derived below.
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const t = await getSyncedMessageThreads();
        if (cancelled) return;
        setFetchedThreads(t);
        setFetchError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useMessagesData" } });
        setFetchError(
          err instanceof Error ? err.message : "Failed to load messages",
        );
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  const threads = useMock ? MOCK_MESSAGE_THREADS : fetchedThreads;
  const loading = useMock ? false : fetchLoading;
  const error = useMock ? null : fetchError;

  return { threads, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
