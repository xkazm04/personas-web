import type { CSSProperties } from "react";

/**
 * T1 / T2 cascade — the declarative stagger for a view's fixed regions and the
 * first screenful of its rows. See docs/features/dashboard/loading-orchestration.md.
 *
 *   <section className={`${ARRIVE} grid gap-4`} style={arriveAt(1)}>
 *
 * Position-indexed cascades are only honest where position IS identity: a
 * view's own sections, or rows keyed by a stable id (React keeps a keyed row's
 * element, so only genuinely new rows animate). Never key a row by index.
 */
export const ARRIVE = "dash-arrive";

/** Indices past this enter together — a cascade is not a progress bar. */
export const ARRIVE_CAP = 6;

export function arriveAt(index: number): CSSProperties {
  return { "--arrive-i": Math.min(Math.max(index, 0), ARRIVE_CAP) } as CSSProperties;
}

/** Spread `{ className, style }` for an element that has neither. */
export function arrive(index: number): { className: string; style: CSSProperties } {
  return { className: ARRIVE, style: arriveAt(index) };
}
