"use client";

import { useEffect, useReducer, useRef, useState, type FocusEvent, type PointerEvent, type RefObject } from "react";
import { useLoopGate } from "@/hooks/useLoopGate";
import { TRIGGERS, AUTO_CYCLE_MS, type TriggerDef } from "@/components/sections/orchestration-hub/data";
import {
  initialPlayback,
  nextDeadline,
  reducePlayback,
  type PlaybackState,
} from "@/components/sections/orchestration-hub/playback";

export interface HubPlayback {
  state: PlaybackState;
  trigger: TriggerDef;
  stopped: boolean;
  /** Paused by hover, focus, scroll-away or a hidden tab (lifts on its own). */
  held: boolean;
  /** Ambient loops may run: the loop gate is open and the visitor has not stopped the hub. */
  live: boolean;
  /** Reduced motion is preferred (one-shot entrances snap). */
  still: boolean;
  select: (id: string) => void;
  toggle: () => void;
  prev: () => void;
  next: () => void;
  /** Spread on the ring: pointer and focus inside it hold the cycle. */
  holdProps: {
    onPointerEnter: (e: PointerEvent) => void;
    onPointerLeave: (e: PointerEvent) => void;
    onFocus: () => void;
    onBlur: (e: FocusEvent<HTMLElement>) => void;
  };
}

/**
 * The live hub's playback shell (sections/orchestration-hub/index.tsx), lifted
 * into a hook so every lab variant drives the same tested machine
 * (playback.ts): selecting, stepping or Pause is the visitor's stop that only
 * Play lifts; hover, focus, scrolling away and a hidden tab are holds.
 */
export function useHubPlayback(): {
  /** Attach to the diagram: its in-view/foreground state is the system hold. Kept
   *  apart from `hub` so the playback object can be passed down during render. */
  diagramRef: RefObject<HTMLDivElement | null>;
  hub: HubPlayback;
} {
  const diagramRef = useRef<HTMLDivElement>(null);
  const gate = useLoopGate(diagramRef);
  const systemHeld = gate.vetoedBy.includes("foreground") || gate.vetoedBy.includes("in-view");
  // The clock is read once, in a lazy initializer - never in render.
  const [mountedAt] = useState(() => Date.now());
  const [state, dispatch] = useReducer(reducePlayback, mountedAt, (now) =>
    initialPlayback(TRIGGERS.length, { now, intervalMs: AUTO_CYCLE_MS }),
  );

  // Reduced motion arrives after hydration: it stops the hub like a Pause.
  const [prevStill, setPrevStill] = useState(gate.still);
  if (gate.still !== prevStill) {
    setPrevStill(gate.still);
    if (gate.still) dispatch({ type: "PREFER_STILL" });
  }

  useEffect(() => {
    if (systemHeld !== state.systemHeld) {
      const t = setTimeout(() => dispatch({ type: systemHeld ? "SYSTEM_HOLD" : "SYSTEM_RELEASE", now: Date.now() }), 0);
      return () => clearTimeout(t);
    }
    const due = nextDeadline(state);
    if (due === null) return;
    const t = setTimeout(() => dispatch({ type: "TICK", now: Date.now() }), Math.max(0, due - Date.now()));
    return () => clearTimeout(t);
  }, [state, systemHeld]);

  const stopped = state.mode === "stopped";
  const pointer = (type: "POINTER_ENTER" | "POINTER_LEAVE") => (e: PointerEvent) => {
    if (e.pointerType !== "touch") dispatch({ type, now: Date.now() });
  };

  const hub: HubPlayback = {
    state,
    trigger: TRIGGERS[state.active] ?? TRIGGERS[0],
    stopped,
    held: state.mode === "held",
    live: gate.run && !stopped,
    still: gate.still,
    select: (id) => {
      const index = TRIGGERS.findIndex((t) => t.id === id);
      if (index !== -1) dispatch({ type: "SELECT", index });
    },
    toggle: () => dispatch(stopped ? { type: "USER_PLAY", now: Date.now() } : { type: "USER_PAUSE" }),
    prev: () => dispatch({ type: "PREV" }),
    next: () => dispatch({ type: "NEXT" }),
    holdProps: {
      onPointerEnter: pointer("POINTER_ENTER"),
      onPointerLeave: pointer("POINTER_LEAVE"),
      onFocus: () => dispatch({ type: "FOCUS_IN", now: Date.now() }),
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) dispatch({ type: "FOCUS_OUT", now: Date.now() });
      },
    },
  };
  return { diagramRef, hub };
}
