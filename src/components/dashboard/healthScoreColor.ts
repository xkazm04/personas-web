interface HealthScoreColor {
  text: string;
  stroke: string;
  bg: string;
  hex: string;
}

// Resolves a 0-100 score to the canonical 4-tier color band from
// .claude/design.md §2, used by leaderboard/SLA/predictive so any score
// reads the same regardless of where it surfaces.
export function healthScoreColor(score: number): HealthScoreColor {
  if (score >= 80)
    return {
      text: "text-emerald-400",
      stroke: "stroke-emerald-400",
      bg: "bg-emerald-400",
      hex: "#34d399",
    };
  if (score >= 60)
    return {
      text: "text-cyan-400",
      stroke: "stroke-cyan-400",
      bg: "bg-cyan-400",
      hex: "#06b6d4",
    };
  if (score >= 40)
    return {
      text: "text-amber-400",
      stroke: "stroke-amber-400",
      bg: "bg-amber-400",
      hex: "#fbbf24",
    };
  return {
    text: "text-rose-400",
    stroke: "stroke-rose-400",
    bg: "bg-rose-400",
    hex: "#f43f5e",
  };
}
