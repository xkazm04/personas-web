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

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

/**
 * Returns `true` when the browser tab is backgrounded.
 * Also toggles `.page-hidden` on `<html>` so CSS animations can be paused
 * via `animation-play-state: paused`.
 */
export function usePageVisibility(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
