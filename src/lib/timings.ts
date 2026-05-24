/**
 * Centralised UX timing constants. Use these instead of redefining
 * carousel intervals, fade durations, or auto-advance delays per
 * section — keeps the brand-wide rhythm tunable from one place.
 *
 * Framer Motion durations (in seconds, e.g. TRANSITION_NORMAL.duration)
 * live in @/lib/animations. This file is for ms-scale UX timings: how
 * long a step stays before auto-advancing, how often a marquee cycles,
 * etc.
 */

/**
 * Auto-advance interval for carousels and step cyclers. Per-section
 * variants (default 7s, fast 3.2s, slow 10s) cover the use cases
 * we've shipped so far. If a section needs a different cadence,
 * add a named variant here rather than hardcoding ms in the section.
 */
export const CAROUSEL_INTERVAL_MS = {
  default: 7000,
  fast: 3200,
  slow: 10000,
} as const;
