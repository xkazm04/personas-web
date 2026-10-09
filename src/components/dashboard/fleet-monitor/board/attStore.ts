"use client";

import { useSyncExternalStore } from "react";

/** What is under the pointer or the keyboard: one agent or one team, or nothing. */
export type Attention = { type: "agent" | "team"; id: string } | null;

/**
 * Attention lives outside React state: hovering a tile must not re-render the
 * board (its strips, its rail, all 99 tiles). Each reader subscribes to the
 * slice it draws, so a hover re-renders the tile it leaves, the tile it enters
 * and the floating card, nothing else.
 */
export interface AttStore {
  get: () => Attention;
  set: (next: Attention) => void;
  subscribe: (fn: () => void) => () => void;
}

export function createAttStore(): AttStore {
  let cur: Attention = null;
  const listeners = new Set<() => void>();
  return {
    get: () => cur,
    set: (next) => {
      if (cur === next || (cur && next && cur.type === next.type && cur.id === next.id)) return;
      cur = next;
      for (const fn of listeners) fn();
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

const NONE = () => null;

/** The whole attention value; re-renders on every change. */
export function useAttention(store: AttStore): Attention {
  return useSyncExternalStore(store.subscribe, store.get, NONE);
}

/** The agent id under attention, or null. */
export function useAttendedAgent(store: AttStore): string | null {
  return useSyncExternalStore(
    store.subscribe,
    () => {
      const a = store.get();
      return a?.type === "agent" ? a.id : null;
    },
    NONE,
  );
}

/** Whether this one agent or team is under attention; re-renders only when that flips. */
export function useIsAttended(store: AttStore, type: "agent" | "team", id: string): boolean {
  return useSyncExternalStore(
    store.subscribe,
    () => {
      const a = store.get();
      return !!a && a.type === type && a.id === id;
    },
    () => false,
  );
}
