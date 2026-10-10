/**
 * Product facts the desktop app owns, typed for the showcase.
 *
 * The source of truth is `desktop-facts.json`, a snapshot written by
 * `scripts/sync-desktop-facts.mjs` from the desktop's own enumerations
 * (`npm run sync:desktop-facts`; `-- --check` diffs a live checkout against it).
 * A JSON import widens to `string[]`, so the literal tuples live here and
 * `desktopFacts.test.ts` pins them to the snapshot. A desktop change therefore
 * runs: drift check red -> re-sync -> this test red -> update these tuples ->
 * `tsc` red at every `satisfies Record<MemoryCategory | CellKey, ...>` until
 * the showcase covers the new key.
 */

/** desktop: src-tauri/core/src/validation/memory.rs `MEMORY_CATEGORIES`. */
export const MEMORY_CATEGORIES = ["fact", "preference", "instruction", "context", "learned", "constraint"] as const;
export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

/** desktop: src/lib/constants/dimensionMapping.ts `ALL_CELL_KEYS` (order is the product's). */
export const CELL_KEYS = [
  "use-cases",
  "connectors",
  "triggers",
  "human-review",
  "memory",
  "error-handling",
  "messages",
  "events",
] as const;
export type CellKey = (typeof CELL_KEYS)[number];
