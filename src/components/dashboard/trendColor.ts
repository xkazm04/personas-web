export type GoodDirection = "up" | "down";

/**
 * Resolve a numeric trend delta to a semantic brand color class.
 *
 * Centralizes the favorable→emerald / unfavorable→rose / neutral→muted mapping
 * onto brand tokens so a single theme change repaints every trend pill at once
 * (metric tiles, leaderboard deltas, …) instead of each display pinning its own
 * Tailwind palette literal.
 *
 * @param delta signed numeric change; its sign decides the direction of motion.
 * @param goodDirection which direction is favorable. `"up"` (default) treats a
 *   rise as good (success rate, executions); `"down"` treats a fall as good
 *   (cost, latency, error rate). The color reflects favorability, not the raw
 *   sign — callers that draw an arrow should derive it from the sign separately.
 * @param neutralAtZero when `true`, a delta of exactly `0` returns the muted
 *   token rather than the favorable color. Defaults to `false`, which keeps the
 *   `>= 0` favorable behavior tiles rely on.
 */
export function trendColor(
  delta: number,
  {
    goodDirection = "up",
    neutralAtZero = false,
  }: { goodDirection?: GoodDirection; neutralAtZero?: boolean } = {},
): string {
  if (neutralAtZero && delta === 0) return "text-muted-dark";
  const isRising = delta >= 0;
  const isFavorable = goodDirection === "up" ? isRising : !isRising;
  return isFavorable ? "text-brand-emerald" : "text-brand-rose";
}
