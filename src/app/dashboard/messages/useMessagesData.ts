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

  const [threads, setThreads] = useState<MessageThread[]>(
    useMock ? MOCK_MESSAGE_THREADS : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // isDemo can flip mid-session; re-seed the mock explicitly so a real→demo
    // switch replaces the previous tenant's threads instead of leaving them.
    if (useMock) {
      setThreads(MOCK_MESSAGE_THREADS);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const t = await getSyncedMessageThreads();
        if (cancelled) return;
        setThreads(t);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useMessagesData" } });
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  return { threads, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
