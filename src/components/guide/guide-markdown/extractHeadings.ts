import { headingsOf, parseGuide } from "./parseGuide";

export type { GuideHeading } from "./parseGuide";

/** The TOC: a projection of the same tree the renderer draws, so ids always match. */
export function extractHeadings(content: string) {
  return headingsOf(parseGuide(content).doc);
}
