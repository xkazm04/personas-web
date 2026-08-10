/**
 * The temperature arc this section is drawn with — section 5, variant C.
 *
 * The whole scene argues in LIGHT rather than in UI: attention is the cyan key
 * light, and a project nobody is looking at slides away from it — cooling out
 * of cyan, through amber, into rose — while its luminance falls, its rim frays
 * and dust settles on it. So "health" here is not a number on a card; it is a
 * colour, a brightness and a density, and this file is the only place those
 * three are decided.
 *
 * Every value is PRECOMPUTED. React 19 forbids deriving values impurely in
 * render, and a decay ramp is authored art anyway — a formula would give the
 * even, machine-made fade this section is specifically not about.
 *
 * Nothing here is a raw hex. Blends nest `color-mix` over the brand tokens, so
 * the arc re-reads itself in every theme exactly like `tint()` does.
 */

import { BRAND_VAR } from "@/lib/brand-theme";

/** Blend two brand colours. `pct` is how much of `a` survives. */
const blend = (a: string, b: string, pct: number) =>
  `color-mix(in srgb, ${a} ${pct}%, ${b})`;

/** Fade any colour — including a blend — toward transparent. */
export const soft = (c: string, pct: number) =>
  `color-mix(in srgb, ${c} ${pct}%, transparent)`;

const CYAN = BRAND_VAR.cyan;
const ROSE = BRAND_VAR.rose;

/** Health runs 0 (thriving, full in the light) … 6 (worst). */
export const WORST = 6;

/**
 * The colour arc. Cyan is "someone is looking at this"; rose is what it turns
 * into when nobody has for six weeks.
 *
 * It runs cyan straight to rose and deliberately does NOT pass through amber:
 * cyan blended with amber lands on olive-green halfway, which reads as a third
 * status rather than as one colour draining out of another. Cyan to rose
 * passes through a desaturated blue-grey instead — the colour of something
 * that has simply stopped being tended, which is the actual subject here.
 */
export const HEAT: readonly string[] = [
  CYAN,
  blend(CYAN, ROSE, 84),
  blend(CYAN, ROSE, 66),
  blend(CYAN, ROSE, 48),
  blend(CYAN, ROSE, 30),
  blend(CYAN, ROSE, 14),
  ROSE,
];

/** Luminance. The bloom around a light is most of what you actually read. */
export const BLOOM = [42, 35, 29, 24, 20, 16, 13] as const;

/** The core disc itself — it never goes fully dark, only quiet. */
export const CORE = [88, 80, 72, 65, 58, 52, 46] as const;

/** The rim that says a project has an edge, a shape, someone's care. */
export const RIM = [60, 54, 47, 41, 35, 30, 26] as const;

/** How much of that rim has frayed into dashes (0 whole … 1 broken open). */
export const FRAY = [0, 0.18, 0.36, 0.54, 0.72, 0.88, 1] as const;

/** Density — the sparks a living project throws off, thinning as it fades. */
export const SPARK = [0.85, 0.68, 0.52, 0.38, 0.25, 0.13, 0] as const;

/** Dust settling on the thing nobody is looking at. */
export const DUST = [0, 0.08, 0.18, 0.3, 0.42, 0.53, 0.62] as const;

/** A light still breathes while it is cared for; past this it has stopped. */
export const BREATHES_TO = 3;
