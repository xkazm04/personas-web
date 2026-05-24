const colorToAccent: Record<string, "cyan" | "purple" | "emerald" | "amber"> = {
  "#06b6d4": "cyan",
  "#a855f7": "purple",
  "#34d399": "emerald",
  "#fbbf24": "amber",
};

export function accentFromColor(color: string | null): "cyan" | "purple" | "emerald" | "amber" {
  if (!color) return "cyan";
  return colorToAccent[color.toLowerCase()] ?? "cyan";
}
