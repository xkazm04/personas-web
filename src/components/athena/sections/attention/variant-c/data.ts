// PROTOTYPE COPY — extract to src/i18n at assembly
//
// Section 2 (attention), variant C — "A day, drawn." All user-facing
// strings plus every tick/mark position as precomputed constants (no
// Math.random in render). Positions are `t` values on the day band:
// t = 0 → 06:00, t = 1 → 06:00 the next day.

export const COPY = {
  eyebrow: "Your attention, protected",
  headline: "Three times a day. When it matters.",
  subline:
    "Athena budgets her own interruptions — quieter when you're in flow, silent at night. Most assistants perform usefulness; she waits for a reason.",
  laneTypical: "a typical assistant",
  laneAthena: "Athena",
  /** The section's one mono-annotation garnish, over the flow block. */
  flowNote: "in flow · she waits",
  nightNote: "2 am",
  bandAria:
    "A timeline of one day. The top lane, a typical assistant, shows dozens of interruptions from morning to 2 am. The bottom lane, Athena, shows three well-placed moments and stays silent while you are in flow and through the night.",
  marksAria: "Athena's three moments of the day",
} as const;

/** The three Athena moments — placed with intent, labels worth saying. */
export const MARKS = [
  { id: "build", t: 0.155, time: "9:40", label: "the overnight build finished" },
  { id: "decision", t: 0.375, time: "15:00", label: "a decision is waiting" },
  { id: "tomorrow", t: 0.52, time: "18:30", label: "tomorrow is clear" },
] as const;

/** Deep-work stretch — the Athena lane shows nothing at all here. */
export const FLOW = { start: 0.167, end: 0.271 } as const;

/** Night begins here; both lanes dim and sleep. */
export const NIGHT_START = 0.625;

/** The typical lane still twitches once at 2 am. */
export const NIGHT_TWITCH = { t: 0.833, h: 14 } as const;

/** Hour labels along the band. */
export const HOURS = [
  { t: 0.083, label: "8 am" },
  { t: 0.25, label: "noon" },
  { t: 0.5, label: "6 pm" },
  { t: 0.75, label: "midnight" },
] as const;

/**
 * The interruption storm — a typical assistant's day, morning to late
 * evening, spiking through lunch and evening. `[t, height]`, deterministic
 * (generated once with a seeded LCG, committed as constants).
 */
export const TICKS: readonly (readonly [number, number])[] = [
  [0.024, 9], [0.041, 10], [0.052, 8], [0.066, 9], [0.084, 16],
  [0.098, 12], [0.108, 15], [0.121, 9], [0.129, 16], [0.154, 19],
  [0.165, 12], [0.181, 13], [0.203, 18], [0.208, 18], [0.229, 11],
  [0.239, 15], [0.267, 18], [0.277, 20], [0.286, 23], [0.297, 23],
  [0.309, 20], [0.311, 18], [0.325, 17], [0.337, 22], [0.352, 13],
  [0.36, 11], [0.373, 12], [0.394, 17], [0.419, 11], [0.433, 14],
  [0.442, 12], [0.455, 18], [0.47, 17], [0.496, 13], [0.509, 18],
  [0.515, 21], [0.529, 18], [0.548, 23], [0.56, 17], [0.57, 23],
  [0.591, 24], [0.602, 24], [0.612, 17], [0.625, 9], [0.673, 12],
  [0.699, 10], [0.732, 6],
] as const;

/**
 * Sky gradient stops for the band — dawn → day → dusk → night, expressed
 * as brand tints (resolved in geometry.ts via `tint()`).
 */
export const SKY_STOPS = [
  { at: 0, key: "amber", pct: 45 },
  { at: 0.18, key: "cyan", pct: 55 },
  { at: 0.45, key: "cyan", pct: 45 },
  { at: 0.58, key: "purple", pct: 50 },
  { at: 0.72, key: "purple", pct: 22 },
  { at: 1, key: "purple", pct: 10 },
] as const;
