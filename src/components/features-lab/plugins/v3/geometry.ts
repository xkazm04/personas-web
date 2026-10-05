import type { LabPluginKey } from "../shared/roster";

/**
 * Fixed geometry of the exploded view. The scene is an isometric camera
 * (rotateX then rotateZ); anything that must face the viewer (a persona, a
 * plugin badge) applies the exact inverse, so it stands up off its plate.
 */

export const RX = 57;
export const RZ = -45;
export const SCENE = `rotateX(${RX}deg) rotateZ(${RZ}deg)`;
export const BILLBOARD = `rotateZ(${-RZ}deg) rotateX(${-RX}deg)`;

/** Plate edge, in px, before the camera. */
export const PLATE = 260;
/** Height of each layer above the base once exploded, and when collapsed (arrival). */
export const Z_EXPLODED = { agents: 0, plugins: 212, connectors: 424 } as const;
export const Z_COLLAPSED = { agents: 0, plugins: 22, connectors: 44 } as const;
export type Layer = keyof typeof Z_EXPLODED;

/** Composition box and where the plates' shared centre sits in it. */
export const BOX = { w: 1100, h: 580 };
export const CENTER = { x: 290, y: 466 };

const SIN = Math.sin((RX * Math.PI) / 180);
const COS = Math.cos((RX * Math.PI) / 180);
/** Half the projected diagonal of a plate (its right corner's x offset). */
export const HALF_W = (PLATE * Math.SQRT2) / 2;
export const HALF_H = HALF_W * COS;
/** Screen y of a layer's centre once exploded. */
export const layerY = (layer: Layer) => CENTER.y - Z_EXPLODED[layer] * SIN;

/**
 * Plugin blocks on the middle plate (top-left corner, plate px), set along
 * the diagonal the camera sees as horizontal, so all four read as one rack
 * and none hides under the plate above.
 */
export const TILE = 50;
const STEP = 52;
const rack = (k: number) => ({ x: PLATE / 2 + k * STEP - TILE / 2, y: PLATE / 2 + k * STEP - TILE / 2 });
export const TILE_AT: Record<LabPluginKey, { x: number; y: number }> = {
  "dev-tools": rack(-1.5),
  "obsidian-brain": rack(-0.5),
  drive: rack(0.5),
  twin: rack(1.5),
};

/** Personas standing on the front half of the base plate (centre, plate px) and their portraits. */
export const AGENTS = [
  { src: "/personas/incident-responder.png", x: 16, y: 84 },
  { src: "/personas/pr-review-agent.png", x: 36, y: 148 },
  { src: "/personas/daily-standup-digest.png", x: 70, y: 196 },
  { src: "/personas/security-scanner.png", x: 124, y: 222 },
  { src: "/personas/customer-feedback-analyzer.png", x: 182, y: 240 },
];

/** Connector keycaps on the top plate: a 6x6 grid. */
export const KEY = 36;
export const KEY_GAP = 6;
export const KEY_PAD = (PLATE - 6 * KEY - 5 * KEY_GAP) / 2;
