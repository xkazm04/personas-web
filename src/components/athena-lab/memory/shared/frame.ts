import type { CSSProperties } from "react";

/**
 * Type and placement inside an aspect-locked art box (see `./LabShell`).
 *
 * The box is an inline-size container, so `cqw` is a percent of the art's own
 * width: type authored in design units grows with the art on a 2560 monitor
 * and shrinks with it on a short laptop, and never drops below its floor.
 */

/** A font size of `n` design units on an art `w` units wide, never below `min` px. */
export const fsOf =
  (w: number) =>
  (n: number, min: number): CSSProperties => ({
    fontSize: `max(${min}px, calc(${n} * 100cqw / ${w}))`,
  });

/** A length of `n` design units, as a CSS calc on the art's width. */
export const unitOf = (w: number) => (n: number) => `calc(${n} * 100cqw / ${w})`;

/** The mono annotation voice, without its fixed size (callers pass `fs`). */
export const MONO = "font-mono uppercase tracking-[0.16em]";

/** A muted foreground ink, themed: for the visitor's own voice in a scene. */
export const fg = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`;
