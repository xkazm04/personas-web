"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";

export type ChannelKind = "idle" | "work" | "done";
export type MasterKind = "ready" | "fanOut" | "working" | "converge" | "result";
export interface Strip<K extends string> {
  kind: K;
  lvl: number;
  fad: number;
}
export interface TeamState {
  channels: Strip<ChannelKind>[];
  master: Strip<MasterKind>;
}

const fill = (kind: ChannelKind, lvl: number, fad: number): Strip<ChannelKind>[] =>
  Array.from({ length: 4 }, () => ({ kind, lvl, fad }));

const IDLE: TeamState = { channels: fill("idle", 1, 0.2), master: { kind: "ready", lvl: 2, fad: 0.3 } };
const FINISHED: TeamState = { channels: fill("done", 7, 0.72), master: { kind: "result", lvl: 11, fad: 0.9 } };
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The team run: the goal fans out to four personas, they work, and the result
 * converges. Visitor-started, so it refuses to start in a hidden tab, jumps to
 * the finished frame if the tab is hidden mid-run, and shows only that frame
 * under reduced motion.
 */
export function useTeamRun() {
  const still = useStillMotion();
  const [state, setState] = useState<TeamState>(IDLE);
  const [running, setRunning] = useState(false);
  const token = useRef(0);
  const busy = useRef(false);

  const finish = useCallback(() => {
    token.current += 1;
    busy.current = false;
    setState(FINISHED);
    setRunning(false);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && busy.current) finish();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      token.current += 1;
    };
  }, [finish]);

  const run = useCallback(async () => {
    if (busy.current || document.hidden) return;
    if (still) {
      setState(FINISHED);
      return;
    }
    busy.current = true;
    setRunning(true);
    const my = ++token.current;
    const live = () => token.current === my;
    const patch = (i: number, next: Strip<ChannelKind>) =>
      setState((s) => ({ ...s, channels: s.channels.map((c, j) => (j === i ? next : c)) }));

    setState({ channels: fill("idle", 0, 0.2), master: { kind: "fanOut", lvl: 10, fad: 0.8 } });
    await sleep(500);
    for (let k = 0; k < 4 && live(); k++) {
      patch(k, { kind: "work", lvl: 3, fad: 0.45 });
      await sleep(180);
    }
    if (!live()) return;
    setState((s) => ({ ...s, master: { kind: "working", lvl: 5, fad: 0.8 } }));
    for (let t = 0; t < 10 && live(); t++) {
      setState((s) => ({
        ...s,
        channels: s.channels.map((_, q) => {
          let lvl = 4 + ((t * 3 + q * 5) % 7);
          if (q <= Math.floor(t / 2.5) && t > 2) lvl = Math.min(lvl, 12);
          return { kind: "work", lvl, fad: 0.45 + Math.min(t, 6) * 0.05 };
        }),
      }));
      await sleep(160);
    }
    for (let d = 0; d < 4 && live(); d++) {
      patch(d, { kind: "done", lvl: 6, fad: 0.72 });
      await sleep(260);
    }
    if (!live()) return;
    setState((s) => ({ ...s, master: { kind: "converge", lvl: 8, fad: 0.85 } }));
    await sleep(600);
    if (!live()) return;
    setState((s) => ({ ...s, master: { kind: "result", lvl: 11, fad: 0.9 } }));
    busy.current = false;
    setRunning(false);
  }, [still]);

  return { state, running, run };
}
