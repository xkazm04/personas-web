"use client";

import { useEffect, useRef, useState } from "react";
import { NEEDS, deckFor, mod } from "./data";
import type { ToolKey } from "./toolIcons";

/** A short haptic tick after a real user gesture, as in the winner (never under reduced motion). */
export function buzz(still: boolean) {
  try {
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (!still && nav.vibrate && nav.userActivation?.hasBeenActive) nav.vibrate(8);
  } catch {
    /* no vibration motor */
  }
}

/**
 * The use-case reel, ported from the winner's spinTo(): a six-faced hex prism spins seven faces,
 * swaps its deck mid-spin while the faces are blurred, and lands the right tool in front. Each
 * landing connects that tool to the persona (+3 jobs). Auto-advances every 4.7 s while on screen
 * until the visitor touches it.
 */
export function useReel(live: boolean, still: boolean, paused: boolean) {
  const [need, setNeed] = useState(0);
  const [k, setK] = useState(0);
  const [deck, setDeck] = useState<ToolKey[]>(() => deckFor(0, 0));
  const [spinning, setSpinning] = useState(false);
  const [connected, setConnected] = useState<ToolKey[]>([NEEDS[0].tool]);
  /** Counts landings the visitor should see; 0 = the silent first frame (no fanfare). */
  const [landTick, setLandTick] = useState(0);
  const [touched, setTouched] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const kRef = useRef(0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const land = (j: number, silent: boolean) => {
    setSpinning(false);
    setConnected((c) => (c.includes(NEEDS[j].tool) ? c : [...c, NEEDS[j].tool]));
    if (!silent) {
      buzz(still);
      setLandTick((n) => n + 1);
    }
  };

  const spinTo = (j: number, delta: number) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const nk = kRef.current + delta;
    kRef.current = nk;
    setNeed(j);
    setK(nk);
    if (still) {
      setDeck(deckFor(j, nk));
      land(j, false);
      return;
    }
    setSpinning(true);
    timers.current.push(setTimeout(() => setDeck(deckFor(j, nk)), 380));
    timers.current.push(setTimeout(() => land(j, false), 1560));
  };

  const next = (byUser: boolean) => {
    if (byUser) setTouched(true);
    spinTo(mod(need + 1, 6), 7);
  };
  const prev = () => {
    setTouched(true);
    spinTo(mod(need - 1, 6), -7);
  };
  const replay = () => {
    setTouched(true);
    spinTo(need, 6);
  };

  useEffect(() => {
    if (!live || still || touched || paused || spinning) return;
    const id = setTimeout(() => spinTo(mod(need + 1, 6), 7), 4700);
    return () => clearTimeout(id);
    // spinTo is recreated every render; the timer only needs the reel's resting state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, still, touched, paused, spinning, need]);

  /** Face classes at rest: the front face, and the two far faces hidden; none while spinning. */
  const faceClass = (i: number) => {
    if (spinning) return "face";
    const rel = mod(i - mod(k, 6) + 3, 6) - 3;
    return `face${Math.abs(rel) >= 2 ? " bk" : ""}${rel === 0 ? " front" : ""}`;
  };

  return { need, k, deck, spinning, connected, landTick, faceClass, next, prev, replay, touch: () => setTouched(true) };
}
