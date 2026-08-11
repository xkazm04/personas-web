/**
 * What each verdict LOOKS like — the section's one colour decision, made once
 * here instead of per component.
 *
 * Two rules are baked in and neither is negotiable.
 *
 * First: a bare `border` with no colour resolves to `currentColor`, and this
 * page's text is near-white — which is how a sibling section grew a white
 * outline the theme never asked for. Every state below therefore returns an
 * explicit border colour; there is no state in which a screen has an unthemed
 * edge.
 *
 * Second: framer cannot interpolate `color-mix()`, and `tint()` returns exactly
 * that. Nothing here is ever handed to an `animate` prop — these values ride a
 * scoped CSS transition on the element instead (see `SKIN` in `./parts`), and
 * framer is left with transforms and opacity.
 *
 * The colours themselves argue the section. Before she has read a screen it is
 * cyan at almost nothing: running, unremarked. The instant she has, fifteen of
 * them go up to a confident cyan and five go amber — one flip, one moment, the
 * whole wall at once. Amber then splits: emerald for the ones that were simply
 * finished, a stronger amber for the one holding a question, rose for the one
 * that really has stopped, and — for the one she will not call — no colour at
 * all, just a dashed edge. An unclassified thing should not be able to borrow
 * the confidence of a classified one.
 */

import { brandShadow, tint, type BrandKey } from "@/lib/brand-theme";
import type { TileState } from "./data";

interface Spec {
  accent: BrandKey;
  /** Edge, fill and glow strengths, as tint percentages. */
  edge: number;
  fill: number;
  glow: number | null;
  /** Strength of the finished lines of output inside. */
  ink: number;
  /** The signature of an abstention: an edge that never closes. */
  dashed?: boolean;
}

const SPEC: Record<TileState, Spec> = {
  dark: { accent: "cyan", edge: 14, fill: 3, glow: null, ink: 18 },
  working: { accent: "cyan", edge: 32, fill: 6, glow: null, ink: 28 },
  noOutput: { accent: "amber", edge: 46, fill: 9, glow: 16, ink: 22 },
  done: { accent: "emerald", edge: 38, fill: 8, glow: null, ink: 20 },
  needsYou: { accent: "amber", edge: 64, fill: 14, glow: 28, ink: 24 },
  stuck: { accent: "rose", edge: 58, fill: 12, glow: 26, ink: 22 },
  unknown: { accent: "cyan", edge: 30, fill: 4, glow: null, ink: 16, dashed: true },
};

export interface Look {
  accent: BrandKey;
  border: string;
  background: string;
  boxShadow: string | undefined;
  dashed: boolean;
  ink: number;
}

/**
 * A screen's whole appearance at this tick. `dim` is the one modifier: a screen
 * that has been ruled out steps back rather than disappearing — the work is
 * still there and still running, it just stops competing for your eye.
 */
export function lookOf(state: TileState, dim: boolean): Look {
  const s = SPEC[state];
  const k = dim ? 0.45 : 1;
  return {
    accent: s.accent,
    border: tint(s.accent, Math.round(s.edge * k)),
    background: tint(s.accent, Math.round(s.fill * k)),
    boxShadow: dim || s.glow === null ? undefined : brandShadow(s.accent, 20, s.glow),
    dashed: s.dashed === true,
    ink: Math.round(s.ink * k),
  };
}

/**
 * The stitched rail the three pieces of one job wear, and the announcement
 * wears with them. Deliberately a SHAPE and not only a hue: the site is themed
 * and two brand colours can land close together in some palettes, but a
 * stitched edge is a stitched edge everywhere.
 */
export function railStripe(dim: boolean): string {
  const on = tint("purple", dim ? 34 : 88);
  return `repeating-linear-gradient(90deg, ${on} 0 9px, transparent 9px 16px)`;
}

/** Which of the five textures a screen is showing. Derived from the verdict so
 *  the evidence and the verdict can never contradict each other. */
export type InkMode = "running" | "frozen" | "quiet" | "thin" | "prompt";

export function inkModeOf(state: TileState): InkMode {
  switch (state) {
    case "needsYou":
      return "prompt";
    case "unknown":
      return "thin";
    case "done":
      return "quiet";
    case "noOutput":
    case "stuck":
      return "frozen";
    default:
      return "running";
  }
}
