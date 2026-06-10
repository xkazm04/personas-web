import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

export type LeaderboardSortField = "name" | "composite" | "delta";
export type SortDir = "asc" | "desc";

// True rank is always the composite ordering, regardless of how the table is
// currently sorted — ties broken by name so the badge numbers stay stable.
export function rankByComposite(
  personas: LeaderboardPersona[],
): Map<string, number> {
  const ordered = [...personas].sort(
    (a, b) => b.composite - a.composite || a.name.localeCompare(b.name),
  );
  const ranks = new Map<string, number>();
  ordered.forEach((persona, index) => ranks.set(persona.id, index + 1));
  return ranks;
}

// Numeric columns default to descending (best first); the name column defaults
// to ascending (A→Z). Name is always the tiebreaker for a deterministic order.
export function defaultDirFor(field: LeaderboardSortField): SortDir {
  return field === "name" ? "asc" : "desc";
}

export function sortPersonas(
  personas: LeaderboardPersona[],
  field: LeaderboardSortField,
  dir: SortDir,
): LeaderboardPersona[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...personas].sort((a, b) => {
    const cmp =
      field === "name"
        ? a.name.localeCompare(b.name)
        : a[field] - b[field] || a.name.localeCompare(b.name);
    return cmp * factor;
  });
}
