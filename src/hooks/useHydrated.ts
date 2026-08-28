"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `false` on the server AND during the hydrating client render; `true` on every
 * render after that.
 *
 * The problem it solves: a Zustand `persist` store rehydrates from
 * `localStorage` synchronously while its module evaluates — before React calls
 * any component. So a component that reads a persisted value *during render*
 * sees the store's default on the server and the persisted value on the
 * client's first render, and the two disagree. In this app the disagreement is
 * near-guaranteed rather than occasional: the pre-paint script in
 * `app/layout.tsx` picks a theme **at random** from eleven ids on a first
 * visit, so the server's `dark-midnight` matched roughly one time in eleven.
 *
 * `useSyncExternalStore` is the right primitive because React deliberately uses
 * `getServerSnapshot` for the hydrating render too — so the first client paint
 * agrees with the server by construction, and the real value arrives on the
 * next commit rather than as a mismatch.
 *
 * Use it to pick a value, not to gate an element:
 *
 *   const hydrated = useHydrated();
 *   const activeId = hydrated ? themeId : DEFAULT_THEME_ID;
 *
 * Returning `null` until hydrated is the tempting shape and the wrong one — it
 * changes DOM structure across the correcting commit, which is the same class
 * of reflow `useStillMotion` exists to avoid.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
