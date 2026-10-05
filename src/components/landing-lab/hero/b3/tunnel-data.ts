/**
 * B3 "Depth" - the static data of the tunnel. Units are svh so the scene
 * scales with the stage height. A ring flies from Z_FAR to Z_NEAR over FLY_S;
 * ring i starts i/RINGS of the way through, so the flight is continuous.
 */

export const RINGS = 8;
export const FLY_S = 18;
export const Z_FAR = -1100;
export const Z_NEAR = 0;
export const NODES = 9;

const HUES = ["--brand-cyan", "--brand-purple", "--brand-emerald", "--brand-amber", "--brand-rose"] as const;

/** Visible share of a flight at progress p (matches the ring-fly keyframes). */
function flightOpacity(p: number): number {
  if (p < 0.12) return p / 0.12;
  if (p > 0.9) return Math.max(0, (1 - p) / 0.1);
  return 1;
}

export interface Ring {
  hue: string;
  team: number;
  /** Negative delay: how far into its flight the ring starts. */
  delay: string;
  spin: string;
  /** The still frame (reduced motion) freezes ring i at its start progress. */
  z0: string;
  o0: number;
  teamO: number;
  doneO: number;
}

export const RING_DATA: readonly Ring[] = Array.from({ length: RINGS }, (_, i) => {
  const p = i / RINGS;
  return {
    hue: `var(${HUES[i % HUES.length]})`,
    team: i,
    delay: `${(-p * FLY_S).toFixed(2)}s`,
    spin: `${(i % 2 ? 1 : -1) * (46 + i * 5)}s`,
    z0: `${(Z_FAR + (Z_NEAR - Z_FAR) * p).toFixed(1)}svh`,
    o0: flightOpacity(p),
    teamO: p >= 0.6 && p < 0.8 ? 1 : 0,
    doneO: p >= 0.8 && p < 0.92 ? 1 : 0,
  };
});

export interface Streak { a: string; r: string; dur: string; delay: string; hue: string }

export const STREAKS: readonly Streak[] = Array.from({ length: 28 }, (_, i) => ({
  a: `${((i * 137.508) % 360).toFixed(1)}deg`,
  r: `${14 + ((i * 11) % 60)}svh`,
  dur: `${(3.4 + (i % 5) * 0.55).toFixed(2)}s`,
  delay: `${(-(i * 0.41) % 6).toFixed(2)}s`,
  hue: `var(${HUES[i % HUES.length]})`,
}));

/** Node angles around a ring, in degrees; every third node leads its team. */
export const NODE_ANGLES: readonly number[] = Array.from({ length: NODES }, (_, k) => (k * 360) / NODES);
