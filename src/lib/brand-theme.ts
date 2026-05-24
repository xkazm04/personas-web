/**
 * Theme-adaptive brand colors.
 *
 * Rather than hardcoding hex values (which only look right in dark themes),
 * use BRAND_VAR keys so components pick up the correct token in every theme
 * variant (dark-midnight, light, light-ice, light-news, etc.).
 *
 * Usage:
 *   style={{ color: BRAND_VAR.cyan }}
 *   style={{ backgroundColor: tint("purple", 14) }}
 */

export type BrandKey = "cyan" | "purple" | "emerald" | "amber" | "rose" | "blue";

/**
 * The narrower "marketing card" palette: the 4 colors used for feature cards,
 * scenario duel panels, glowing CTAs, and other marketing surfaces where the
 * visual rhythm is "one section per accent, cycling through the brand palette."
 * Excludes rose (used for negative-space states) and blue (status info).
 *
 * Use BrandAccent when the consumer is a marketing card pattern; use BrandKey
 * when any brand color is acceptable.
 */
export type BrandAccent = "cyan" | "purple" | "emerald" | "amber";

export const BRAND_VAR: Record<BrandKey, string> = {
  cyan: "var(--brand-cyan)",
  purple: "var(--brand-purple)",
  emerald: "var(--brand-emerald)",
  amber: "var(--brand-amber)",
  rose: "var(--brand-rose)",
  blue: "var(--status-info)",
};

/** Tint a brand color using CSS color-mix — stays consistent across themes. */
export function tint(key: BrandKey, pct: number): string {
  return `color-mix(in srgb, ${BRAND_VAR[key]} ${pct}%, transparent)`;
}

/**
 * Build a brand-tinted glow shadow string.
 * Replaces the repeated `0 0 Xpx ${tint(key, alpha)}` inline pattern.
 *
 * @example
 *   style={{ boxShadow: brandShadow("purple", 24) }}
 *   style={{ boxShadow: brandShadow("cyan", 32, 28) }} // size=32, alpha=28
 */
export function brandShadow(
  key: BrandKey,
  size = 24,
  alpha = 25,
): string {
  return `0 0 ${size}px ${tint(key, alpha)}`;
}

/** Same as brandShadow but for textShadow (color-only, no spread). */
export function brandTextShadow(
  key: BrandKey,
  size = 24,
  alpha = 30,
): string {
  return `0 0 ${size}px ${tint(key, alpha)}`;
}

/**
 * Semantic state colors. Use these instead of BRAND_VAR.<color> when the
 * intent is "this dot/icon means success/warning/error" rather than "this
 * piece of UI is purple/cyan/etc." Lets the success palette change once
 * (e.g. switch success from emerald to a more accessible green) without
 * hunting for hardcoded BRAND_VAR.emerald usages across the codebase.
 *
 *   style={{ color: STATE_COLORS.success }}
 *   style={{ backgroundColor: STATE_COLORS.warning }}
 */
export const STATE_COLORS = {
  success: BRAND_VAR.emerald,
  warning: BRAND_VAR.amber,
  error: BRAND_VAR.rose,
} as const;

/**
 * Tailwind class bundles for the "icon-in-a-rounded-square" pattern that
 * appears across feature cards, comparison cards, and scenario panels.
 *
 * Every section that renders `<div className="rounded-xl ring-1 ${bg} ${ring} ${glow}"><Icon className={text} /></div>`
 * should source these classes from here instead of redefining them per-section
 * (which is what the four redundant `iconBg`/`iconColor`/`iconRing`/`iconGlow`
 * fields on `Feature` did before this consolidation).
 *
 * Classes are literal so Tailwind's class-scanner sees them at build time.
 *
 *   const acc = ACCENT_ICON_CLASSES[feature.accent];
 *   <div className={`rounded-xl ring-1 ${acc.bg} ${acc.ring} ${acc.glow}`}>
 *     <Icon className={acc.text} />
 *   </div>
 */
export const ACCENT_ICON_CLASSES: Record<
  BrandKey,
  { bg: string; text: string; ring: string; glow: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    ring: "ring-cyan-500/8",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.08)]",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    ring: "ring-purple-500/8",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.08)]",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    ring: "ring-emerald-500/8",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.08)]",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    ring: "ring-amber-500/8",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.08)]",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    ring: "ring-rose-500/8",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.08)]",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    ring: "ring-blue-500/8",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.08)]",
  },
};

/** Map a legacy hex color to the closest brand key. */
export function hexToBrand(hex: string): BrandKey {
  const h = hex.toLowerCase();
  if (h.includes("06b6d4") || h.includes("0891b2") || h.includes("0e7490")) return "cyan";
  if (h.includes("a855f7") || h.includes("7c3aed") || h.includes("8b5cf6")) return "purple";
  if (h.includes("34d399") || h.includes("059669") || h.includes("10b981")) return "emerald";
  if (h.includes("fbbf24") || h.includes("f59e0b") || h.includes("b45309") || h.includes("f97316")) return "amber";
  if (h.includes("f43f5e") || h.includes("be123c") || h.includes("ef4444") || h.includes("f87171")) return "rose";
  if (h.includes("60a5fa") || h.includes("3b82f6") || h.includes("2563eb") || h.includes("5865f2") || h.includes("6366f1")) return "blue";
  return "cyan";
}
