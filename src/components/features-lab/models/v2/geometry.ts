import { r2 } from "../shared/motion";

/* Geometry for V2 "Tether and dome" (viewBox 1200 x 560): Claude's engines hang
 * in the sky; your machine sits on the ground below. A tether of light reaches
 * the chosen engine; choosing Ollama pulls it home and closes a dome. */

export type Pt = readonly [number, number];
export type Engine = "haiku" | "sonnet" | "opus" | "ollama";
export type Cloud = Exclude<Engine, "ollama">;

export const W = 1200;
export const H = 600;
export const ORDER: Engine[] = ["sonnet", "opus", "haiku", "ollama"];
export const BUTTONS: Engine[] = ["haiku", "sonnet", "opus", "ollama"];
export const NAMES: Record<Engine, string> = { haiku: "Haiku", sonnet: "Sonnet", opus: "Opus", ollama: "Ollama" };

export const STARS: Record<Cloud, { c: Pt; r: number }> = {
  haiku: { c: [290, 196], r: 22 },
  sonnet: { c: [600, 92], r: 30 },
  opus: { c: [910, 196], r: 42 },
};

export const GROUND = 440;
/** Top-centre of the laptop screen: where the tether leaves. */
export const ORIGIN: Pt = [600, 288];
export const SCREEN = { x: 502, y: 296, w: 196, h: 120 };
export const DOME = { cx: 600, rx: 276, ry: 250 };

/** Dust in the sky: fixed, so server and client agree. */
export const DUST: Pt[] = [
  [140, 70], [180, 300], [395, 60], [440, 120], [520, 40], [690, 52], [770, 140], [820, 82],
  [1010, 60], [1080, 236], [1130, 120], [70, 180], [100, 380], [1100, 360], [1040, 300], [180, 140],
];

/** The tether's control point: above the midpoint, so it arcs. */
export function control(ox: number, oy: number, ex: number, ey: number): Pt {
  return [(ox + ex) / 2, Math.min(oy, ey) - 40];
}

export function quad(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return [r2(u * u * a[0] + 2 * u * t * c[0] + t * t * b[0]), r2(u * u * a[1] + 2 * u * t * c[1] + t * t * b[1])];
}

/** End of the tether: `reach` of the way from the origin to the target. */
export function end(tx: number, ty: number, reach: number): Pt {
  return [ORIGIN[0] + (tx - ORIGIN[0]) * reach, ORIGIN[1] + (ty - ORIGIN[1]) * reach];
}

/** A point on the dome orbit at angle phase (0..1). */
export function orbit(phase: number, k: number): Pt {
  const a = 2 * Math.PI * (phase + k / 3);
  return [r2(DOME.cx + 210 * Math.cos(a)), r2(GROUND - 84 + 54 * Math.sin(a))];
}
