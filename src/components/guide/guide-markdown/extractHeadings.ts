import { headingsOf, parseGuide, sectionsOf } from "./parseGuide";

export type { GuideHeading, GuideSection } from "./parseGuide";

/** The TOC: a projection of the same tree the renderer draws, so ids always match. */
export function extractHeadings(content: string) {
  return headingsOf(parseGuide(content).doc);
}

/** The same tree sliced at its headings: what search indexes, so its anchors are rendered ids. */
export function extractSections(content: string) {
  return sectionsOf(parseGuide(content).doc);
}
