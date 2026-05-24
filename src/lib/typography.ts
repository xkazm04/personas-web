/**
 * Shared typography tokens. Keeps small repeated label styles consistent
 * across showcase sections (and prevents the "four near-identical labels
 * with four different sizes" inconsistency).
 *
 * For section headers / intros use `<SectionIntro />` from
 * `@/components/primitives` instead of composing eyebrows by hand.
 */

/**
 * Eyebrow label — the small uppercase mono caption that sits above a
 * heading or inside a chip ("Trigger", "Fires when", a category pill, …).
 *
 * Pair the className on a `<span>` / `<div>` and override only color when
 * the surrounding section needs a brand tint.
 */
export const EYEBROW =
  "text-xs font-mono font-medium uppercase tracking-[0.14em] text-muted-dark";

/**
 * SVG-equivalent of EYEBROW for `<text>` nodes inside an `<svg>`. Keeps
 * the BUS / hub labels visually aligned with HTML eyebrows even though
 * SVG doesn't accept Tailwind class-based typography.
 */
export const SVG_EYEBROW = {
  fontSize: 2.4,
  letterSpacing: "0.14em",
  fontFamily: "var(--font-geist-mono)",
} as const;
