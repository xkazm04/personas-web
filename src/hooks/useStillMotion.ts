"use client";

import { useSyncExternalStore } from "react";

/**
 * `prefers-reduced-motion`, read as external state React can subscribe to —
 * the SSR-safe, live-updating replacement for framer's `useReducedMotion`.
 *
 * framer's hook is `useState(prefersReducedMotion.current)`: it samples the
 * media query on the first CLIENT render and never subscribes (its own source
 * carries a TODO about that). Two defects follow.
 *
 * 1. It is not SSR-safe. The server has no media query and answers "motion is
 *    fine" (framer's state module: "Returns `null` server-side"). Any component
 *    that branches its MARKUP — or its initial inline styles — on that answer
 *    then hydrates against HTML it did not produce, and React responds by
 *    throwing the whole tree away and re-rendering on the client: the most work
 *    possible for precisely the visitors who asked for less. On the Athena page
 *    that fired for real — the server sent `<video>` for the avatar while the
 *    client rendered the static poster.
 * 2. It is not live. A visitor who changes the OS setting keeps the old
 *    accommodation until a reload.
 *
 * `useSyncExternalStore` fixes both: React uses `getServerSnapshot` for the
 * hydrating render too, so the first client paint always matches the server and
 * the true preference arrives on the very next commit; and `subscribe` keeps it
 * current afterwards.
 *
 * Prefer gating an `animate` prop over dropping an element — then that second
 * commit is a stopped animation rather than a reflow.
 *
 * Components rendered exclusively behind `next/dynamic({ ssr: false })` or
 * `<LazyMount>` never server-render, so branching on shape there is safe; the
 * rule this hook exists to enforce is scoped accordingly.
 *
 * (Pattern borrowed from the sibling `kp` repo's `useStillMotion`, which
 * documents the same failure in its landing hero.)
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server cannot know, and guessing "reduced" would ship a still page to
// everyone for one frame. Guess "motion", then correct.
const getServerSnapshot = () => false;

/** True when the visitor has asked for reduced motion. Safe to SSR. */
export function useStillMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
