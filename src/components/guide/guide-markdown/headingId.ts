/**
 * Heading anchor ids are assigned in one place, `parseGuide` (one assigner per
 * document, in document order), so the TOC and the rendered anchors cannot
 * diverge. Re-exported here for existing importers.
 */
export { createHeadingIdAssigner } from "./parseGuide";
