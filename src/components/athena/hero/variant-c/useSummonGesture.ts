"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The Summons gesture state machine — the desktop hold-to-talk grammar,
 * faithfully: press arms a 220 ms threshold; releasing early is "too
 * quick"; dragging while armed cancels (moving never records); holding
 * past the threshold starts listening; release answers.
 *
 *   idle → arming → listening → thinking → answered → (reset) → idle
 *
 * All timing lives in refs + timeouts created inside handlers — no
 * Date.now()/Math.random() in render, no sync setState in effect bodies.
 * Reduced motion: the first paint is the composed answered scene, the
 * typing/thinking theater is skipped, but the real gesture still works.
 */

export type SummonPhase = "idle" | "arming" | "listening" | "thinking" | "answered";

/** The real desktop arm threshold. */
export const HOLD_THRESHOLD_MS = 220;
const TYPE_MS = 46; // per heard character
const THINK_MS = 950; // beat between release and the answer
const TOO_QUICK_MS = 2000; // how long the "too quick" annotation lingers
const DRAG_SLOP_PX = 14; // movement beyond this cancels an armed hold

export interface GestureBind {
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
}

export function useSummonGesture(sentenceLength: number) {
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<SummonPhase>("idle");
  const [tooQuick, setTooQuick] = useState(false);
  const [heardCount, setHeardCount] = useState(0);
  const [composed, setComposed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  // Reduced-motion first paint: the composed answered scene (prev-state
  // pattern — render-phase adjustment, not an effect).
  if (reduced && !composed) {
    setComposed(true);
    if (phase === "idle") {
      setPhase("answered");
      setHeardCount(sentenceLength);
    }
  }

  useEffect(() => {
    const timers = timersRef.current; // stable array — cleared in place
    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.length = 0;
  };

  const press = (origin: { x: number; y: number } | null) => {
    if (phase !== "idle" && phase !== "answered") return;
    clearTimers();
    originRef.current = origin;
    setTooQuick(false);
    setHeardCount(0);
    setPhase("arming");
    later(() => {
      setPhase((p) => (p === "arming" ? "listening" : p));
      if (reduced) setHeardCount(sentenceLength);
      else
        for (let i = 1; i <= sentenceLength; i++)
          later(() => setHeardCount(i), i * TYPE_MS);
    }, HOLD_THRESHOLD_MS);
  };

  const release = () => {
    originRef.current = null;
    if (phase === "arming") {
      // Released before the threshold — the real desktop "too quick" path.
      clearTimers();
      setPhase("idle");
      setTooQuick(true);
      later(() => setTooQuick(false), TOO_QUICK_MS);
    } else if (phase === "listening") {
      clearTimers();
      setHeardCount(sentenceLength); // she heard the whole sentence
      if (reduced) setPhase("answered");
      else {
        setPhase("thinking");
        later(() => setPhase("answered"), THINK_MS);
      }
    }
  };

  /** A drag cancels an armed or listening hold — moving never records. */
  const cancel = () => {
    originRef.current = null;
    if (phase === "arming" || phase === "listening") {
      clearTimers();
      setPhase("idle");
      setHeardCount(0);
    }
  };

  const reset = () => {
    clearTimers();
    originRef.current = null;
    setTooQuick(false);
    setHeardCount(0);
    setPhase("idle");
  };

  const bind: GestureBind = {
    onPointerDown: (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      press({ x: e.clientX, y: e.clientY });
    },
    onPointerUp: release,
    onPointerMove: (e) => {
      const o = originRef.current;
      if (phase !== "arming" || !o) return;
      if (Math.hypot(e.clientX - o.x, e.clientY - o.y) > DRAG_SLOP_PX) cancel();
    },
    onPointerCancel: cancel,
    onKeyDown: (e) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (e.repeat) return;
      press(null); // keyboard holds have no drag origin
    },
    onKeyUp: (e) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      release();
    },
    onBlur: cancel,
  };

  return { phase, tooQuick, heardCount, reduced, reset, bind };
}
