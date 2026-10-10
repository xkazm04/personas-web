// Lazy full-text search entry point for the guide.
//
// This is the ONLY module that pulls in GUIDE_CONTENT (~136KB of Markdown
// bodies across 11 category chunks) and the guide grammar that slices it. It
// is imported dynamically by SearchCombobox on the first search interaction,
// so neither lands in the initial page/search bundle. The distilled body index
// is built once, on first call, and memoized for the life of the process.
//
// The index is DERIVED from the content modules at runtime — there is no
// generated artifact to keep in sync, so it can never go silently stale: add,
// edit, or remove a topic body and the next build of the index reflects it.

import { GUIDE_CONTENT } from "@/data/guide/content";
import { extractSections } from "@/components/guide/guide-markdown/extractHeadings";
import { searchBodyIndex, type BodyIndexEntry, type SearchResult } from "./guide-search";

/**
 * Build the per-section body index from a topicId → Markdown content map.
 * Sections come from the guide grammar's tree (`extractSections`), the same
 * walk that ids the rendered headings, so a hit's anchor is always on the page.
 */
export function buildBodyIndex(content: Record<string, string>): BodyIndexEntry[] {
  const index: BodyIndexEntry[] = [];
  for (const topicId of Object.keys(content)) {
    for (const section of extractSections(content[topicId])) {
      if (!section.body && !section.text) continue;
      const head = section.id === null ? {} : { anchor: section.id, sectionTitle: section.text };
      index.push({ topicId, ...head, text: section.body, haystack: `${section.text}\n${section.body}`.toLowerCase() });
    }
  }
  return index;
}

let cachedIndex: BodyIndexEntry[] | null = null;

function getBodyIndex(): BodyIndexEntry[] {
  if (!cachedIndex) cachedIndex = buildBodyIndex(GUIDE_CONTENT);
  return cachedIndex;
}

/**
 * Full-text scan of article bodies for `query`, excluding topics already
 * surfaced by the title/tag/description ladder. Returns body-tier results
 * (matchType "body", score 1) with the hit's section anchor and a
 * matching-text excerpt, capped at `limit`.
 */
export function searchGuideBodies(query: string, excludeIds: string[], limit: number): SearchResult[] {
  if (limit <= 0) return [];
  return searchBodyIndex(getBodyIndex(), query, excludeIds, limit);
}
