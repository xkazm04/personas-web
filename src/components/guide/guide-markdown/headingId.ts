import { slugifyHeading } from "./slugify";

/**
 * The single source of truth for guide-heading anchor ids.
 *
 * The TOC (extractHeadings) and the renderer (parseBlocks) each walk the same
 * markdown and must produce IDENTICAL ids, or TOC links and copy-link anchors
 * scroll nowhere. They used to reimplement slugify + dedup + fallback
 * independently, and their fallbacks disagreed (a heading-local counter vs the
 * global emitted-element counter) so any unslugifiable heading (emoji-only,
 * CJK, punctuation-only) got different ids on each side.
 *
 * Create ONE assigner per document and call it for each heading in document
 * order; both consumers now share this, so the fallback counter and dedup stay
 * in lockstep. Pinned by heading-id.test.ts.
 */
export function createHeadingIdAssigner(): (rawText: string) => string {
  const usedSlugs = new Map<string, number>();
  let fallback = 0;
  return function assignHeadingId(rawText: string): string {
    const baseSlug = slugifyHeading(rawText) || `section-${fallback++}`;
    const count = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  };
}
