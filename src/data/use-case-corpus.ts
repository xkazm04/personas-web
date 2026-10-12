import corpus from "./use-case-corpus.json";

/**
 * The use-case corpus: the desktop app's real template catalog, compiled at a
 * pinned desktop commit by `scripts/compile-use-case-corpus.mjs` into
 * `use-case-corpus.json` (public fields only; the persona payload is never
 * emitted). Surfaces that sell "what agents do" project from this list, so
 * nothing is shown that the desktop cannot import. `check:use-case-corpus`
 * fails when the JSON is stale against the pinned commit.
 */
export interface CorpusTemplate {
  /** The desktop template id; resolves in the desktop's template catalog. */
  id: string;
  name: string;
  description: string;
  /** Desktop category (first of its list). */
  category: string;
  published: boolean;
  /** Concrete services, as `name`s in `src/data/connectors.ts`. */
  connectors: string[];
  /** `categories[].key`s of `src/data/connectors.ts` the template's connectors fall in. */
  connectorCategories: string[];
  /** Desktop connector roles/services with no web catalog row. */
  unresolvedConnectors: string[];
  useCaseCount: number;
}

// Invariant: the JSON is written only by the compiler, whose emit shape is CorpusTemplate.
export const USE_CASE_CORPUS = corpus as { desktopCommit: string; templates: CorpusTemplate[] };

/** Templates a release build of the desktop app lists. */
export const PUBLISHED_TEMPLATES: readonly CorpusTemplate[] = USE_CASE_CORPUS.templates.filter((t) => t.published);
