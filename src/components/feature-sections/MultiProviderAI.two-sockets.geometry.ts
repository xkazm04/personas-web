import { easeInOut, useTransform, type MotionValue } from "framer-motion";

/*
 * Two sockets: one runtime core, two engines.
 * Beats (progress 0 -> 4, played once in view; server and reduced motion show 4):
 *   0-1  the Claude plug crosses from outside the machine into the left socket
 *   1-2  the core pulses orange
 *   2-3  the Ollama plug, already inside the machine, seats in the right socket
 *   3-4  the core pulses emerald, with the identical response
 */

export const END = 4;
export const DURATION = 3.8;
export const CLAUDE = "#f97316";
// Identity colours, fixed across site themes (the current section hardcodes them too;
// some themes remap --brand-emerald to grey). Ollama is the app's provider emerald.
export const OLLAMA = "#10b981";
export const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export type Rect = { x: number; y: number; w: number; h: number };
export type Plug = { ox: number; oy: number; rot: number; travel: number; cable: number };

export interface Geometry {
  vb: [number, number];
  machine: Rect;
  claude: Rect;
  ollama: Rect;
  cloud: { x: number; y: number };
  core: { cx: number; cy: number; r: number; rot: number };
  socketA: Rect;
  socketB: Rect;
  plugA: Plug;
  plugB: Plug;
}

// Desktop: engines left and right of a pointy-top hexagon.
export const WIDE: Geometry = {
  vb: [1000, 460],
  machine: { x: 270, y: 30, w: 705, h: 400 },
  claude: { x: 30, y: 150, w: 190, h: 160 },
  ollama: { x: 800, y: 150, w: 155, h: 160 },
  cloud: { x: 103, y: 92 },
  core: { cx: 580, cy: 230, r: 115, rot: 30 },
  socketA: { x: 470, y: 212, w: 20, h: 36 },
  socketB: { x: 670, y: 212, w: 20, h: 36 },
  plugA: { ox: 220, oy: 230, rot: 0, travel: 220, cable: 262 },
  plugB: { ox: 800, oy: 230, rot: 180, travel: 80, cable: 122 },
};

// Phone: the same picture stacked, Claude above the machine, Ollama inside at the bottom.
export const TALL: Geometry = {
  vb: [460, 760],
  machine: { x: 20, y: 230, w: 420, h: 510 },
  claude: { x: 110, y: 40, w: 240, h: 130 },
  ollama: { x: 120, y: 600, w: 220, h: 120 },
  cloud: { x: 36, y: 84 },
  core: { cx: 230, cy: 420, r: 110, rot: 0 },
  socketA: { x: 212, y: 315, w: 36, h: 20 },
  socketB: { x: 212, y: 505, w: 36, h: 20 },
  plugA: { ox: 230, oy: 170, rot: 90, travel: 115, cable: 157 },
  plugB: { ox: 230, oy: 600, rot: -90, travel: 45, cable: 87 },
};

export function hex(cx: number, cy: number, r: number, rot: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i + rot) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export interface Motion {
  plugA: MotionValue<number>;
  plugB: MotionValue<number>;
  litA: MotionValue<number>;
  litB: MotionValue<number>;
  flashA: MotionValue<number>;
  flashB: MotionValue<number>;
  ringAScale: MotionValue<number>;
  ringAOpacity: MotionValue<number>;
  ringBScale: MotionValue<number>;
  ringBOpacity: MotionValue<number>;
  beat: MotionValue<number>;
}

export function useBeats(p: MotionValue<number>, g: Geometry): Motion {
  return {
    plugA: useTransform(p, [0, 0.85], [0, g.plugA.travel], { ease: easeInOut }),
    plugB: useTransform(p, [2, 2.85], [0, g.plugB.travel], { ease: easeInOut }),
    litA: useTransform(p, [0.8, 0.95], [0, 1]),
    litB: useTransform(p, [2.8, 2.95], [0, 1]),
    flashA: useTransform(p, [0.9, 1.25, 2], [0, 0.55, 0]),
    flashB: useTransform(p, [2.9, 3.25, 4], [0, 0.55, 0]),
    ringAScale: useTransform(p, [0.9, 2], [1, 1.12]),
    ringAOpacity: useTransform(p, [0.9, 1.1, 2], [0, 0.95, 0.4]),
    ringBScale: useTransform(p, [2.9, 4], [1, 1.24]),
    ringBOpacity: useTransform(p, [2.9, 3.1, 4], [0, 0.95, 0.4]),
    beat: useTransform(p, [0.9, 1.1, 1.45, 2.9, 3.1, 3.45], [1, 1.08, 1, 1, 1.08, 1]),
  };
}

