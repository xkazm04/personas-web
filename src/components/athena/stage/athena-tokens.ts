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
 *  (kp's hand-font equivalent). Use for op names, eyebrows, stat whispers.
 *  text-sm floor: prototype rounds that ran text-xs were flagged unreadable. */
export const ANNOTATION =
  "font-mono text-sm uppercase tracking-[0.18em] text-brand-cyan/80";

/** Muted variant of the annotation voice for secondary labels. */
export const ANNOTATION_DIM =
  "font-mono text-sm uppercase tracking-[0.18em] text-muted-dark";

/** Section display type. Sections must read at arm's length — headlines are
 *  large by default and never shrink to make room for art (user feedback). */
export const HEADLINE =
  "text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl";

/** Section sub/body line paired with HEADLINE. */
export const SUBLINE = "text-lg leading-relaxed text-muted-dark sm:text-xl";

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
