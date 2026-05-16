"use client";

import { useEffect } from "react";

type AbortableCallback = (signal: AbortSignal) => void | (() => void);

interface Options {
  /** Abort after this many ms if not yet completed. */
  timeoutMs?: number;
}

/**
 * useEffect wrapper that supplies an AbortSignal and tears it down on
 * unmount or before the next run. Optionally fires the abort after a
 * timeout — useful when a hung backend would otherwise dangle the
 * socket for a full edge timeout.
 */
export function useAbortableEffect(
  callback: AbortableCallback,
  deps: React.DependencyList,
  { timeoutMs }: Options = {},
): void {
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId =
      timeoutMs !== undefined ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
    const cleanup = callback(controller.signal);
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      controller.abort();
      cleanup?.();
    };
    // deps come from the caller; callback + timeoutMs are intentionally not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
