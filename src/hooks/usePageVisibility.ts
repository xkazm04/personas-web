"use client";

import { useSyncExternalStore } from "react";

const PAGE_HIDDEN_CLASS = "page-hidden";

let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return document.hidden;
}

function getServerSnapshot() {
  return false;
}

// Toggle the class on <html> so CSS can pause all keyframe animations globally
function handleVisibilityChange() {
  document.documentElement.classList.toggle(PAGE_HIDDEN_CLASS, document.hidden);
  for (const listener of listeners) listener();
}

// Use a globalThis-keyed singleton so HMR / Fast Refresh re-evaluating this
// module doesn't stack additional `visibilitychange` listeners on each cycle.
const REGISTRY_KEY = Symbol.for("personas.usePageVisibility.registered");
type GlobalRegistry = { [REGISTRY_KEY]?: boolean };

if (typeof document !== "undefined") {
  const g = globalThis as GlobalRegistry;
  if (!g[REGISTRY_KEY]) {
    g[REGISTRY_KEY] = true;
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
}

/**
 * Returns `true` when the browser tab is backgrounded.
 * Also toggles `.page-hidden` on `<html>` so CSS animations can be paused
 * via `animation-play-state: paused`.
 */
export function usePageVisibility(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Tear down the document-level listener. Intended for tests; production code
 * should never call this — the listener is a process-lifetime singleton.
 */
export function __teardownPageVisibilityForTests(): void {
  const g = globalThis as GlobalRegistry;
  if (typeof document !== "undefined" && g[REGISTRY_KEY]) {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    g[REGISTRY_KEY] = false;
  }
  listeners = [];
}
