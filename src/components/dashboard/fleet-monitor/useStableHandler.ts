"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * A callback whose identity never changes but which always runs the latest
 * `fn`. Hand it to memoised children (tiles, windows) so a parent re-render
 * does not invalidate every child's props just because a closure was rebuilt.
 * Only call it from event handlers, never during render.
 */
export function useStableHandler<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current(...args), []);
}
