// Lazy full-text search entry point for the guide.
//
// This is the ONLY module that pulls in GUIDE_CONTENT (~136KB of Markdown
// bodies across 11 category chunks). It is imported dynamically by
// SearchCombobox on the first search interaction, so the content never lands
// in the initial page/search bundle. The distilled body index is built once,
// on first call, and memoized for the life of the process.
//
// The index is DERIVED from the content modules at runtime — there is no
// generated artifact to keep in sync, so it can never go silently stale: add,
// edit, or remove a topic body and the next build of the index reflects it.

import { GUIDE_CONTENT } from "@/data/guide/content";
import { buildBodyIndex, searchBodyIndex, type BodyIndexEntry, type SearchResult } from "./guide-search";

let cachedIndex: BodyIndexEntry[] | null = null;

function getBodyIndex(): BodyIndexEntry[] {
  if (!cachedIndex) cachedIndex = buildBodyIndex(GUIDE_CONTENT);
  return cachedIndex;
}

/**
 * Full-text scan of article bodies for `query`, excluding topics already
 * surfaced by the title/tag/description ladder. Returns body-tier results
 * (matchType "body", score 1) with a matching-text excerpt, capped at `limit`.
 */
export function searchGuideBodies(query: string, excludeIds: string[], limit: number): SearchResult[] {
  if (limit <= 0) return [];
  return searchBodyIndex(getBodyIndex(), query, excludeIds, limit);
}
