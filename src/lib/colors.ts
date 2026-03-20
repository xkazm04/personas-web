/** Brand color RGB triplets — single source of truth for inline styles and canvas rendering. */
export const BRAND_COLORS = {
  cyan: "6,182,212",
  purple: "168,85,247",
  emerald: "52,211,153",
  amber: "251,191,36",
  blue: "96,165,250",
  rose: "244,63,94",
} as const;

/** Build an rgba() string from a brand color key and alpha. */
export function rgba(rgb: string, alpha: number): string {
  return `rgba(${rgb},${alpha})`;
}

/** Color names accepted by StageSection gradient edge props. */
export type StageColor = keyof typeof BRAND_COLORS;

/** Alpha used for the top gradient edge (fromColor). */
const STAGE_FROM_ALPHA = 0.03;
/** Alpha used for the bottom gradient edge (toColor). */
const STAGE_TO_ALPHA = 0.04;

/** Resolve a StageColor name to an rgba string for a gradient edge. */
export function resolveStageColor(
  color: StageColor,
  edge: "from" | "to",
): string {
  return rgba(
    BRAND_COLORS[color],
    edge === "from" ? STAGE_FROM_ALPHA : STAGE_TO_ALPHA,
  );
}
