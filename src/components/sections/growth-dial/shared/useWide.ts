"use client";

import { useSyncExternalStore } from "react";

/* Below 64rem the wide composition would shrink its type under the floor, so
 * the section draws its phone-sized dial instead. The section is client-only
 * (ssr: false), so choosing the layout by width never meets a server render. */

const WIDE = "(min-width: 64rem)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True at 64rem and up, where the wide dial is shown. */
export function useWide(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}
