"use client";

import { useEffect, useRef } from "react";
import { DEVELOPMENT } from "@/lib/dev";
import { useAuthStore } from "@/stores/authStore";
import { useEventStore } from "@/stores/eventStore";
import type { PersonaEvent } from "@/lib/types";

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const FALLBACK_POLL_MS = 10_000;

function isPageVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

/**
 * Connects to the orchestrator's SSE event stream.
 * - On each `event` message, appends to the store (deduped).
 * - Falls back to polling if SSE connection fails or in dev mode.
 * - Auto-reconnects with exponential backoff on disconnect.
 */
export function useEventStream() {
  const appendEvent = useEventStore((s) => s.appendEvent);
  const fetchEvents = useEventStore((s) => s.fetchEvents);
  const isDemo = useAuthStore((s) => s.isDemo);
  const appendRef = useRef(appendEvent);
  appendRef.current = appendEvent;
  const fetchRef = useRef(fetchEvents);
  fetchRef.current = fetchEvents;

  useEffect(() => {
    // In dev/demo mode, SSE endpoint doesn't exist — fall back to polling
    if (DEVELOPMENT || isDemo) {
      let pollTimer: ReturnType<typeof setTimeout> | null = null;
      let disposed = false;

      const schedulePoll = () => {
        if (disposed) return;
        pollTimer = setTimeout(() => {
          pollTimer = null;
          if (isPageVisible()) {
            void fetchRef.current();
          }
          schedulePoll();
        }, FALLBACK_POLL_MS);
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          void fetchRef.current();
        }
      };

      document.addEventListener("visibilitychange", onVisibilityChange);
      schedulePoll();

      return () => {
        disposed = true;
        if (pollTimer) clearTimeout(pollTimer);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }

    let es: EventSource | null = null;
    let reconnectMs = RECONNECT_BASE_MS;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    function stopFallbackPolling() {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    }

    function scheduleFallbackPolling() {
      if (disposed || fallbackTimer) return;
      fallbackTimer = setTimeout(() => {
        fallbackTimer = null;
        if (isPageVisible()) {
          void fetchRef.current();
        }
        scheduleFallbackPolling();
      }, FALLBACK_POLL_MS);
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchRef.current();
      }
    };

    function connect() {
      if (disposed) return;

      // Stop fallback polling while SSE is active
      stopFallbackPolling();

      es = new EventSource("/api/events/stream");

      es.addEventListener("event", (e: MessageEvent) => {
        try {
          const event: PersonaEvent = JSON.parse(e.data);
          appendRef.current(event);
        } catch {
          // Ignore malformed messages
        }
      });

      es.onopen = () => {
        // Reset backoff on successful connection
        reconnectMs = RECONNECT_BASE_MS;
      };

      es.onerror = () => {
        // Close and schedule reconnect
        es?.close();
        es = null;

        if (disposed) return;

        // Start fallback polling immediately so we don't go blind
        scheduleFallbackPolling();

        // Schedule SSE reconnect with exponential backoff
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, reconnectMs);

        reconnectMs = Math.min(reconnectMs * 2, RECONNECT_MAX_MS);
      };
    }

    connect();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopFallbackPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isDemo]);
}
