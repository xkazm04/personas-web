"use client";

import { useSyncExternalStore } from "react";

/** The desktop stage scope from `src/styles/stage.css`, verbatim. */
export const STAGE_QUERY = "(min-width: 64rem) and (min-height: 37.5rem)";
/** Below this the wide compositions would scale their type under the floor. */
export const NARROW_QUERY = "(max-width: 63.99rem)";

/** A live media-query answer; `false` on the server and the hydrating pass. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
