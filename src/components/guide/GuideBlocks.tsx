/**
 * Thin re-export shim. The actual block components live in `./blocks/*` —
 * one file per component. Consumers (guide markdown renderer, topic pages)
 * continue to import from `@/components/guide/GuideBlocks` unchanged.
 */

export {
  CopyButton,
  Callout,
  StepWizard,
  KeyboardGrid,
  MarkdownTable,
  CompareBlock,
  ArchitectureDiagram,
  FeatureHighlight,
  Checklist,
  CodeCompare,
  UseCaseGrid,
} from "./blocks";
