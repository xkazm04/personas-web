/**
 * SMIL timing for the event-bus swarm: where each node sits on the ring and
 * when its lifecycle and travel pulse fire. Pure geometry, no React.
 */
const RADIUS = 35;
/** Stagger between adjacent nodes' lifecycle starts (seconds). */
const DELAY_STAGGER_S = 0.37;
/** Active phase max length (seconds): 3, 4, or 5 depending on i % 3. */
const ACTIVE_BASE_S = 3;
/** Quiet pause between cycles (seconds), added to active duration. */
const PAUSE_S = 1;

export type SwarmTiming = {
  /** Position on the perimeter circle. */
  x: number;
  y: number;
  /** Vector from the perimeter back to the bus center (50, 50). */
  dx: string;
  dy: string;
  /** When this node's lifecycle starts (seconds from page load). */
  delay: number;
  /** Length of one full cycle (active + pause). */
  totalCycle: number;
  /** keyTimes for the opacity animation: ramp-in, hold, ramp-out, rest. */
  opacityKeyTimes: string;
  /** keyTimes for the travel-to-center pulse: rest, ping, rest. */
  travelKeyTimes: string;
  /** When the travel pulse fires within the cycle (seconds from delay). */
  travelBegin: number;
};

/**
 * Compute SVG SMIL animation timing for one node in the swarm. The
 * cycle is: opacity ramps in → node pulses toward the center → opacity
 * ramps out → quiet pause until next cycle. Numbers were author-tuned
 * for visual rhythm; the named constants at the top of this file are
 * the only knobs.
 */
export function computeSwarmTiming(index: number, total: number): SwarmTiming {
  const angle = index * (360 / total) * (Math.PI / 180);
  const x = 50 + RADIUS * Math.cos(angle);
  const y = 50 + RADIUS * Math.sin(angle);

  // Delay wraps every 4s so the first ~10 nodes form a wave then loop.
  const delay = (index * DELAY_STAGGER_S) % 4;
  const activeDuration = ACTIVE_BASE_S + (index % 3);
  const totalCycle = activeDuration + PAUSE_S;

  // Three keyTime markers split the active phase into ramp-in / hold /
  // ramp-out, then the remainder is the quiet pause.
  const kt1 = ((activeDuration * 0.33) / totalCycle).toFixed(4);
  const kt2 = ((activeDuration * 0.66) / totalCycle).toFixed(4);
  const kt3 = (activeDuration / totalCycle).toFixed(4);

  // Travel pulse fires at 40% of the active phase and lasts ~one frame.
  const pActive = ((activeDuration * 0.4) / totalCycle).toFixed(4);
  const pEnd = Math.min(parseFloat(pActive) + 0.001, 1).toFixed(4);

  return {
    x,
    y,
    dx: (50 - x).toFixed(2),
    dy: (50 - y).toFixed(2),
    delay,
    totalCycle,
    opacityKeyTimes: `0;${kt1};${kt2};${kt3};1`,
    travelKeyTimes: `0;${pActive};${pEnd};1`,
    travelBegin: delay + activeDuration * 0.2,
  };
}
