import { TRIGGERS } from "@/components/sections/orchestration-hub/data";

/* V2 orbit geometry: an 800x600 stage seen from slightly above, so the ring of
   triggers is an ellipse and the agent floats over its far side. */
export const W = 800;
export const H = 600;
/** Centre of the orbit plane. */
export const OX = 400;
export const OY = 300;
export const RX = 330;
export const RY = 150;
/** The agent: lifted above the plane, so the far side of the orbit passes behind it. */
export const CORE_X = 400;
export const CORE_Y = 196;
export const CORE_R = 96;
/** Node medallion diameter at scale 1. */
export const NODE_D = 96;
/** The front (active) medallion opens into a lens this much larger. */
export const LENS_SCALE = 1.5;
export const STEP_DEG = 360 / TRIGGERS.length;
/** One beat of the signal rising from the front trigger into the agent. */
export const BEAM_S = 2.6;
/** Front of the orbit (nearest the viewer): where the active trigger rides. */
export const FRONT_Y = OY + RY;

export interface OrbitPose {
  left: string;
  top: string;
  /** 0 = far side, 1 = front. */
  depth: number;
  scale: number;
  zIndex: number;
  opacity: number;
  labelOpacity: number;
}

// Rounded: server and browser trig can disagree in the last digit (hydration).
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const pctX = (x: number) => `${r3((x / W) * 100)}%`;
const pctY = (y: number) => `${r3((y / H) * 100)}%`;

/** Where trigger `index` sits when the orbit has turned `steps` triggers forward. */
export function orbitPose(index: number, steps: number): OrbitPose {
  const phi = ((90 + (index - steps) * STEP_DEG) * Math.PI) / 180;
  const depth = r3((Math.sin(phi) + 1) / 2);
  return {
    left: pctX(OX + RX * Math.cos(phi)),
    top: pctY(OY + RY * Math.sin(phi)),
    depth,
    scale: r3(0.52 + 0.78 * depth),
    // The agent sits at z 20: the far half of the orbit passes behind it.
    zIndex: depth > 0.5 ? 30 + Math.round(depth * 10) : Math.round(depth * 10),
    opacity: r3(0.3 + 0.7 * depth),
    labelOpacity: r3(Math.min(1, Math.max(0, (depth - 0.38) / 0.3))),
  };
}

export const pct = { x: pctX, y: pctY };
