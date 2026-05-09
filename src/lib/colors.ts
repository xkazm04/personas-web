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

/**
 * Parse a #RRGGBB or #RGB hex string into an "r,g,b" triplet for use with
 * CSS variables consumed via rgba(var(--token), alpha). Returns null on
 * malformed input so callers can fall back to a brand default.
 */
export function hexToRgbTriplet(hex: string | null | undefined): string | null {
  if (!hex) return null;
  const cleaned = hex.trim().replace(/^#/, "");
  const full =
    cleaned.length === 3
      ? cleaned.split("").map((c) => c + c).join("")
      : cleaned;
  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
