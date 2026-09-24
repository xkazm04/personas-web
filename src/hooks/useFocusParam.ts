"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";

import { DEMO_FOCUS_IDS, resolveFocus } from "@/lib/incidentThreads";
import { useStillMotion } from "./useStillMotion";

/**
 * The row a `?focus=<id>` deep link names, allow-listed against the demo's
 * known row ids (the query value is untrusted input), or null.
 *
 * Read through `useSyncExternalStore` with a null server snapshot instead of
 * Next's `useSearchParams`: the server and the hydrating render both see null,
 * so server markup never depends on the query and the page needs no Suspense
 * boundary; the real value arrives on the next commit. Consumers must treat it
 * as a CLASS or open-state change only, never a different element.
 *
 * Back/forward fires `popstate`. A client navigation INTO the route may render
 * before Next writes the URL (an insertion effect); React re-reads the
 * snapshot in its post-commit check, so the focus still lands.
 */

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const getSnapshot = () => new URLSearchParams(window.location.search).get("focus");
const getServerSnapshot = () => null;

export function useFocusParam(): string | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return resolveFocus(raw, DEMO_FOCUS_IDS);
}

/** Brings the focused row into view: smooth, or instant under reduced motion. */
export function useScrollIntoViewWhen(ref: RefObject<HTMLElement | null>, focused: boolean): void {
  const still = useStillMotion();
  useEffect(() => {
    if (!focused) return;
    ref.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
  }, [ref, focused, still]);
}
