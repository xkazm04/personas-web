/*
 * Athena page art-direction vocabulary — the "sticker sheet" for every
 * /athena prototype section (kp/Spark lesson: coherence comes from a tiny
 * shared token file, not per-section taste). Futuristic-tech tone: void
 * stage, luminous cyan, glass seams, mono console annotations.
 *
 * Import these instead of restating class strings so all sections read as
 * one page. Colors still come from BRAND_VAR / semantic tokens — this file
 * only fixes the recurring treatments.
 */

/** The page's second typographic voice — blueprint/console annotations
 *  (kp's hand-font equivalent). Use for op names, eyebrows, stat whispers. */
export const ANNOTATION =
  "font-mono text-xs uppercase tracking-[0.18em] text-brand-cyan/80";

/** Muted variant of the annotation voice for secondary labels. */
export const ANNOTATION_DIM =
  "font-mono text-xs uppercase tracking-[0.18em] text-muted-dark";

/** Glass panel — the page's card surface (miniature product UI sits on these). */
export const PANEL =
  "rounded-2xl border border-glass bg-surface/60 backdrop-blur-md";

/** Panel that is currently "speaking" / active — hover-elevated seam. */
export const PANEL_ACTIVE =
  "rounded-2xl border border-glass-hover bg-surface/80 backdrop-blur-md";

/** Springy entrance used by miniature-UI art (kp micro-physics lesson). */
export const SPRING_POP = { type: "spring", bounce: 0.35, duration: 0.7 } as const;

/** Viewport config for art that replays on every re-entry (kp `once:false`). */
export const REPLAY = { once: false, amount: 0.5 } as const;
