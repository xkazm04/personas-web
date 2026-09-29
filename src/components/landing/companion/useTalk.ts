"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTyper } from "../shared/useTyper";

export const BAR_COUNT = 28;
const REST = Array.from({ length: BAR_COUNT }, () => 10);
const STILL = Array.from({ length: BAR_COUNT }, () => 40);

/** A fresh bar profile: louder in the middle, jittered. Only called from event handlers and timers. */
function jitter(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => (15 + Math.random() * 85) * (0.55 + 0.45 * Math.sin((i / (BAR_COUNT - 1)) * Math.PI)));
}

/**
 * The simulated push-to-talk exchange. No audio is captured: holding the key
 * animates the level bars, releasing types out the next canned reply.
 * Visitor-started, so it releases on blur, when the tab is hidden and on
 * unmount, and under reduced motion the bars stay still.
 */
export function useTalk(replies: string[]) {
  const still = useStillMotion();
  const { shown, type, stop } = useTyper(50);
  const [talking, setTalking] = useState(false);
  const [replying, setReplying] = useState(false);
  const [spoke, setSpoke] = useState(false);
  const [bars, setBars] = useState<number[]>(REST);
  const [announce, setAnnounce] = useState("");
  const on = useRef(false);
  const beat = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turn = useRef(0);

  const clearBeat = () => {
    if (beat.current) clearInterval(beat.current);
    beat.current = null;
  };

  const start = useCallback(() => {
    if (on.current || document.hidden) return;
    on.current = true;
    stop();
    setTalking(true);
    setReplying(false);
    setSpoke(false);
    setAnnounce("");
    if (still) {
      setBars(STILL);
      return;
    }
    setBars(jitter());
    beat.current = setInterval(() => setBars(jitter()), 110);
  }, [still, stop]);

  const release = useCallback(() => {
    if (!on.current) return;
    on.current = false;
    if (beat.current) clearInterval(beat.current);
    beat.current = null;
    setTalking(false);
    setBars(REST);
    const reply = replies[turn.current % replies.length];
    turn.current += 1;
    setSpoke(true);
    setReplying(true);
    void type(reply).then(() => {
      setReplying(false);
      setAnnounce(reply);
    });
  }, [replies, type]);

  /** Assistive tech activates the button with a bare click: play a short press. */
  const tap = useCallback(() => {
    if (on.current) return;
    start();
    tapTimer.current = setTimeout(release, 1200);
  }, [start, release]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) release();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearBeat();
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, [release]);

  return { talking, replying, spoke, shown, bars, announce, start, release, tap };
}
