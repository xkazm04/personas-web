"use client";

import { useEffect, useState } from "react";
import type { BrandKey } from "@/lib/brand-theme";
import { tools } from "./data";

/**
 * Sigil-core model: the persona sigil's real vocabulary (mirrors the app's
 * `features/shared/glyph` - 8 petals = 8 persona dimensions, at 45deg steps,
 * starting at 12 o'clock), the stage geometry, and the one-shot attach sequence.
 *
 * Fidelity note: the app's sigil encodes DIMENSIONS, not tools. So the tools sit
 * on their own ring, offset 22.5deg from the petals, and plugging a tool in only
 * fills the two dimensions a tool really contributes to: Apps (a connector) and
 * What (its jobs). Nothing here claims the sigil draws one petal per tool.
 */

export type Dim = "trigger" | "task" | "connector" | "message" | "review" | "memory" | "event" | "error";

/** Order and angles as in the app's PETAL_ANGLES; labels as its DIM_LABEL. */
export const DIMS: { dim: Dim; label: string; brand: BrandKey }[] = [
  { dim: "trigger", label: "When", brand: "amber" },
  { dim: "task", label: "What", brand: "purple" },
  { dim: "connector", label: "Apps", brand: "cyan" },
  { dim: "message", label: "Messages", brand: "blue" },
  { dim: "review", label: "Review", brand: "rose" },
  { dim: "memory", label: "Memory", brand: "purple" },
  { dim: "event", label: "Events", brand: "emerald" },
  { dim: "error", label: "Errors", brand: "amber" },
];

/** The two dimensions a newly plugged-in tool fills. */
export const TOOL_DIMS: ReadonlySet<Dim> = new Set<Dim>(["connector", "task"]);

/** Obviously-sample persona. Its identity is what never changes. */
export const PERSONA = { name: "Atlas", brand: "purple" as BrandKey };

/** Stage geometry in percent of the square stage. */
export const STAGE = {
  sigil: 58, // sigil box, % of stage
  portR: 43, // radius of the tool ring
  coreR: 58 * 0.19, // core circle radius (app: size * 0.19)
  petalLabelR: 58 * 0.54, // just outside the petal tips (app: size * 0.51)
};

export const TOOL_COUNT = tools.length;

/** Polar to stage percent; angle 0 = 12 o'clock, clockwise. */
export function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

export const petalAngle = (i: number) => i * 45;
export const portAngle = (i: number) => 22.5 + i * 45;

/** Lift a data-driven brand hex toward white so dark brands (Slack aubergine)
 *  still read as a line or border on the dark surface. */
export const lift = (hex: string, pct = 72) => `color-mix(in srgb, ${hex} ${pct}%, white)`;

export const jobsFor = (count: number) =>
  tools.slice(0, count).reduce((n, tl) => n + tl.useCases.length, 0);

const BEAT_MS = 1700;

/**
 * One progress value drives the mechanism: `attached` = how many tools the
 * persona has picked up (in data order). Server render and reduced motion are
 * the completed state (all attached, first tool selected). When motion is
 * allowed the sequence is armed on the client once the stage is in view, plays
 * through once, and rests completed. A click stops it and completes it.
 */
export function useAttachSequence(still: boolean, inView: boolean) {
  const [attached, setAttached] = useState(TOOL_COUNT);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(false);

  // Arm once, on the client, when the stage first scrolls into view.
  useEffect(() => {
    if (still || armed || !inView) return;
    const id = window.setTimeout(() => {
      setArmed(true);
      setAttached(1);
      setSelected(0);
      setPlaying(true);
    }, 250);
    return () => window.clearTimeout(id);
  }, [still, armed, inView]);

  // Advance one beat at a time while playing.
  useEffect(() => {
    if (!playing || still) return;
    const id = window.setTimeout(() => {
      if (attached >= TOOL_COUNT) {
        setPlaying(false);
        return;
      }
      setSelected(attached);
      setAttached(attached + 1);
    }, BEAT_MS);
    return () => window.clearTimeout(id);
  }, [playing, still, attached]);

  const choose = (i: number) => {
    setPlaying(false);
    setAttached(TOOL_COUNT);
    setSelected(i);
  };

  const toggle = () => {
    if (playing) return setPlaying(false);
    if (attached >= TOOL_COUNT) {
      setAttached(1);
      setSelected(0);
    }
    setArmed(true);
    setPlaying(true);
  };

  // Under reduced motion the completed state is forced, whatever was armed.
  return still
    ? { attached: TOOL_COUNT, selected, playing: false, armed: false, choose, toggle }
    : { attached, selected, playing, armed, choose, toggle };
}
