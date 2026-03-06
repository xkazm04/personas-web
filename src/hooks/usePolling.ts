import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Generic polling hook. Calls `callback` immediately, then every `intervalMs`
 * while `enabled` is true. Cleans up on unmount or when disabled.
 */
export function usePolling(
  callback: () => Promise<void>,
  intervalMs: number,
  enabled: boolean,
) {
  const [isHidden, setIsHidden] = useState(
    () => typeof document !== "undefined" && document.visibilityState === "hidden",
  );

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const tick = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch {
      // Swallow — callers handle errors internally
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsHidden(document.visibilityState === "hidden");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled || isHidden) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        void run();
      }, intervalMs);
    };

    const run = async () => {
      if (cancelled) return;
      await tick();
      if (!cancelled) {
        scheduleNext();
      }
    };

    // Fire immediately, then schedule after each completed tick.
    void run();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, intervalMs, isHidden, tick]);
}
