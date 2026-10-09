"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import type { BuildingBox } from "./city-layout";

/* ── The city's arrival ─────────────────────────────────────────────
 *
 * The city is not drawn in one go: building by building, left to right, its
 * frame draws down from the roof, then its offices light floor by floor from
 * the top, then the personas take their desks, again from the top. Each step
 * mounts only what just arrived, so the work of 99 windows is spread across
 * the arrival instead of landing in one long first commit.
 */

/** Between one building's frame and the next's. */
const BUILDING_STEP = 110;
/** The frame's own draw before its first floor of offices. */
const FRAME_MS = 260;
/** Between floors. */
const FLOOR_MS = 45;
/** After the last office, before the first persona. */
const PEOPLE_GAP = 80;

/** What of a building has arrived: its frame, and how many floors (from the top)
 *  of offices and of personas. */
export interface Stage {
  frame: boolean;
  offices: number;
  people: number;
}

export const ARRIVED: Stage = { frame: true, offices: Infinity, people: Infinity };

const officesAt = (i: number, row: number) => i * BUILDING_STEP + FRAME_MS + row * FLOOR_MS;
const peopleAt = (i: number, rows: number, row: number) => officesAt(i, rows) + PEOPLE_GAP + row * FLOOR_MS;

/** A building's stage `t` ms into the arrival. */
export function stageOf(b: Pick<BuildingBox, "i" | "rows">, t: number): Stage {
  if (t === Infinity) return ARRIVED;
  const count = (at: (row: number) => number) => {
    let n = 0;
    while (n < b.rows && at(n) <= t) n++;
    return n;
  };
  return { frame: b.i * BUILDING_STEP <= t, offices: count((r) => officesAt(b.i, r)), people: count((r) => peopleAt(b.i, b.rows, r)) };
}

/** Every moment a building's stage changes, ascending. */
function milestones(buildings: readonly Pick<BuildingBox, "i" | "rows">[]): number[] {
  const out = new Set<number>();
  for (const b of buildings) {
    out.add(b.i * BUILDING_STEP);
    for (let r = 0; r < b.rows; r++) {
      out.add(officesAt(b.i, r));
      out.add(peopleAt(b.i, b.rows, r));
    }
  }
  return [...out].sort((x, y) => x - y);
}

/**
 * Milliseconds into the arrival, advanced only when a building's stage
 * changes (so a step re-renders the city once, and only the buildings that
 * moved); `Infinity` once everything has arrived, and at once under reduced
 * motion. A new `runKey` (another fleet size) starts it again.
 */
export function useCityArrival(buildings: readonly Pick<BuildingBox, "i" | "rows">[], runKey: unknown): number {
  const still = useStillMotion();
  const [run, setRun] = useState({ key: runKey, t: 0 });
  if (run.key !== runKey) setRun({ key: runKey, t: 0 });
  // The layout is rebuilt on every tick and on resize; the clock reads the
  // latest without restarting.
  const latest = useRef(buildings);
  useLayoutEffect(() => {
    latest.current = buildings;
  });

  useEffect(() => {
    if (still) return;
    const times = milestones(latest.current);
    const t0 = performance.now();
    let passed = 0;
    let raf = 0;
    const tick = (now: number) => {
      const t = now - t0;
      let next = passed;
      while (next < times.length && times[next] <= t) next++;
      if (next !== passed) {
        passed = next;
        const at = next >= times.length ? Infinity : times[next - 1];
        setRun((r) => ({ ...r, t: at }));
      }
      if (passed < times.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [runKey, still]);

  return still ? Infinity : run.t;
}
