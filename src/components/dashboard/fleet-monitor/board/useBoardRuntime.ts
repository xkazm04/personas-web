"use client";

import { useEffect, useReducer, useState, type RefObject } from "react";
import { parseDemoDesktop } from "@/lib/sync/reachability";
import { initSim, simReducer } from "./sim";
import type { HostStatus } from "./host";

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

/** A transient status line (decisions, the `N` walk). */
export function useToast() {
  const [toast, setToast] = useState<{ seq: number; text: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);
  const show = (text: string) => setToast((t) => ({ seq: (t?.seq ?? 0) + 1, text }));
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
