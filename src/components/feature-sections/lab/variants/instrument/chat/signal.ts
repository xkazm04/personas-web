/**
 * The Chat tab's tuned signal: the urgent-flag rate over the last 48 hourly
 * windows, as the refinement chat reports it. The two measured figures and
 * the benchmark band are the ones the script speaks (labSectionCopy.chat
 * .messages.tighten: "31% were flagged urgent ... benchmark 8–12%";
 * .replayResult: "9.2% flagged urgent"). The middle level - after the first
 * adjustment, before the pre-filter - is unmeasured in the script, so the
 * scope draws it but never prints a number for it.
 * Pure TS, no React.
 */
import { CHAT_SCRIPT } from "../../../data";

export const BEFORE_PCT = 31;
export const AFTER_PCT = 9.2;
export const TARGET = { lo: 8, hi: 12 } as const;
export const Y_MAX = 40;
export const SAMPLES = 48;

/** Trace level by adjustments applied (0, 1 or 2 diffs). */
const LEVELS = [BEFORE_PCT, 17.5, AFTER_PCT] as const;
/** The signal tightens as it is tuned: less spread around a lower mean. */
const SPREAD = [5.5, 3.4, 1.5] as const;

/** Deterministic PRNG (mulberry32): the same wiggle on server and client. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One shared, zero-mean wiggle in [-1, 1]: tuning reshapes the same signal. */
const NOISE: readonly number[] = (() => {
  const rnd = seeded(4242);
  const raw = Array.from({ length: SAMPLES }, (_, i) => {
    const slow = Math.sin(i / 4.1) * 0.45 + Math.sin(i / 1.7) * 0.2;
    return slow + (rnd() - 0.5) * 0.9;
  });
  const mean = raw.reduce((s, v) => s + v, 0) / raw.length;
  const peak = Math.max(...raw.map((v) => Math.abs(v - mean)));
  return raw.map((v) => (v - mean) / peak);
})();

export function levelSamples(level: number): number[] {
  const k = Math.max(0, Math.min(LEVELS.length - 1, level));
  return NOISE.map((n) => Math.max(0.5, LEVELS[k] + n * SPREAD[k]));
}

export function levelMean(level: number): number {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level))];
}

/** Script position -> how many applied diffs are on screen. */
export function diffsApplied(shown: number): number {
  return CHAT_SCRIPT.slice(0, shown).filter((m) => m.role === "diff").length;
}

/** The ordinal of each diff in the script (1-based), by message index. */
export const DIFF_ORDINAL: readonly (number | null)[] = (() => {
  let n = 0;
  return CHAT_SCRIPT.map((m) => (m.role === "diff" ? ++n : null));
})();

export const SCRIPT_STEPS = CHAT_SCRIPT.length + 1;

/** Step k reveals message k-1; the wait before it is that message's delay. */
export function chatStepMs(step: number): number {
  const next = CHAT_SCRIPT[step];
  return next ? Math.max(650, next.delay + 450) : 1000;
}
