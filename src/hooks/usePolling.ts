import { useEffect, useRef, useCallback } from "react";

/**
 * Generic polling hook. Calls `callback` immediately, then every `intervalMs`
 * while `enabled` is true. Cleans up on unmount or when disabled.
 */
export function usePolling(
  callback: () => Promise<void>,
  intervalMs: number,
  enabled: boolean,
) {
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
    if (!enabled) return;

    // Fire immediately
    void tick();

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, tick]);
}
