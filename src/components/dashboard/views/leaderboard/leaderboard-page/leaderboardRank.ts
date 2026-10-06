import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

/** Dimensions the podium can rank by: composite, or any single radar metric. */
export type RankDimension = "overall" | "reliability" | "speed" | "cost" | "quality";

export const RANK_DIMENSIONS: RankDimension[] = [
  "overall",
  "reliability",
  "speed",
  "cost",
  "quality",
];

export function dimensionScore(persona: LeaderboardPersona, dim: RankDimension): number {
  return dim === "overall" ? persona.composite : persona.metrics[dim];
}

/** Personas ranked best-first by the chosen dimension; ties broken by name. */
export function rankByDimension(
  personas: LeaderboardPersona[],
  dim: RankDimension,
): LeaderboardPersona[] {
  return [...personas].sort(
    (a, b) => dimensionScore(b, dim) - dimensionScore(a, dim) || a.name.localeCompare(b.name),
  );
}
