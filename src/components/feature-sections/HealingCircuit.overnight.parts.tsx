"use client";

import { ArrowUp } from "lucide-react";
import type { MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Fade } from "./HealingCircuit.shell";

/* Data and marks of the "overnight" strip. Twelve scheduled runs, one every 30
 * minutes from 00:00 (slot i = 00:00 + 30 min x i); positions are % of the strip. */

export const SWEEP = 0.66;
export const slotX = (slot: number) => 2 + slot * 7.6;
/** When the sweeping "now" line reaches a slot, on p. */
export const sweepAt = (slot: number) => (slotX(slot) / 100) * SWEEP;

/** Runs a retry fixes (01:00 rate limit, 03:00 timeout, 05:00 server error). */
export const FAILS = [2, 6, 10] as const;
/** The run no retry fixes (05:30, rejected credential). */
export const HANDOFF = 11;
export const AXIS_SLOTS = [0, 4, 8, 12] as const;

type Kind = "ok" | "fail";
export const RUNS: { slot: number; kind: Kind }[] = Array.from({ length: 12 }, (_, slot) => ({
  slot,
  kind: (FAILS as readonly number[]).includes(slot) || slot === HANDOFF ? "fail" : "ok",
}));

const PILL = "absolute h-[1.4em] w-[1.5em] -translate-x-1/2 rounded-full md:w-[2em]";

/** A scheduled run: there before the night starts (neutral), coloured by its outcome as the now-line passes. */
export function Pill({ p, slot, kind }: { p: MotionValue<number>; slot: number; kind: Kind }) {
  const t = sweepAt(slot);
  const at = { left: `${slotX(slot)}%`, top: "4.9em" };
  return (
    <>
      <div className={`${PILL} bg-foreground/15`} style={at} />
      <Fade p={p} a={t} b={t + 0.03} className={PILL} style={{ ...at, background: kind === "ok" ? tint("emerald", 55) : tint("rose", 75) }} />
    </>
  );
}

/** A failure that bounces back: the fix (arrow + tag) and the green retry above it. */
export function Retry({ p, slot, code, fix }: { p: MotionValue<number>; slot: number; code: string; fix: string }) {
  const t = sweepAt(slot) + 0.04;
  const left = `${slotX(slot)}%`;
  return (
    <>
      <Fade p={p} a={t} b={t + 0.04} className="absolute top-[3.5em] flex -translate-x-1/2 flex-col items-center" style={{ left }}>
        <ArrowUp className="h-[1.3em] w-[1.3em]" strokeWidth={2.6} style={{ color: BRAND_VAR.amber }} aria-hidden />
      </Fade>
      <Fade
        p={p}
        a={t + 0.03}
        b={t + 0.07}
        rise={0.5}
        className={PILL}
        style={{ left, top: "1.95em", background: BRAND_VAR.emerald, boxShadow: `0 0 0 2px ${tint("emerald", 35)}` }}
      />
      <Fade
        p={p}
        a={t + 0.05}
        b={t + 0.1}
        className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[0.8em] font-semibold md:text-[0.72em]"
        style={{ left, color: BRAND_VAR.amber }}
      >
        <span className="hidden md:inline">{code} · </span>
        {fix}
      </Fade>
    </>
  );
}
