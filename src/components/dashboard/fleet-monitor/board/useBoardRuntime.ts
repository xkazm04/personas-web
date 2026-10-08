"use client";

import { useEffect, useReducer, useState, type RefObject } from "react";
import { parseDemoDesktop } from "@/lib/sync/reachability";
import { initSim, simReducer } from "./sim";
import type { HostStatus } from "./host";
import { HOLD_MS } from "./useCommands";
import type { JustInAlert } from "./JustIn";

/** Drives the seeded simulation once per second while the tab is visible.
 *  Reduced motion keeps the data ticking (slower), only the motion goes still.
 *  An offline machine reports nothing, so its last state stands still. */
export function useBoardSim(scale: number, still: boolean, hidden: boolean, offline: boolean) {
  const [sim, dispatch] = useReducer(simReducer, scale, initSim);
  useEffect(() => {
    if (hidden || offline) return;
    const id = window.setInterval(() => dispatch({ type: "advance", dt: 1000, scale, still }), 1000);
    return () => window.clearInterval(id);
  }, [scale, still, hidden, offline]);
  return [sim, dispatch] as const;
}

/** Whether the demo machine answers: `?desktop=offline` (or `never`) switches it
 *  off for review and e2e, the same switch the phone layout reads. The board is
 *  client-only (next/dynamic ssr:false), so reading the URL once is safe. */
export function useHostStatus(): HostStatus {
  const [status] = useState<HostStatus>(() =>
    typeof window !== "undefined" && parseDemoDesktop(window.location.search) !== "online" ? "offline" : "online",
  );
  return status;
}

/** The element's content box, kept current by a ResizeObserver. */
export function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export interface ToastAction {
  label: string;
  run: () => void;
}

/** A transient status line (decisions, the `N` walk). One with an action
 *  (Undo) stays for the command's hold window, so the action is still real. */
export function useToast() {
  const [toast, setToast] = useState<{ seq: number; text: string; action?: ToastAction } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), toast.action ? HOLD_MS : 2600);
    return () => window.clearTimeout(id);
  }, [toast]);
  const show = (text: string, action?: ToastAction) => setToast((t) => ({ seq: (t?.seq ?? 0) + 1, text, action }));
  return [toast, show] as const;
}

/** True for the first ~2s: the arrival beat (tiles rise in), skipped when still. */
export function useArrival(still: boolean) {
  const [arriving, setArriving] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setArriving(false), 2200);
    return () => window.clearTimeout(id);
  }, []);
  return arriving && !still;
}

/** Agents that newly need you, as alerts that leave on their own after 8 s
 *  (the oldest first). Nothing alerts on load or while alerts are muted. */
export function useJustIn(needIds: readonly string[], enabled: boolean) {
  const key = needIds.join(",");
  const [prev, setPrev] = useState(key);
  const [seq, setSeq] = useState(0);
  const [alerts, setAlerts] = useState<JustInAlert[]>([]);
  if (key !== prev) {
    const before = new Set(prev.split(","));
    const added = needIds.filter((id) => !before.has(id));
    setPrev(key);
    if (enabled && added.length) {
      setSeq(seq + added.length);
      setAlerts((cur) => [...added.map((id, i) => ({ id, key: `${id}#${seq + i}` })), ...cur].slice(0, 3));
    }
  }
  useEffect(() => {
    if (!alerts.length) return;
    const id = window.setTimeout(() => setAlerts((cur) => cur.slice(0, -1)), 8000);
    return () => window.clearTimeout(id);
  }, [alerts]);
  const dismiss = (k: string) => setAlerts((cur) => cur.filter((x) => x.key !== k));
  const clear = () => setAlerts([]);
  return { alerts, dismiss, clear };
}

/** "(23) Personas ...": the tab says how many need you while the Board is shown. */
export function useTitleBadge(count: number) {
  useEffect(() => {
    const strip = (t: string) => t.replace(/^\(\d+\)\s*/, "");
    const base = strip(document.title);
    document.title = count ? `(${count}) ${base}` : base;
    return () => {
      document.title = strip(document.title);
    };
  }, [count]);
}
