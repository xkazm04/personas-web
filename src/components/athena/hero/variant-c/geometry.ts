/**
 * Variant C — "The Quiet" stage geometry.
 *
 * The stage is a relative container; every coordinate here is a percentage
 * of that container so the choreography scales from 375px to 1440px without
 * measurement. Noise cards start scattered across the upper field and fly
 * into one of exactly two destinations: the orb or the chat panel.
 */

export type NoiseDest = "orb" | "chat";

export interface NoiseSpot {
  /** Start position, % of stage (top-left corner of the card). */
  x: number;
  y: number;
  /** Initial rotation in degrees — the untidy "before" state. */
  rot: number;
  /** Which quiet surface absorbs this card. */
  dest: NoiseDest;
  /** Seconds before this card begins its flight. */
  delay: number;
}

/** Orb center, % of stage. */
export const ORB_POS = { x: 78, y: 20 } as const;

/** Chat panel bounding box, % of stage. */
export const CHAT_BOX = { x: 6, y: 52, w: 66, h: 42 } as const;

/** Where flying cards converge, % of stage (slightly inside each surface). */
export const DEST_POINT: Record<NoiseDest, { x: number; y: number }> = {
  orb: { x: ORB_POS.x - 4, y: ORB_POS.y - 3 },
  chat: { x: CHAT_BOX.x + CHAT_BOX.w / 2 - 8, y: CHAT_BOX.y + 16 },
};

/** One entry per NOISE_LABELS item, index-aligned. */
export const NOISE_SPOTS: NoiseSpot[] = [
  { x: 6, y: 6, rot: -6, dest: "chat", delay: 0.9 },
  { x: 40, y: 2, rot: 3, dest: "orb", delay: 1.25 },
  { x: 72, y: 44, rot: 5, dest: "orb", delay: 1.6 },
  { x: 10, y: 30, rot: -3, dest: "chat", delay: 1.95 },
  { x: 46, y: 24, rot: 7, dest: "chat", delay: 2.3 },
  { x: 66, y: 66, rot: -5, dest: "orb", delay: 2.65 },
  { x: 30, y: 44, rot: 2, dest: "chat", delay: 3.0 },
];

/** Flight time of a single card, seconds. */
export const FLIGHT_DURATION = 0.7;

/** Moment the stage falls silent — last delay + flight. */
export const SILENCE_AT =
  NOISE_SPOTS[NOISE_SPOTS.length - 1].delay + FLIGHT_DURATION;
